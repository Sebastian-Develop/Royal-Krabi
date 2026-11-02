import { createServerFn } from "@tanstack/react-start";
import { looksLikeOrderId, withdrawalDeclaration, withdrawalRequestSchema } from "./withdrawal-request";

/** Stores an electronic withdrawal with server timestamp. Sends no email. */
export const submitWithdrawal = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => withdrawalRequestSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let matchedOrderId: string | null = null;
    if (looksLikeOrderId(data.orderReference)) {
      const { data: order } = await supabaseAdmin.from("shop_orders").select("id")
        .eq("id", data.orderReference.toLowerCase()).ilike("email", data.email).maybeSingle();
      matchedOrderId = order?.id ?? null;
    }
    const { data: row, error } = await supabaseAdmin.from("withdrawal_requests").insert({
      full_name: data.fullName, email: data.email, order_reference: data.orderReference,
      declaration: withdrawalDeclaration, remark: data.remark ?? "", matched_order_id: matchedOrderId,
    }).select("id, received_at").single();
    if (error || !row) {
      console.error("withdrawal insert failed", error);
      return { ok: false as const, error: "Der Widerruf konnte gerade nicht gespeichert werden. Bitte versuchen Sie es erneut oder senden Sie ihn per E-Mail an kontakt@royalkrabi-thaimassage.de." };
    }
    return { ok: true as const, id: row.id, receivedAt: row.received_at, fullName: data.fullName, email: data.email, orderReference: data.orderReference };
  });
