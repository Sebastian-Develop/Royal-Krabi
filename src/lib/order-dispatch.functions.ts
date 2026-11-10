import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { dispatchRequestSchema, dispatchMessage, dispatchPreviewToken, requireDispatchOperator, type DispatchOrder } from "./order-dispatch";

export const listDispatchOrders = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (error) throw new Error("Zugriffsprüfung nicht verfügbar.");
  requireDispatchOperator(data === true);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const result = await supabaseAdmin.from("shop_orders").select("id, created_at, full_name, email, phone, street, postal_code, city, total_cents, status, paid_at, delivery, dispatch").order("created_at", { ascending: false }).limit(200);
  if (result.error) throw new Error("Bestellungen konnten nicht geladen werden.");
  const ids = result.data.map(o => o.id);
  if (!ids.length) return [] as DispatchOrder[];
  const [items, events] = await Promise.all([
    supabaseAdmin.from("shop_order_items").select("order_id, product_name, product_kind, quantity").in("order_id", ids),
    supabaseAdmin.from("shop_email_events").select("order_id, created_at, kind, success, error, provider_id, provider_status").in("order_id", ids).order("created_at"),
  ]);
  if (items.error || events.error) throw new Error("Bestellpositionen oder E-Mail-Verlauf konnten nicht geladen werden.");
  return result.data.map(o => ({ ...o, items: items.data.filter(i => i.order_id === o.id), email_history: events.data.filter(e => e.order_id === o.id).map(e => ({ at: e.created_at, kind: e.kind, status: e.provider_status ?? (e.success ? "accepted" : "unknown_failure"), providerId: e.provider_id, error: e.error })) })) as unknown as DispatchOrder[];
});

export const previewOrderDispatch = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => z.object({ id: z.string().uuid(), retry: z.boolean().optional() }).parse(input)).handler(async ({ context, data }) => {
  const role = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (role.error) throw new Error("Zugriffsprüfung nicht verfügbar.");
  requireDispatchOperator(role.data === true);
  const { dispatchRepository } = await import("./order-dispatch-repository.server");
  const { order, items } = await (await dispatchRepository()).load(data.id);
  if (order.dispatch && !(data.retry && order.dispatch.emailStatus === "failed")) throw new Error("Bereitstellung bereits gespeichert. Bitte Ergebnis aktualisieren.");
  const mail = dispatchMessage(order, items);
  return { id: order.id, to: mail.to, subject: mail.subject, text: mail.text, mode: order.delivery, retry: data.retry === true, previewToken: await dispatchPreviewToken(mail) };
});

export const markOrderDispatched = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => dispatchRequestSchema.parse(input)).handler(async ({ context, data }) => {
  const role = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (role.error) throw new Error("Zugriffsprüfung nicht verfügbar.");
  requireDispatchOperator(role.data === true);
  const { dispatchRepository } = await import("./order-dispatch-repository.server");
  const { performDispatch } = await import("./order-dispatch.server");
  return performDispatch(await dispatchRepository(), data, context.userId);
});
/** Pickup completion is an internal, explicitly confirmed action and sends no email. */
export const markOrderCollected = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => z.object({ id: z.string().uuid(), confirmed: z.literal(true) }).parse(input)).handler(async ({ context, data }) => {
  const role = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (role.error) throw new Error("Zugriffsprüfung nicht verfügbar.");
  requireDispatchOperator(role.data === true);
  const { dispatchRepository } = await import("./order-dispatch-repository.server");
  const repo = await dispatchRepository(); const { order } = await repo.load(data.id);
  if (order.status !== "paid" || !order.paid_at || order.delivery !== "pickup" || !order.dispatch) throw new Error("Nur bereits bereitliegende bezahlte Abholbestellungen können als abgeholt markiert werden.");
  const record = { ...order.dispatch, collectedAt: order.dispatch.collectedAt ?? new Date().toISOString() };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const saved = await supabaseAdmin.from("shop_orders").update({ dispatch: record as unknown as import("@/integrations/supabase/types").Json }).eq("id", data.id).eq("dispatch", JSON.stringify(order.dispatch)).select("id");
  if (saved.error || !saved.data.length) throw new Error("Bestelldaten geändert. Bitte aktualisieren.");
  return { ok: true };
});

/** Retry only a definite provider rejection of the existing internal paid-order notice. */
export const retryOperatorNotice = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => z.object({ id: z.string().uuid(), confirmed: z.literal(true) }).parse(input)).handler(async ({ context, data }) => {
  const role = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (role.error) throw new Error("Zugriffsprüfung nicht verfügbar."); requireDispatchOperator(role.data === true);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { loadOrderForEmail } = await import("./shop-payment.server");
  const loaded = await loadOrderForEmail(supabaseAdmin, data.id);
  if (!loaded?.order.paidAt) throw new Error("Keine bestätigte Zahlung.");
  const order = await supabaseAdmin.from("shop_orders").select("operator_notified_at, status").eq("id", data.id).single();
  if (order.error || order.data.status !== "paid" || order.data.operator_notified_at) throw new Error("Interner Hinweis bereits angenommen oder Bestellung nicht bezahlt.");
  const last = await supabaseAdmin.from("shop_email_events").select("id, provider_status, retry_claimed_at").eq("order_id", data.id).eq("kind", "operator_notice").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (last.error || !last.data || last.data.provider_status !== "failed" || last.data.retry_claimed_at) throw new Error("Nur eindeutig abgelehnte, noch nicht wiederholte Hinweise können erneut gesendet werden.");
  const claim = await supabaseAdmin.from("shop_email_events").update({ retry_claimed_at: new Date().toISOString() }).eq("id", last.data.id).is("retry_claimed_at", null).select("id");
  if (claim.error || !claim.data?.length) throw new Error("Wiederholung bereits in Bearbeitung.");
  const { operatorEmail, sendOrderEmailResult } = await import("./order-email");
  const { operatorNotificationEmail } = await import("./contact");
  const outcome = await sendOrderEmailResult({ to: operatorNotificationEmail, ...operatorEmail(loaded.order, loaded.lines), replyTo: loaded.order.email, idempotencyKey: `operator-retry-${last.data.id}` });
  const saved = await supabaseAdmin.from("shop_email_events").insert({ order_id: data.id, kind: "operator_notice", success: outcome.accepted, error: outcome.error, provider_id: outcome.providerId, provider_status: outcome.status });
  if (saved.error) throw new Error("Anbieterergebnis konnte nicht gespeichert werden; nicht erneut auslösen.");
  if (outcome.accepted) await supabaseAdmin.from("shop_orders").update({ operator_notified_at: new Date().toISOString() }).eq("id", data.id);
  return { status: outcome.status, error: outcome.error };
});
