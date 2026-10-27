/// <reference types="bun" />
import { expect, test } from "bun:test";
import { withdrawalTerms } from "./withdrawal";
import { contact, withdrawalMailHref } from "./contact";

test("Approved service-contract withdrawal period is 14 days from contract conclusion", () => {
  expect(withdrawalTerms.periodDays).toBe(14);
  expect(withdrawalTerms.periodStart).toBe("Vertragsabschluss");
});
test("Withdrawal refunds are due within 14 days", () => {
  expect(withdrawalTerms.repaymentDays).toBe(14);
});
test("Prepaid cards do not renew automatically", () => {
  expect(withdrawalTerms.automaticRenewal).toBe(false);
});
test("No withdrawal fee is charged", () => {
  expect(withdrawalTerms.withdrawalFee).toBe(0);
});
test("Withdrawal email addresses the studio without the appointment template", () => {
  const url = new URL(withdrawalMailHref);
  expect(url.pathname).toBe(contact.email);
  expect(url.searchParams.get("subject")).toBe("Widerruf – Royal Krabi Serenity Thaimassage");
  expect(url.searchParams.has("body")).toBe(false);
});