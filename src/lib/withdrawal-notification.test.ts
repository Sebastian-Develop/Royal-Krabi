import { expect, test } from "bun:test";
import { notifyStoredWithdrawal } from "./withdrawal-notification.server";
import type { OrderMailOptions } from "./order-email";

test("parallel withdrawal notifications send one receipt and one separate operator notice with no refund claim", async () => {
  let claimed = false; let history: unknown;
  const admin = { from() {
    let patch: Record<string, unknown> = {}; let claim = false;
    const chain = { update(p: Record<string, unknown>) { patch = p; return chain; }, eq() { return chain; }, is() { claim = true; return chain; }, select() { return chain; }, then(resolve: (v: unknown) => unknown) {
      if (claim) { const available = !claimed; claimed = true; return Promise.resolve({ data: available ? [{ id: "withdrawal-1" }] : [], error: null }).then(resolve); }
      history = patch["email_history"]; return Promise.resolve({ error: null }).then(resolve);
    } }; return chain;
  } } as unknown as Parameters<typeof notifyStoredWithdrawal>[0];
  const messages: OrderMailOptions[] = [];
  const send = async (mail: OrderMailOptions) => { messages.push(mail); return { accepted: true, providerId: "simulated", status: "accepted" as const, error: null }; };
  const data = { id: "withdrawal-1", receivedAt: "2026-11-10T00:00:00Z", fullName: "Test", email: "customer@example.test", orderReference: "order-1" };
  await Promise.all(Array.from({ length: 10 }, () => notifyStoredWithdrawal(admin, data, true, send)));
  expect(messages.length).toBe(2);
  expect(messages[0]?.to).toBe("customer@example.test");
  expect(messages[1]?.to).toBe("j.rudklang@royalkrabi-thaimassage.de");
  expect(messages[1]?.html).toContain("?withdrawal=withdrawal-1");
  expect(messages[1]?.text).toContain("Keine Erstattung bestätigt");
  expect(history).toBeArrayOfSize(2);
});