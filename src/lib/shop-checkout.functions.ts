import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { buildOrderLines, centsToAmount, checkoutRequestSchema, orderTotalCents } from "./shop-checkout";

const GENERIC_ERROR = "Die Bestellung konnte nicht übermittelt werden. Bitte versuchen Sie es erneut oder kontaktieren Sie uns telefonisch oder per E-Mail.";

export type CreateCheckoutResult =
  | { ok: true; orderId: string; token: string; hostedUrl: string }
  | { ok: false; error: string };

/**
 * Nimmt eine Bestellung entgegen: prüft Eingaben und Preise serverseitig,
 * speichert Bestellung, Positionen und Zahlungsversuch und erstellt den
 * SumUp Hosted Checkout. Erfolg bedeutet: Weiterleitung zur Zahlungsseite,
 * noch keine bezahlte Bestellung.
 */
export const createShopCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => checkoutRequestSchema.parse(input))
  .handler(async ({ data }): Promise<CreateCheckoutResult> => {
    const built = buildOrderLines(data.items);
    if ("error" in built) return { ok: false, error: built.error };
    const totalCents = orderTotalCents(built.lines);

    const apiKey = process.env["SUMUP_API_KEY"];
    if (!apiKey) return { ok: false, error: "Die Online-Zahlung ist derzeit nicht erreichbar. Bitte kontaktieren Sie uns telefonisch oder per E-Mail." };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sumupCreateCheckout, sumupMerchantCode } = await import("./shop-checkout.server");

    const { data: order, error: orderError } = await supabaseAdmin
      .from("shop_orders")
      .insert({
        status: "awaiting_payment",
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        delivery: data.delivery,
        street: data.street,
        postal_code: data.postalCode,
        city: data.city,
        country: data.country,
        recipient: data.recipient,
        gift_text: data.giftText,
        notes: data.notes,
        total_cents: totalCents,
        currency: "EUR",
      })
      .select("id, access_token")
      .single();
    if (orderError || !order) {
      console.error("[shop-checkout] Bestellung konnte nicht gespeichert werden:", orderError?.message);
      return { ok: false, error: GENERIC_ERROR };
    }

    const { error: itemsError } = await supabaseAdmin.from("shop_order_items").insert(
      built.lines.map(line => ({
        order_id: order.id,
        product_id: line.productId,
        product_name: line.name,
        product_kind: line.kind,
        quantity: line.quantity,
        unit_price_cents: line.unitPriceCents,
        subtotal_cents: line.subtotalCents,
      })),
    );
    const { data: attempt, error: attemptError } = itemsError
      ? { data: null, error: itemsError }
      : await supabaseAdmin.from("shop_payment_attempts").insert({ order_id: order.id, status: "PENDING" }).select("id").single();
    if (attemptError || !attempt) {
      console.error("[shop-checkout] Positionen/Zahlungsversuch konnten nicht gespeichert werden:", attemptError?.message);
      await supabaseAdmin.from("shop_orders").delete().eq("id", order.id);
      return { ok: false, error: GENERIC_ERROR };
    }

    const origin = new URL(getRequest().url).origin;
    const redirectUrl = `${origin}/bestellung-bestaetigt?bestellung=${order.id}&schluessel=${order.access_token}`;
    try {
      const merchantCode = await sumupMerchantCode(apiKey);
      const checkout = await sumupCreateCheckout(apiKey, {
        amount: centsToAmount(totalCents),
        reference: order.id,
        description: "Royal Krabi Gutschein-/Abo-Bestellung",
        merchantCode,
        redirectUrl,
      });
      await supabaseAdmin
        .from("shop_payment_attempts")
        .update({ sumup_checkout_id: checkout.id, hosted_checkout_url: checkout.hostedUrl, status: checkout.status })
        .eq("id", attempt.id);
      return { ok: true, orderId: order.id, token: order.access_token, hostedUrl: checkout.hostedUrl };
    } catch (error) {
      console.error("[shop-checkout] SumUp-Checkout fehlgeschlagen:", error instanceof Error ? error.message : "unbekannt");
      await supabaseAdmin.from("shop_payment_attempts").update({ status: "FAILED" }).eq("id", attempt.id);
      await supabaseAdmin.from("shop_orders").update({ status: "payment_setup_failed" }).eq("id", order.id);
      return { ok: false, error: "Die Zahlungsseite konnte nicht erstellt werden. Es wurde keine Zahlung ausgelöst. Bitte versuchen Sie es erneut oder kontaktieren Sie uns." };
    }
  });

export type ShopOrderStatus = "paid" | "pending" | "failed" | "not_found";

/**
 * Prüft den Zahlungsstatus einer Bestellung unabhängig bei SumUp.
 * Nur mit Bestellnummer und geheimem Zugriffsschlüssel abrufbar;
 * „bezahlt" wird ausschließlich nach bestätigtem SumUp-Status gemeldet.
 */
export const getShopOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ orderId: z.string().uuid(), token: z.string().uuid() }).parse(input))
  .handler(async ({ data }): Promise<{ status: ShopOrderStatus }> => {
    const apiKey = process.env["SUMUP_API_KEY"];
    if (!apiKey) return { status: "pending" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sumupGetCheckoutStatus } = await import("./shop-checkout.server");

    const { data: order } = await supabaseAdmin
      .from("shop_orders")
      .select("id, status, access_token")
      .eq("id", data.orderId)
      .maybeSingle();
    if (!order || order.access_token !== data.token) return { status: "not_found" };
    if (order.status === "paid") return { status: "paid" };

    const { data: attempt } = await supabaseAdmin
      .from("shop_payment_attempts")
      .select("id, sumup_checkout_id")
      .eq("order_id", order.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!attempt?.sumup_checkout_id) return { status: "pending" };

    try {
      const status = await sumupGetCheckoutStatus(apiKey, attempt.sumup_checkout_id);
      if (status === "PAID") {
        await supabaseAdmin.from("shop_orders").update({ status: "paid" }).eq("id", order.id).neq("status", "paid");
        await supabaseAdmin.from("shop_payment_attempts").update({ status: "PAID", verified_at: new Date().toISOString() }).eq("id", attempt.id);
        return { status: "paid" };
      }
      if (status === "FAILED" || status === "EXPIRED") {
        await supabaseAdmin.from("shop_payment_attempts").update({ status }).eq("id", attempt.id);
        await supabaseAdmin.from("shop_orders").update({ status: "payment_failed" }).eq("id", order.id).eq("status", "awaiting_payment");
        return { status: "failed" };
      }
      return { status: "pending" };
    } catch (error) {
      console.error("[shop-checkout] Statusabfrage fehlgeschlagen:", error instanceof Error ? error.message : "unbekannt");
      return { status: "pending" };
    }
  });
