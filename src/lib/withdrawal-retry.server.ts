import { operatorNotificationEmail, operatorCaseUrl } from "./contact";
import { withdrawalConfirmationEmail } from "./withdrawal-email";
import { sendOrderEmailResult } from "./order-email";
import { brandEmailHtml, emailBlocks } from "./application-email";
import { dispatchPreviewToken, type EmailHistory } from "./order-dispatch";
export async function prepareWithdrawalRetry(id: string, kind: string) {
 const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
 const result = await admin.from("withdrawal_requests").select("id, received_at, full_name, email, order_reference, remark, email_history").eq("id", id).single();
 if (result.error) throw new Error("Widerruf konnte nicht geladen werden.");
 const row = result.data; const history = row.email_history as unknown as EmailHistory[];
 if (history.filter(h => h.kind === kind).at(-1)?.status !== "failed") throw new Error("Nur eindeutig abgelehnte Nachrichten können erneut gesendet werden.");
 const customer = withdrawalConfirmationEmail({ id, receivedAt: row.received_at, fullName: row.full_name, email: row.email, orderReference: row.order_reference, remark: row.remark });
 const subject = "Neuer Widerruf eingegangen – Royal Krabi";
 const text = `Widerruf: ${id}\nEingang: ${row.received_at}\nName: ${row.full_name}\nE-Mail: ${row.email}\nBestellreferenz: ${row.order_reference}\n${row.remark}\nWiderruf bearbeiten: ${operatorCaseUrl("withdrawal", id)}\nKeine Erstattung bestätigt; Bearbeitung und Erstattung erfolgen gesondert.`;
 const mail = kind === "withdrawal_confirmation" ? { to: row.email, ...customer } : { to: operatorNotificationEmail, subject, text, html: brandEmailHtml({ title: subject, main: emailBlocks.h1(subject) + emailBlocks.p(emailBlocks.esc(text).replace(/\n/g, "<br>")) + emailBlocks.p(`<a href="${operatorCaseUrl("withdrawal", id)}">Widerruf bearbeiten</a>`) }) };
 return { admin, row, history, mail, token: await dispatchPreviewToken(mail) };
}
export async function performWithdrawalRetry(id: string, kind: string, token: string) {
 const p = await prepareWithdrawalRetry(id, kind);
 if (token !== p.token) throw new Error("Empfänger oder Nachricht geändert. Bitte erneut prüfen.");
 const attempt = p.history.filter(h => h.kind === kind).length + 1;
 const event: EmailHistory = { at: new Date().toISOString(), kind, status: "sending", providerId: null, error: null };
 const history = [...p.history, event];
 const claim = await p.admin.from("withdrawal_requests").update({ email_history: history }).eq("id", id).eq("email_history", JSON.stringify(p.history)).select("id");
 if (claim.error || !claim.data?.length) throw new Error("Wiederholung bereits in Bearbeitung. Bitte aktualisieren.");
 const outcome = await sendOrderEmailResult({ ...p.mail, idempotencyKey: `withdrawal-${id}-${kind}-attempt-${attempt}` });
 Object.assign(event, { status: outcome.status, providerId: outcome.providerId, error: outcome.error });
 const saved = await p.admin.from("withdrawal_requests").update({ email_history: history }).eq("id", id).eq("email_history", JSON.stringify([...p.history, { ...event, status: "sending", providerId: null, error: null }])).select("id");
 if (saved.error || !saved.data?.length) throw new Error("Ergebnis nicht gespeichert oder Verlauf verändert; nicht erneut auslösen.");
 return { status: outcome.status, error: outcome.error };
}
