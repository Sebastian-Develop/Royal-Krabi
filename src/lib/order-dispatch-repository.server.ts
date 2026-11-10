import type { DispatchRepository } from "./order-dispatch.server";
import type { DispatchOrder, DispatchRecord } from "./order-dispatch";
import type { Json } from "@/integrations/supabase/types";

export async function dispatchRepository(): Promise<DispatchRepository> {
  const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
  return {
    async load(id) {
      const order = await admin.from("shop_orders").select("id, full_name, email, status, paid_at, delivery, dispatch").eq("id", id).single();
      const items = await admin.from("shop_order_items").select("product_name, product_kind, quantity").eq("order_id", id);
      if (order.error || items.error) throw new Error("Bestellung konnte nicht geladen werden.");
      return { order: order.data as unknown as DispatchOrder, items: items.data ?? [] };
    },
    async claim(id, record, previous) {
      let update = admin.from("shop_orders").update({ dispatch: record as unknown as Json }).eq("id", id).eq("status", "paid").not("paid_at", "is", null);
      update = previous ? update.eq("dispatch", JSON.stringify(previous)) : update.is("dispatch", null);
      const result = await update.select("id");
      if (result.error) throw new Error("Versandstatus konnte nicht gespeichert werden; keine E-Mail ausgelöst.");
      return Boolean(result.data?.length);
    },
    async finish(id, record: DispatchRecord) {
      const result = await admin.from("shop_orders").update({ dispatch: record as unknown as Json }).eq("id", id);
      if (result.error) throw new Error("E-Mail-Ergebnis konnte nicht gespeichert werden. Versand nicht erneut auslösen; Ergebnis bei Resend prüfen.");
    },
  };
}