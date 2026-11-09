import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { dispatchRequestSchema, dispatchMessage, dispatchPreviewToken, requireDispatchOperator, type DispatchOrder } from "./order-dispatch";

export const listDispatchOrders = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (error) throw new Error("Zugriffsprüfung nicht verfügbar.");
  requireDispatchOperator(data === true);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const result = await supabaseAdmin.from("shop_orders").select("id, full_name, email, status, paid_at, delivery, dispatch").order("created_at", { ascending: false }).limit(200);
  if (result.error) throw new Error("Bestellungen konnten nicht geladen werden.");
  return result.data as unknown as DispatchOrder[];
});

export const previewOrderDispatch = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input)).handler(async ({ context, data }) => {
  const role = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (role.error) throw new Error("Zugriffsprüfung nicht verfügbar.");
  requireDispatchOperator(role.data === true);
  const { dispatchRepository } = await import("./order-dispatch-repository.server");
  const { order, items } = await (await dispatchRepository()).load(data.id);
  if (order.dispatch) throw new Error("Bereitstellung bereits gespeichert. Bitte Ergebnis aktualisieren.");
  const mail = dispatchMessage(order, items);
  return { id: order.id, to: mail.to, subject: mail.subject, text: mail.text, mode: order.delivery, previewToken: await dispatchPreviewToken(mail) };
});

export const markOrderDispatched = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => dispatchRequestSchema.parse(input)).handler(async ({ context, data }) => {
  const role = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (role.error) throw new Error("Zugriffsprüfung nicht verfügbar.");
  requireDispatchOperator(role.data === true);
  const { dispatchRepository } = await import("./order-dispatch-repository.server");
  const { performDispatch } = await import("./order-dispatch.server");
  return performDispatch(await dispatchRepository(), data, context.userId);
});