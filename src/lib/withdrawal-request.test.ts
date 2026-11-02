import { expect, test } from "bun:test";
import { withdrawalRequestSchema, withdrawalDeclaration } from "./withdrawal-request";
import { legalDraftWithdrawal } from "./legal-draft";
const base = { fullName: "Max Muster", email: "max@example.de", orderReference: "Kauf 07.11., Royalpass", declarationConfirmed: true };
test("declaration text is exact", () => expect(withdrawalDeclaration).toBe("Hiermit widerrufe ich meinen Vertrag."));
test("no reason required, free-text reference accepted", () => expect(withdrawalRequestSchema.safeParse(base).success).toBe(true));
test("explicit declaration is mandatory", () => expect(withdrawalRequestSchema.safeParse({ ...base, declarationConfirmed: false }).success).toBe(false));
test("name, email and reference are mandatory", () => {
  for (const k of ["fullName", "email", "orderReference"] as const) expect(withdrawalRequestSchema.safeParse({ ...base, [k]: "" }).success).toBe(false);
});
test("withdrawal notice names the online function", () => expect(JSON.stringify(legalDraftWithdrawal)).toContain("‚Vertrag widerrufen‘ auf dieser Seite"));
