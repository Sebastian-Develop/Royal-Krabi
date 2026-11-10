import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireOperatorRole, withdrawalHandlingSchema } from "./withdrawal-admin";

export const listWithdrawals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: admin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (roleError) throw new Error("Zugriffsprüfung nicht verfügbar.");
    requireOperatorRole(admin === true);
    const { data, error } = await context.supabase.from("withdrawal_requests")
      .select("id, received_at, full_name, email, order_reference, declaration, remark, matched_order_id, handling_status, internal_notes, processed_at, updated_at, email_history")
      .order("received_at", { ascending: false });
    if (error) throw new Error("Widerrufe konnten nicht geladen werden.");
    const ids = data.map(r => r.matched_order_id).filter((id): id is string => Boolean(id));
    if (!ids.length) return data.map(r => ({ ...r, order_evidence: null }));
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const evidence = await supabaseAdmin.from("shop_orders").select("id, paid_at, paid_email_sent_at, dispatch").in("id", ids);
    if (evidence.error) throw new Error("Bestellnachweise konnten nicht geladen werden.");
    return data.map(r => ({ ...r, order_evidence: evidence.data.find(o => o.id === r.matched_order_id) ?? null }));
  });

export const updateWithdrawalHandling = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => withdrawalHandlingSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { data: admin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (roleError) throw new Error("Zugriffsprüfung nicht verfügbar.");
    requireOperatorRole(admin === true);
    const { data: row, error } = await context.supabase.from("withdrawal_requests")
      .update({ handling_status: data.status, internal_notes: data.notes }).eq("id", data.id)
      .select("id").single();
    if (error || !row) throw new Error("Änderungen konnten nicht gespeichert werden.");
    return { ok: true };
  });
export const previewWithdrawalEmailRetry = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => { if (!input || typeof input !== "object" || !("id" in input) || !("kind" in input) || typeof input.id !== "string" || !/^[a-f0-9-]{36}$/i.test(input.id) || !["withdrawal_confirmation", "withdrawal_operator"].includes(String(input.kind))) throw new Error("Ungültige Wiederholung."); return { id: input.id, kind: String(input.kind) }; }).handler(async ({ context, data }) => {
  const role = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (role.error) throw new Error("Zugriffsprüfung nicht verfügbar."); requireOperatorRole(role.data === true);
  const { prepareWithdrawalRetry } = await import("./withdrawal-retry.server");
  const prepared = await prepareWithdrawalRetry(data.id, data.kind);
  return { id: data.id, kind: data.kind, to: prepared.mail.to, subject: prepared.mail.subject, text: prepared.mail.text, previewToken: prepared.token };
});
export const retryWithdrawalEmail = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => { if (!input || typeof input !== "object" || !("id" in input) || !("kind" in input) || !("confirmed" in input) || !("previewToken" in input) || input.confirmed !== true || typeof input.id !== "string" || !/^[a-f0-9-]{36}$/i.test(input.id) || typeof input.previewToken !== "string" || !/^[a-f0-9]{64}$/.test(input.previewToken) || !["withdrawal_confirmation", "withdrawal_operator"].includes(String(input.kind))) throw new Error("Nachrichtenbestätigung fehlt."); return { id: input.id, kind: String(input.kind), token: input.previewToken }; }).handler(async ({ context, data }) => {
  const role = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (role.error) throw new Error("Zugriffsprüfung nicht verfügbar."); requireOperatorRole(role.data === true);
  const { performWithdrawalRetry } = await import("./withdrawal-retry.server");
  return performWithdrawalRetry(data.id, data.kind, data.token);
});
