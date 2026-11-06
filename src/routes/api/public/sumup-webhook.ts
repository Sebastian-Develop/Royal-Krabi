import { z } from "zod";
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
        let checkoutId: string;
        try {
          const body = z.object({ id: z.string().uuid().optional(), checkout_id: z.string().uuid().optional() }).parse(await request.json());
          const id = body.id ?? body.checkout_id;
          if (!id) return json(400, { error: "Checkout-ID fehlt." });
          checkoutId = id;
        } catch { return json(400, { error: "Ungültige Anfrage." }); }

        const apiKey = process.env["SUMUP_API_KEY"];
        if (!apiKey) return json(500, { error: "Zahlungsdienst nicht eingerichtet." });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { verifyStoredPayment } = await import("@/lib/shop-payment.server");
        try {
          await verifyStoredPayment(supabaseAdmin, apiKey, checkoutId);
          return json(200, { received: true });
        } catch (error) {
          console.error("[sumup-webhook] Statusprüfung fehlgeschlagen:", error instanceof Error ? error.message : "unbekannt");
          return json(502, { error: "Statusprüfung derzeit nicht möglich." });
        }
      },
    },
  },
});
