import { sendOrderEmailResult, type OrderMailOptions, type MailOutcome } from "./order-email";
import { dispatchMessage, dispatchPreviewToken, requireDispatchable, type DispatchOrder, type DispatchItem, type DispatchRecord } from "./order-dispatch";

export interface DispatchRepository {
  load(id: string): Promise<{ order: DispatchOrder; items: DispatchItem[] }>;
  claim(id: string, record: DispatchRecord, previous?: DispatchRecord): Promise<boolean>;
  finish(id: string, record: DispatchRecord): Promise<void>;
}
export async function performDispatch(repo: DispatchRepository, input: { id: string; previewToken: string; retry?: boolean | undefined }, operatorId: string, send: (opts: OrderMailOptions) => Promise<MailOutcome | boolean> = sendOrderEmailResult) {
  const { order, items } = await repo.load(input.id);
  requireDispatchable(order, items);
  const previous = order.dispatch;
  if (previous && (!input.retry || previous.emailStatus !== "failed")) return { record: previous, duplicate: true };
  if (input.retry && !previous) throw new Error("Keine fehlgeschlagene Liefernachricht vorhanden.");
  const mail = dispatchMessage(order, items);
  if (await dispatchPreviewToken(mail) !== input.previewToken) throw new Error("Bestelldaten geändert. Bitte Empfänger und Nachricht erneut prüfen.");
  const attempt = previous ? (previous.attempt ?? 1) + 1 : 1;
  const record: DispatchRecord = { fulfilledAt: previous?.fulfilledAt ?? new Date().toISOString(), operatorId, mode: order.delivery, emailStatus: "sending", emailAt: null, error: null, attempt, history: [...(previous?.history ?? [])], providerId: null };
  if (previous?.collectedAt) record.collectedAt = previous.collectedAt;
  if (!await repo.claim(input.id, record, previous ?? undefined)) return { record: (await repo.load(input.id)).order.dispatch, duplicate: true };
  try {
    const outcome = await send({ ...mail, idempotencyKey: attempt === 1 ? `order-${order.id}-dispatch-v1` : `order-${order.id}-dispatch-v1-attempt-${attempt}` });
    const accepted = typeof outcome === "boolean" ? outcome : outcome.accepted;
    record.emailStatus = accepted ? "sent" : typeof outcome !== "boolean" && outcome.status === "uncertain" ? "uncertain" : "failed";
    record.providerId = typeof outcome === "boolean" ? null : outcome.providerId;
    record.emailAt = accepted ? new Date().toISOString() : null;
    record.error = accepted ? null : typeof outcome === "boolean" ? "Resend hat den Versand abgelehnt." : outcome.error;
  } catch {
    record.emailStatus = "uncertain"; record.error = "E-Mail-Ergebnis unklar. Vor Wiederholung bei Resend prüfen; Doppelsendung bleibt gesperrt.";
  }
  record.history?.push({ at: new Date().toISOString(), kind: `fulfillment_${order.delivery}`, status: record.emailStatus === "sent" ? "accepted" : record.emailStatus, providerId: record.providerId ?? null, error: record.error });
  await repo.finish(input.id, record);
  return { record, duplicate: false };
}
