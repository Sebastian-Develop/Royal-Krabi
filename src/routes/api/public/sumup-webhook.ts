import { createFileRoute } from "@tanstack/react-router";

const json = (status: number, body: object) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

/**
 * Empfängt SumUp-Statusbenachrichtigungen (return_url beim Checkout).
 * SumUp signiert diese Aufrufe nicht – deshalb wird keine eingehende
 * Statusbehauptung übernommen. Der Status wird immer unabhängig per
 * SumUp-API nachgeprüft, und nur bei uns gespeicherte Checkout-IDs
 * werden überhaupt verarbeitet.
 */
export const Route = createFileRoute("/api/public/sumup-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Record<string, unknown>;
        try { body = (await request.json()) as Record<string, unknown>; }
        catch { return json(400, { error: "Ungültige Anfrage." }); }
        const checkoutId = body["id"] ?? body["checkout_id"];
        if (typeof checkoutId !== "string" || !checkoutId) return json(400, { error: "Checkout-ID fehlt." });

        const apiKey = process.env["SUMUP_API_KEY"];
        if (!apiKey) return json(500, { error: "Zahlungsdienst nicht eingerichtet." });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { sumupGetCheckoutStatus } = await import("@/lib/shop-checkout.server");
        const { finalizePaidOrder } = await import("@/lib/shop-payment.server");

        const { data: attempt } = await supabaseAdmin
          .from("shop_payment_attempts")
          .select("id, order_id")
          .eq("sumup_checkout_id", checkoutId)
          .maybeSingle();
        if (!attempt) return json(200, { ignored: true }); // unbekannte Checkout-ID

        try {
          const status = await sumupGetCheckoutStatus(apiKey, checkoutId);
          if (status === "PAID") {
            await supabaseAdmin.from("shop_payment_attempts").update({ status: "PAID", verified_at: new Date().toISOString() }).eq("id", attempt.id);
            await finalizePaidOrder(supabaseAdmin, attempt.order_id);
            return json(200, { status: "paid" });
          }
          if (status === "FAILED" || status === "EXPIRED") {
            await supabaseAdmin.from("shop_payment_attempts").update({ status }).eq("id", attempt.id);
            await supabaseAdmin.from("shop_orders").update({ status: "payment_failed" }).eq("id", attempt.order_id).eq("status", "awaiting_payment");
          }
          return json(200, { status: status.toLowerCase() });
        } catch (error) {
          console.error("[sumup-webhook] Statusprüfung fehlgeschlagen:", error instanceof Error ? error.message : "unbekannt");
          return json(502, { error: "Statusprüfung derzeit nicht möglich." });
        }
      },
    },
  },
});
