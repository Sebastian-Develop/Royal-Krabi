import { expect, test } from "bun:test";
import { dispatchMessage, dispatchPreviewToken, dispatchRequestSchema, requireDispatchOperator, type DispatchOrder, type DispatchRecord } from "./order-dispatch";
import { performDispatch, type DispatchRepository } from "./order-dispatch.server";

const id = "00000000-0000-4000-8000-000000000001";
function fixture(delivery = "post") {
  const order: DispatchOrder = { id, full_name: "Anna Beispiel", email: "anna@example.test", status: "paid", paid_at: "2026-11-08T10:00:00Z", delivery, dispatch: null };
  const items = [{ product_name: "Massagegutschein", product_kind: "voucher", quantity: 1 }];
  const repo: DispatchRepository = {
    async load() { return { order: { ...order }, items }; },
    async claim(_id, record, previous) { if (previous ? JSON.stringify(order.dispatch) !== JSON.stringify(previous) : Boolean(order.dispatch)) return false; order.dispatch = { ...record }; return true; },
    async finish(_id, record) { order.dispatch = { ...record }; },
  };
  return { order, items, repo, input: async () => ({ id, previewToken: await dispatchPreviewToken(dispatchMessage(order, items)) }) };
}

test("only authorized operators pass the server-side role boundary", () => {
  expect(() => requireDispatchOperator(false)).toThrow("Kein Zugriff");
  expect(() => requireDispatchOperator(true)).not.toThrow();
});
test("explicit operator confirmation is mandatory", () => {
  expect(dispatchRequestSchema.safeParse({ id, previewToken: "a".repeat(64), confirmed: false }).success).toBe(false);
  expect(dispatchRequestSchema.safeParse({ id, previewToken: "a".repeat(64), confirmed: true }).success).toBe(true);
});
test("unpaid orders cannot be fulfilled or trigger email", async () => {
  const f = fixture(); const input = await f.input(); let calls = 0;
  f.order.status = "awaiting_payment"; f.order.paid_at = null;
  await expect(performDispatch(f.repo, input, "operator", async () => { calls++; return true; })).rejects.toThrow("bezahlte");
  expect(calls).toBe(0); expect(f.order.dispatch).toBeNull();
});
test("paid status alone without verified payment timestamp cannot dispatch", async () => {
  const f = fixture(); const input = await f.input(); f.order.paid_at = null;
  await expect(performDispatch(f.repo, input, "operator", async () => true)).rejects.toThrow("bezahlte");
  expect(f.order.dispatch).toBeNull();
});
test("test items and unknown delivery modes never claim fulfillment", () => {
  const f = fixture(); f.items[0] = { product_name: "Test", product_kind: "test", quantity: 1 };
  expect(() => dispatchMessage(f.order, f.items)).toThrow("Testkäufe");
  const unknown = fixture("none"); expect(() => dispatchMessage(unknown.order, unknown.items)).toThrow("Lieferart");
});
test("changed recipient invalidates the reviewed message before any action", async () => {
  const f = fixture(); const input = await f.input(); f.order.email = "changed@example.test"; let calls = 0;
  await expect(performDispatch(f.repo, input, "operator", async () => { calls++; return true; })).rejects.toThrow("erneut prüfen");
  expect(calls).toBe(0); expect(f.order.dispatch).toBeNull();
});
test("digital and pickup fulfillment use their actual mode, not postal dispatch", async () => {
  for (const mode of ["digital", "pickup"]) {
    const f = fixture(mode);
    if (mode === "digital") f.order.digital_provision_url = "https://royalkrabi-thaimassage.de/secure-test-provision";
    const result = await performDispatch(f.repo, await f.input(), "operator", async () => true);
    expect(result.record?.mode).toBe(mode);
  }
});
test("parallel and repeated calls send exactly one notice and store time and operator", async () => {
  const f = fixture(); const input = await f.input(); let calls = 0;
  const send = async () => { calls++; expect(f.order.dispatch?.fulfilledAt).toBeString(); await Promise.resolve(); return true; };
  await Promise.all(Array.from({ length: 10 }, () => performDispatch(f.repo, input, "operator", send)));
  await performDispatch(f.repo, input, "operator", send);
  expect(calls).toBe(1); expect(f.order.dispatch?.operatorId).toBe("operator");
  expect(f.order.dispatch?.emailStatus).toBe("sent"); expect(f.order.dispatch?.emailAt).toBeString();
  expect(f.order.status).toBe("paid"); expect(f.order.paid_at).toBe("2026-11-08T10:00:00Z");
});
test("dedicated notice has no attachment payload or payment/voucher resend trigger", async () => {
  const f = fixture(); let payload: unknown;
  await performDispatch(f.repo, await f.input(), "operator", async data => { payload = data; return true; });
  expect(payload).toMatchObject({ to: "anna@example.test", idempotencyKey: `order-${id}-dispatch-v1` });
  expect(Object.hasOwn(payload as object, "attachments")).toBe(false);
});
test("rejected email is visibly failed, retains fulfillment, and is not retried", async () => {
  const f = fixture(); const input = await f.input(); let calls = 0;
  const send = async () => { calls++; return false; };
  await performDispatch(f.repo, input, "operator", send); await performDispatch(f.repo, input, "operator", send);
  expect(calls).toBe(1); expect(f.order.dispatch?.emailStatus).toBe("failed");
  expect(f.order.dispatch?.emailAt).toBeNull(); expect(f.order.dispatch?.error).toBeString(); expect(f.order.dispatch?.fulfilledAt).toBeString();
});
test("timeout/unknown provider result never becomes success or retries", async () => {
  const f = fixture(); const input = await f.input(); let calls = 0;
  const send = async () => { calls++; throw new Error("timeout"); };
  await performDispatch(f.repo, input, "operator", send); await performDispatch(f.repo, input, "operator", send);
  expect(calls).toBe(1); expect(f.order.dispatch?.emailStatus).toBe("uncertain"); expect(f.order.dispatch?.emailAt).toBeNull();
});
test("failed state storage after provider acceptance keeps permanent claim", async () => {
  const f = fixture(); const input = await f.input(); let calls = 0;
  f.repo.finish = async (_id: string, _record: DispatchRecord) => { throw new Error("storage failure"); };
  const send = async () => { calls++; return true; };
  await expect(performDispatch(f.repo, input, "operator", send)).rejects.toThrow("storage failure");
  await performDispatch(f.repo, input, "operator", send);
  expect(calls).toBe(1); expect(f.order.dispatch?.emailStatus).toBe("sending");
});
test("database claim failure never sends a customer message", async () => {
  const f = fixture(); let calls = 0;
  f.repo.claim = async () => { throw new Error("database unavailable"); };
  await expect(performDispatch(f.repo, await f.input(), "operator", async () => { calls++; return true; })).rejects.toThrow("database unavailable");
  expect(calls).toBe(0);
});
test("digital delivery without a real provision route never claims or sends", async () => {
  const f = fixture("digital"); let calls = 0;
  await expect(performDispatch(f.repo, { id, previewToken: "a".repeat(64) }, "operator", async () => { calls++; return true; })).rejects.toThrow("Bereitstellungsweg");
  expect(calls).toBe(0); expect(f.order.dispatch).toBeNull();
});
test("explicit retry of a definite rejection is claimed once and retains fulfillment", async () => {
  const f = fixture(); const input = await f.input();
  await performDispatch(f.repo, input, "operator", async () => false);
  const when = f.order.dispatch?.fulfilledAt; let calls = 0;
  await Promise.all(Array.from({ length: 10 }, () => performDispatch(f.repo, { ...input, retry: true }, "operator", async () => { calls++; return { accepted: true, providerId: "simulated-provider-id", status: "accepted", error: null }; })));
  expect(calls).toBe(1); expect(f.order.dispatch?.fulfilledAt).toBe(when);
  expect(f.order.dispatch?.history?.length).toBe(2); expect(f.order.dispatch?.providerId).toBe("simulated-provider-id");
  await performDispatch(f.repo, { ...input, retry: true }, "operator", async () => { calls++; return true; });
  expect(calls).toBe(1);
});
test("uncertain provider outcome cannot be retried even with explicit request", async () => {
  const f = fixture(); const input = await f.input(); let calls = 0;
  await performDispatch(f.repo, input, "operator", async () => ({ accepted: false, providerId: null, status: "uncertain", error: "timeout" }));
  await performDispatch(f.repo, { ...input, retry: true }, "operator", async () => { calls++; return true; });
  expect(calls).toBe(0); expect(f.order.dispatch?.emailStatus).toBe("uncertain");
});