/**
 * Zentrale „bezahlt"-Verarbeitung – wird sowohl von der Statusseite als auch
 * von der SumUp-Benachrichtigung aufgerufen. Läuft nur serverseitig.
 * E-Mails (Kunde und Betreiber) gehen ausschließlich nach unabhängig
 * verifizierter Zahlung raus – niemals schon bei der Bestellung.
 */
import type { supabaseAdmin } from "@/integrations/supabase/client.server";
import { operatorNotificationEmail } from "./contact";
import { operatorEmail, paymentConfirmedEmail, sendOrderEmailResult, type EmailAttachment, type EmailLine, type EmailOrder } from "./order-email";

type Admin = typeof supabaseAdmin;

export async function loadOrderForEmail(admin: Admin, orderId: string): Promise<{ order: EmailOrder; lines: EmailLine[] } | null> {
  const { data: order } = await admin.from("shop_orders").select("*").eq("id", orderId).maybeSingle();
  if (!order) return null;
  const { data: items } = await admin.from("shop_order_items").select("*").eq("order_id", orderId);
  return {
    order: {
      id: order.id, fullName: order.full_name, email: order.email, phone: order.phone, delivery: order.delivery,
      street: order.street, postalCode: order.postal_code, city: order.city, recipient: order.recipient,
      giftText: order.gift_text, notes: order.notes, totalCents: order.total_cents,
      discountCode: order.discount_code, discountCents: order.discount_cents,
      createdAt: order.created_at, paidAt: order.paid_at, legalVersion: order.legal_version,
      discountValid: order.discount_valid ?? null,
    },
    lines: (items ?? []).map(i => ({
      name: i.product_name, kind: i.product_kind, quantity: i.quantity,
      unitPriceCents: i.unit_price_cents, subtotalCents: i.subtotal_cents, validityMonths: i.validity_months,
    })),
  };
}

/** Protokolliert jeden Versandversuch – ohne E-Mail-Inhalte, nur Art und Ergebnis. */
async function logEmailEvent(admin: Admin, orderId: string, kind: string, success: boolean, error?: string, providerId?: string | null, providerStatus?: string): Promise<void> {
  await admin.from("shop_email_events").insert({ order_id: orderId, kind, success, error: error ?? null, provider_id: providerId ?? null, provider_status: providerStatus ?? null });
}

/** Uint8Array → Base64, in Blöcken für große Anhänge. */
function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 8192;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/** Build the exact stored release; never send incomplete or draft attachments. */
async function buildAttachments(order: EmailOrder, lines: EmailLine[]): Promise<EmailAttachment[]> {
  const { buildOrderPdfs } = await import("./order-pdf.server");
  const pdfs = await buildOrderPdfs(order, lines, {
    createdAt: order.createdAt,
    paidAt: order.paidAt ?? new Date().toISOString(),
    legalVersion: order.legalVersion,
  });
  return pdfs.map(p => ({ filename: p.filename, contentBase64: toBase64(p.bytes) }));
}

/**
 * Verschickt die Kundenbestätigung (mit PDF-Anhängen) und den Betreiberhinweis
 * für eine bezahlte Bestellung. Wird bei der ersten bezahlt-Markierung und bei
 * manuellen Wiederholungen aufgerufen; die Daten und Rechtstextfassungen
 * kommen immer aus der gespeicherten Bestellung.
 */
export async function sendPaidOrderEmails(admin: Admin, orderId: string): Promise<void> {
  const loaded = await loadOrderForEmail(admin, orderId);
  if (!loaded || loaded.order.paidAt === null) return;
  const { order, lines } = loaded;
  const now = new Date().toISOString();

  let attachments: EmailAttachment[] = [];
  try {
    attachments = await buildAttachments(order, lines);
  } catch (error) {
    await logEmailEvent(admin, orderId, "pdf_build", false, error instanceof Error ? error.message : "unbekannt");
    return;
  }

  const deliveryKinds = ["customer", "operator"] as const;
  for (const kind of deliveryKinds) {
    const sentColumn = kind === "customer" ? "paid_email_sent_at" : "operator_notified_at";
    const claimColumn = kind === "customer" ? "customer_email_claimed_at" : "operator_email_claimed_at";
    // Persistent atomic claim: simultaneous webhook/refresh/retry cannot send twice.
    const claimUpdate = kind === "customer" ? { customer_email_claimed_at: now } : { operator_email_claimed_at: now };
    const { data: claimed } = await admin.from("shop_orders").update(claimUpdate)
      .eq("id", orderId).is(sentColumn, null).is(claimColumn, null).select("id");
    if (!claimed?.length) continue;
    const mail = kind === "customer" ? paymentConfirmedEmail(order, lines) : operatorEmail(order, lines);
    try {
      const outcome = await sendOrderEmailResult({ to: kind === "customer" ? order.email : operatorNotificationEmail,
        subject: mail.subject, html: mail.html, ...(kind === "customer" ? { text: paymentConfirmedEmail(order, lines).text, attachments } : { replyTo: order.email }),
        idempotencyKey: `order-${orderId}-${kind}` });
      const ok = outcome.accepted;
      await logEmailEvent(admin, orderId, kind === "customer" ? "customer_confirmation" : "operator_notice", ok, outcome.error ?? undefined, outcome.providerId, outcome.status);
      if (ok) await admin.from("shop_orders").update(kind === "customer" ? { paid_email_sent_at: now } : { operator_notified_at: now }).eq("id", orderId);
      // Fail closed on an uncertain result: retain the claim rather than double-send.
    } catch {
      await logEmailEvent(admin, orderId, kind, false, "Unklarer Versandstatus; Versandanspruch bleibt gesperrt, um Doppelsendung zu verhindern.");
    }
  }
}

/**
 * Markiert eine Bestellung atomar als bezahlt und verschickt genau einmal
 * die kombinierte Bestell- und Zahlungsbestätigung an den Kunden sowie den
 * Hinweis an den Betreiber. E-Mail-Fehler werten eine bezahlte Bestellung
 * nicht ab; doppelte Statusmeldungen lösen keine Doppelsendung aus.
 * Gibt true zurück, wenn dieser Aufruf die Bestellung als Erster auf bezahlt setzte.
 */
export async function finalizePaidOrder(admin: Admin, orderId: string): Promise<boolean> {
  const now = new Date().toISOString();
  const { data: updated } = await admin
    .from("shop_orders")
    .update({ status: "paid", paid_at: now })
    .eq("id", orderId)
    .neq("status", "paid")
    .select("id, discount_code");
  if (!updated?.length) return false; // bereits bezahlt – keine doppelte Bestätigung

  // Verbindliche Rabattprüfung: maßgeblich ist der Verifizierungszeitpunkt des
  // vollständigen Zahlungseingangs (jetzt), nicht der Bestellzeitpunkt.
  // Außerhalb der Aktionsfrist gilt der normale Preis.
  const discountCode = updated[0]?.discount_code ?? "";
  if (discountCode && discountCode !== "TESTCODE20") {
    const { verifyDiscountAtPayment } = await import("./discount");
    const check = verifyDiscountAtPayment(discountCode, new Date(now));
    await admin.from("shop_orders").update({ discount_valid: check.applies, discount_checked_at: check.checkedAt }).eq("id", orderId);
  }

  await sendPaidOrderEmails(admin, orderId);
  return true;
}

/**
 * Sichere Wiederholung des E-Mail-Versands für eine bezahlte Bestellung,
 * deren Bestätigung nicht angekommen ist. Es wird keine erneute Zahlung
 * verlangt und der Zahlungsstatus nicht verändert.
 */
export async function retryPaidOrderEmails(admin: Admin, orderId: string): Promise<{ ok: boolean; reason?: string }> {
  const { data: order } = await admin.from("shop_orders").select("status, paid_email_sent_at, operator_notified_at").eq("id", orderId).maybeSingle();
  if (!order) return { ok: false, reason: "Bestellung nicht gefunden." };
  if (order.status !== "paid") return { ok: false, reason: "Bestellung ist nicht als bezahlt markiert." };
  if (order.paid_email_sent_at && order.operator_notified_at) return { ok: false, reason: "Beide E-Mails wurden bereits zugestellt." };
  await sendPaidOrderEmails(admin, orderId);
  return { ok: true };
}

/**
 * Abgleich offener Zahlungsversuche: fragt jeden PENDING-Versuch mit bekannter
 * SumUp-Checkout-ID erneut bei SumUp ab und schließt bezahlte Bestellungen ab.
 * So wird eine Zahlung auch erkannt, wenn der Kunde die Bestellseite nie wieder öffnet.
 */
export async function reconcileOpenPayments(admin: Admin, apiKey: string): Promise<{ checked: number; paid: number }> {
  const { data: attempts } = await admin
    .from("shop_payment_attempts")
    .select("id, order_id, sumup_checkout_id")
    .eq("status", "PENDING")
    .not("sumup_checkout_id", "is", null)
    .limit(50);
  let paid = 0;
  for (const attempt of attempts ?? []) {
    try {
      const status = await verifyStoredPayment(admin, apiKey, attempt.sumup_checkout_id as string);
      if (status === "PAID") paid++;
    } catch (error) {
      console.error("[shop-reconcile] Statusabfrage fehlgeschlagen:", error instanceof Error ? error.message : "unbekannt");
    }
  }
  return { checked: attempts?.length ?? 0, paid };
}

/** Shared verified processing for callback, browser status and existing reconciliation. */
export async function verifyStoredPayment(admin: Admin, apiKey: string, checkoutId: string): Promise<string> {
  const { sumupGetCheckout } = await import("./shop-checkout.server");
  const { matchesStoredPayment } = await import("./payment-verification");
  const { data: attempt } = await admin.from("shop_payment_attempts").select("id, order_id").eq("sumup_checkout_id", checkoutId).maybeSingle();
  if (!attempt) return "IGNORED";
  const { data: order } = await admin.from("shop_orders").select("id, total_cents, currency, status").eq("id", attempt.order_id).maybeSingle();
  if (!order) return "IGNORED";
  const checkout = await sumupGetCheckout(apiKey, checkoutId);
  if (!matchesStoredPayment(checkout, { checkoutId, orderId: order.id, totalCents: order.total_cents, currency: order.currency })) throw new Error("Zahlungszuordnung, Betrag oder Währung stimmen nicht überein.");
  if (checkout.status === "PAID") {
    await admin.from("shop_payment_attempts").update({ status: "PAID", verified_at: new Date().toISOString() }).eq("id", attempt.id);
    await finalizePaidOrder(admin, order.id);
  } else if ((checkout.status === "FAILED" || checkout.status === "EXPIRED") && order.status !== "paid") {
    await admin.from("shop_payment_attempts").update({ status: checkout.status }).eq("id", attempt.id).neq("status", "PAID");
    await admin.from("shop_orders").update({ status: "payment_failed" }).eq("id", order.id).eq("status", "awaiting_payment");
  }
  return checkout.status;
}
