/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { berlinDateString, discountForLines, isDiscountActiveAt, isLineEligible, normalizeDiscountCode, openingDiscount } from "./discount";
import { buildOrderLines } from "./shop-checkout";
import { shopProducts } from "./shop";

const eligible = shopProducts.find(p => p.price !== null && p.duration !== null && p.duration >= 60)!;
const short = shopProducts.find(p => p.price !== null && p.duration !== null && p.duration < 60);
const noDuration = shopProducts.find(p => p.price === null)!;

const lineOf = (productId: string, quantity = 1) => {
  const built = buildOrderLines([{ productId, quantity }]);
  if (!("lines" in built)) throw new Error("expected lines");
  return built.lines[0];
};

// Kontrollierte Testzeit: die Aktionsfrist wird mit festen Zeitpunkten geprüft,
// ohne die Produktionsuhr oder Aktionsdaten zu verändern.
const at = (berlinIsoLocal: string) => new Date(`${berlinIsoLocal}+01:00`); // November = MEZ

describe("opening discount rules", () => {
  test("code is ROYALKRABI20, 20 percent, minimum 60 minutes, 07.11.–21.11.2026", () => {
    expect(openingDiscount).toMatchObject({ code: "ROYALKRABI20", percent: 20, minMinutes: 60, validFrom: "2026-11-07", validUntil: "2026-11-21", timezone: "Europe/Berlin" });
  });
  test("code comparison ignores case and spaces", () => {
    expect(normalizeDiscountCode(" royalkrabi20 ")).toBe("ROYALKRABI20");
  });
  test("Berlin calendar day drives the window", () => {
    expect(berlinDateString(at("2026-11-07T00:30:00"))).toBe("2026-11-07");
  });
  test("inactive before 07.11. and after 21.11. (Berlin)", () => {
    expect(isDiscountActiveAt(at("2026-11-06T23:59:00"))).toBe(false);
    expect(isDiscountActiveAt(at("2026-11-22T00:00:00"))).toBe(false);
  });
  test("active from 07.11. through 21.11. inclusive (Berlin)", () => {
    expect(isDiscountActiveAt(at("2026-11-07T00:00:00"))).toBe(true);
    expect(isDiscountActiveAt(at("2026-11-21T23:59:00"))).toBe(true);
  });
  test("products of 60 minutes or more are eligible", () => {
    expect(isLineEligible(lineOf(eligible.id))).toBe(true);
  });
  test("products under 60 minutes are not eligible", () => {
    if (short) expect(isLineEligible(lineOf(short.id))).toBe(false);
  });
  test("the free-amount voucher without fixed duration is never eligible", () => {
    expect(isLineEligible({ ...lineOf(eligible.id), productId: noDuration.id })).toBe(false);
  });
  test("20 percent of the eligible list price, rounded to cents", () => {
    const line = lineOf(eligible.id, 2);
    const result = discountForLines([line], "ROYALKRABI20", at("2026-11-10T12:00:00"));
    expect(result).toMatchObject({ ok: true, discountCents: Math.round(line.subtotalCents * 0.2), eligibleCents: line.subtotalCents });
  });
  test("only eligible lines are discounted when the cart is mixed", () => {
    if (!short) return;
    const lines = [lineOf(eligible.id), lineOf(short.id)];
    const result = discountForLines(lines, "ROYALKRABI20", at("2026-11-10T12:00:00"));
    expect(result).toMatchObject({ ok: true, eligibleCents: lines[0].subtotalCents });
  });
  test("wrong code, inactive window and no eligible items are rejected with clear messages", () => {
    const line = lineOf(eligible.id);
    expect(discountForLines([line], "FALSCH", at("2026-11-10T12:00:00"))).toMatchObject({ ok: false, error: "Der Rabattcode ist ungültig." });
    expect(discountForLines([line], "ROYALKRABI20", at("2026-11-01T12:00:00"))).toMatchObject({ ok: false });
    if (short) expect(discountForLines([lineOf(short.id)], "ROYALKRABI20", at("2026-11-10T12:00:00"))).toMatchObject({ ok: false, error: "Der Rabatt gilt nur für Angebote ab 60 Minuten." });
  });
});
