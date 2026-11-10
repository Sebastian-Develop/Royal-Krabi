import type { supabaseAdmin } from "@/integrations/supabase/client.server";
import { operatorNotificationEmail, operatorCaseUrl } from "./contact";
import { brandEmailHtml, emailBlocks } from "./application-email";
import { sendOrderEmailResult } from "./order-email";
import { withdrawalConfirmationEmail, type WithdrawalEmailData } from "./withdrawal-email";

/** One stored withdrawal, one recipient-specific claim. Never a generic email endpoint. */
export async function notifyStoredWithdrawal(admin: typeof supabaseAdmin, data: WithdrawalEmailData, enabled: boolean, send = sendOrderEmailResult) {
  if (!enabled) return false;
  const now = new Date().toISOString();
  const claim = await admin.from("withdrawal_requests").update({ operator_email_claimed_at: now }).eq("id", data.id).is("operator_email_claimed_at", null).select("id");
  if (claim.error || !claim.data?.length) return false;
  const customer = await send({ to: data.email, ...withdrawalConfirmationEmail(data), idempotencyKey: `withdrawal-${data.id}-customer` });
  const subject = "Neuer Widerruf eingegangen – Royal Krabi";
  const text = `Widerruf: ${data.id}\nEingang: ${data.receivedAt}\nName: ${data.fullName}\nE-Mail: ${data.email}\nBestellreferenz: ${data.orderReference}\n${data.remark ?? ""}\nWiderruf bearbeiten: ${operatorCaseUrl("withdrawal", data.id)}\nKeine Erstattung bestätigt; Bearbeitung und Erstattung erfolgen gesondert.`;
  const operator = await send({ to: operatorNotificationEmail, subject, text, html: brandEmailHtml({ title: subject, main: emailBlocks.h1(subject) + emailBlocks.p(emailBlocks.esc(text).replace(/\n/g,"<br>")) + emailBlocks.p(`<a href="${operatorCaseUrl("withdrawal", data.id)}">Widerruf bearbeiten</a>`) }), idempotencyKey: `withdrawal-${data.id}-operator` });
  const history = [ { kind: "withdrawal_confirmation", outcome: customer }, { kind: "withdrawal_operator", outcome: operator } ].map(({ kind, outcome }) => ({ at: new Date().toISOString(), kind, status: outcome.status, providerId: outcome.providerId, error: outcome.error }));
  const saved = await admin.from("withdrawal_requests").update({ email_history: history }).eq("id", data.id);
  if (saved.error) console.error("[withdrawal] E-Mail-Verlauf nicht gespeichert; Ansprüche bleiben gesperrt.");
  return customer.accepted;
}
