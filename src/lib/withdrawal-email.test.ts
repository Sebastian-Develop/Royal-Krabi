import { describe, expect, test } from "bun:test";
import { shouldSendWithdrawalEmail, withdrawalConfirmationEmail, withdrawalConfirmationSubject } from "./withdrawal-email";

const data = { id: "abc-123", receivedAt: "2026-11-02T17:05:00Z", fullName: "Max Muster", email: "max@example.de", orderReference: "Bestellung 42" };

describe("withdrawal confirmation email", () => {
  test("subject is exact", () => {
    expect(withdrawalConfirmationSubject).toBe("Bestätigung Ihres Widerrufs – Royal Krabi Serenity Thaimassage");
  });
  test("contains all required facts", () => {
    const { text } = withdrawalConfirmationEmail(data);
    for (const s of ["2. November 2026", "18:05", "abc-123", "Max Muster", "max@example.de", "Bestellung 42", "Hiermit widerrufe ich meinen Vertrag.", "zur weiteren Bearbeitung gespeichert"]) expect(text).toContain(s);
  });
  test("never sends from preview or localhost", () => {
    expect(shouldSendWithdrawalEmail("localhost")).toBe(false);
    expect(shouldSendWithdrawalEmail("id-preview--8b969554-43d1-4653-abfd-07ad93d8716c.lovable.app")).toBe(false);
    expect(shouldSendWithdrawalEmail("royalkrabi-thaimassage.de")).toBe(true);
  });
});
