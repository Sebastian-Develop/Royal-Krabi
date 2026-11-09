import { sendOrderEmail } from "./order-email";
import { dispatchMessage, dispatchPreviewToken, requireDispatchable, type DispatchOrder, type DispatchItem, type DispatchRecord } from "./order-dispatch";

/** Narrow repository boundary also allows tests without real database/provider calls. */
export interface DispatchRepository {
  load(id: string): Promise<{ order: DispatchOrder; items: DispatchItem[] }>;
  claim(id: string, record: DispatchRecord): Promise<boolean>;
  finish(id: string, record: DispatchRecord): Promise<void>;
}

export async function performDispatch(repo: DispatchRepository, input: { id: string; previewToken: string }, operatorId: string, send = sendOrderEmail) {
  const { order, items } = await repo.load(input.id);
  requireDispatchable(order, items);
  if (order.dispatch) return { record: order.dispatch, duplicate: true };
  const mail = dispatchMessage(order, items);
  if (await dispatchPreviewToken(mail) !== input.previewToken) throw new Error("Bestelldaten geändert. Bitte Empfänger und Nachricht erneut prüfen.");
  const record: DispatchRecord = { fulfilledAt: new Date().toISOString(), operatorId, mode: order.delivery, emailStatus: "sending", emailAt: null, error: null };
  // A permanent atomic claim precedes the external send. No expiry/retry can duplicate it.
  if (!await repo.claim(input.id, record)) return { record: (await repo.load(input.id)).order.dispatch, duplicate: true };
  try {
    const sent = await send({ ...mail, idempotencyKey: `order-${order.id}-dispatch-v1` });
    record.emailStatus = sent ? "sent" : "failed";
    record.emailAt = sent ? new Date().toISOString() : null;
    record.error = sent ? null : "Resend hat den Versand nicht bestätigt. Keine automatische Wiederholung.";
  } catch {
    record.emailStatus = "uncertain";
    record.error = "E-Mail-Ergebnis unklar. Vor einem erneuten Versand bei Resend prüfen; Doppelsendung bleibt gesperrt.";
  }
  await repo.finish(input.id, record);
  return { record, duplicate: false };
}