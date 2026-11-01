/**
 * Zentrale „bezahlt"-Verarbeitung – wird sowohl von der Statusseite als auch
 * von der SumUp-Benachrichtigung aufgerufen. Läuft nur serverseitig.
 */
import type { supabaseAdmin } from "@/integrations/supabase/client.server";
import { contact } from "./contact";
import { operatorEmail, paymentConfirmedEmail, sendOrderEmail, type EmailLine, type EmailOrder } from "./order-email";

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
    },
    lines: (items ?? []).map(i => ({
      name: i.product_name, kind: i.product_kind, quantity: i.quantity,
      unitPriceCents: i.unit_price_cents, subtotalCents: i.subtotal_cents, validityMonths: i.validity_months,
    })),
  };
}

/**
 * Markiert eine Bestellung atomar als bezahlt und verschickt genau einmal
 * die Zahlungsbestätigung an Kunde und Betreiber. E-Mail-Fehler werten eine
 * bezahlte Bestellung nicht ab; Wiederholungen lösen keine Doppelsendung aus.
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

  const loaded = await loadOrderForEmail(admin, orderId);
  if (!loaded) return true;
  const { order, lines } = loaded;

  const customerMail = paymentConfirmedEmail(order, lines);
  if (await sendOrderEmail({ to: order.email, subject: customerMail.subject, html: customerMail.html })) {
    await admin.from("shop_orders").update({ paid_email_sent_at: now }).eq("id", orderId);
  }
  const opsMail = operatorEmail("payment", order, lines);
  if (await sendOrderEmail({ to: contact.email, subject: opsMail.subject, html: opsMail.html, replyTo: order.email })) {
    await admin.from("shop_orders").update({ operator_notified_at: now }).eq("id", orderId);
  }
  return true;
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
