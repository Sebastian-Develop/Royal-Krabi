import { expect, test } from "bun:test";
import { requireOperatorRole, withdrawalHandlingSchema } from "./withdrawal-admin";

test("Only a verified administrator may manage withdrawals", () => {
  expect(() => requireOperatorRole(false)).toThrow();
  expect(() => requireOperatorRole(true)).not.toThrow();
});
test("Withdrawal handling accepts processed status and internal notes", () => {
  const result = withdrawalHandlingSchema.parse({ id: "b1db483d-222f-407b-8abd-3831019b3a5d", status: "processed", notes: "Intern geprüft", orderStatus: "cancelled" });
  expect(result.status).toBe("processed");
  expect(result.notes).toBe("Intern geprüft");
  expect(result).not.toHaveProperty("orderStatus");
  expect(withdrawalHandlingSchema.safeParse({ ...result, status: "refunded" }).success).toBe(false);
});