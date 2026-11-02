import { expect, test } from "bun:test";
import { confirmStoredWithdrawal } from "./withdrawal-processing";

test("No confirmation email before withdrawal storage", async () => {
  let called = false;
  expect(await confirmStoredWithdrawal(null, async () => { called = true; return true; })).toBe(false);
  expect(called).toBe(false);
});
test("Email failure leaves stored withdrawal intact", async () => {
  const stored = { id: "test-reference", received_at: "2026-11-02T17:46:14Z" };
  let observedId = "";
  const result = await confirmStoredWithdrawal(stored, async row => { observedId = row.id; throw new Error("mail failure"); });
  expect(result).toBe(false);
  expect(observedId).toBe("test-reference");
  expect(stored.id).toBe("test-reference");
  expect(stored.received_at).toBe("2026-11-02T17:46:14Z");
});