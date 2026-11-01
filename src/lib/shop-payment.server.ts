/**
 * Zentrale „bezahlt"-Verarbeitung – wird sowohl von der Statusseite als auch
 * von der SumUp-Benachrichtigung aufgerufen. Läuft nur serverseitig.
 * E-Mails (Kunde und Betreiber) gehen ausschließlich nach unabhängig
 * verifizierter Zahlung raus – niemals schon bei der Bestellung.
 */
import type { supabaseAdmin } from "@/integrations/supabase/client.server";
import { contact } from "./contact";
import { operatorEmail, paymentConfirmedEmail, sendOrderEmail, type EmailAttachment, type EmailLine, type EmailOrder } from "./order-email";

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
    },
    lines: (items ?? []).map(i => ({
      name: i.product_name, kind: i.product_kind, quantity: i.quantity,
      unitPriceCents: i.unit_price_cents, subtotalCents: i.subtotal_cents, validityMonths: i.validity_months,
    })),
  };
}

/** Protokolliert jeden Versandversuch – ohne E-Mail-Inhalte, nur Art und Ergebnis. */
async function logEmailEvent(admin: Admin, orderId: string, kind: string, success: boolean, error?: string): Promise<void> {
  await admin.from("shop_email_events").insert({ order_id: orderId, kind, success, error: error ?? null });
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

/** Erstellt die vier Bestell-PDFs; ein Fehler hier entwertet die Zahlung nicht. */
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
  if (!loaded) return;
  const { order, lines } = loaded;
  const now = new Date().toISOString();

  let attachments: EmailAttachment[] = [];
  try {
    attachments = await buildAttachments(order, lines);
  } catch (error) {
    await logEmailEvent(admin, orderId, "pdf_build", false, error instanceof Error ? error.message : "unbekannt");
  }

  const customerMail = paymentConfirmedEmail(order, lines);
  const customerOk = await sendOrderEmail({
    to: order.email, subject: customerMail.subject, html: customerMail.html, text: customerMail.text, attachments,
  });
  await logEmailEvent(admin, orderId, "customer_confirmation", customerOk, customerOk ? undefined : "Versand fehlgeschlagen");
  if (customerOk) await admin.from("shop_orders").update({ paid_email_sent_at: now }).eq("id", orderId);

  const opsMail = operatorEmail(order, lines);
  const opsOk = await sendOrderEmail({ to: contact.email, subject: opsMail.subject, html: opsMail.html, replyTo: order.email });
  await logEmailEvent(admin, orderId, "operator_notice", opsOk, opsOk ? undefined : "Versand fehlgeschlagen");
  if (opsOk) await admin.from("shop_orders").update({ operator_notified_at: now }).eq("id", orderId);
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
    .select("id");
  if (!updated?.length) return false; // bereits bezahlt – keine doppelte Bestätigung

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
  const { sumupGetCheckoutStatus } = await import("./shop-checkout.server");
  const { data: attempts } = await admin
    .from("shop_payment_attempts")
    .select("id, order_id, sumup_checkout_id")
    .eq("status", "PENDING")
    .not("sumup_checkout_id", "is", null)
    .limit(50);
  let paid = 0;
  for (const attempt of attempts ?? []) {
    try {
      const status = await sumupGetCheckoutStatus(apiKey, attempt.sumup_checkout_id as string);
      if (status === "PAID") {
        await admin.from("shop_payment_attempts").update({ status: "PAID", verified_at: new Date().toISOString() }).eq("id", attempt.id);
        if (await finalizePaidOrder(admin, attempt.order_id)) paid++;
      } else if (status === "FAILED" || status === "EXPIRED") {
        await admin.from("shop_payment_attempts").update({ status }).eq("id", attempt.id);
        await admin.from("shop_orders").update({ status: "payment_failed" }).eq("id", attempt.order_id).eq("status", "awaiting_payment");
      }
    } catch (error) {
      console.error("[shop-reconcile] Statusabfrage fehlgeschlagen:", error instanceof Error ? error.message : "unbekannt");
    }
  }
  return { checked: attempts?.length ?? 0, paid };
}
