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
      .select("id, received_at, full_name, email, order_reference, declaration, remark, matched_order_id, handling_status, internal_notes, processed_at, updated_at")
      .order("received_at", { ascending: false });
    if (error) throw new Error("Widerrufe konnten nicht geladen werden.");
    return data;
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