/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { buildOrderLines, centsToAmount, checkoutRequestSchema, orderTotalCents, validityMonthsFor } from "./shop-checkout";
import { shopProducts } from "./shop";
import { MAX_QUANTITY } from "./cart";

const priced = shopProducts.find(p => p.price !== null)!;
const unpriced = shopProducts.find(p => p.price === null)!;

const customer = {
  fullName: "Anna Beispiel",
  email: "anna@example.de",
  phone: "069 60511884",
  delivery: "pickup" as const,
  street: "",
  postalCode: "",
  city: "",
  country: "DE" as const,
  recipient: "",
  giftText: "",
  notes: "",
  acceptTerms: true,
  acknowledgePrivacy: true,
  discountCode: "",
  submissionKey: "0f3b3d7a-1c2e-4b5a-9c8d-7e6f5a4b3c2d",
};

describe("server-side order pricing", () => {
  test("prices come from the catalog, in cents, never from the client", () => {
    const built = buildOrderLines([{ productId: priced.id, quantity: 2 }]);
    expect("lines" in built && built.lines[0]).toMatchObject({
      productId: priced.id,
      quantity: 2,
      unitPriceCents: Math.round(priced.price! * 100),
      subtotalCents: Math.round(priced.price! * 100) * 2,
    });
  });
  test("duplicate positions are merged into one line", () => {
    const built = buildOrderLines([{ productId: priced.id, quantity: 1 }, { productId: priced.id, quantity: 2 }]);
    expect("lines" in built && built.lines).toHaveLength(1);
    expect("lines" in built && built.lines[0].quantity).toBe(3);
  });
  test("unknown products are rejected", () => {
    expect(buildOrderLines([{ productId: "gibt-es-nicht", quantity: 1 }])).toHaveProperty("error");
  });
  test("products without a fixed price (Wunschbetrag) are rejected", () => {
    expect(buildOrderLines([{ productId: unpriced.id, quantity: 1 }])).toHaveProperty("error");
  });
  test("quantities above the cart limit are rejected", () => {
    expect(buildOrderLines([{ productId: priced.id, quantity: MAX_QUANTITY + 1 }])).toHaveProperty("error");
    expect(buildOrderLines([{ productId: priced.id, quantity: MAX_QUANTITY - 1 }, { productId: priced.id, quantity: 2 }])).toHaveProperty("error");
  });
  test("empty carts are rejected", () => {
    expect(buildOrderLines([])).toHaveProperty("error");
  });
  test("total is the sum of line subtotals and converts to a two-decimal amount", () => {
    const built = buildOrderLines([{ productId: priced.id, quantity: 2 }]);
    if (!("lines" in built)) throw new Error("expected lines");
    expect(orderTotalCents(built.lines)).toBe(built.lines[0].subtotalCents);
    expect(centsToAmount(12345)).toBe(123.45);
  });
});

describe("checkout request validation", () => {
  test("a complete request with items validates", () => {
    const result = checkoutRequestSchema.safeParse({ ...customer, items: [{ productId: priced.id, quantity: 1 }] });
    expect(result.success).toBe(true);
  });
  test("a request without items is rejected", () => {
    expect(checkoutRequestSchema.safeParse({ ...customer, items: [] }).success).toBe(false);
  });
  test("missing consent is rejected", () => {
    expect(checkoutRequestSchema.safeParse({ ...customer, acceptTerms: false, items: [{ productId: priced.id, quantity: 1 }] }).success).toBe(false);
  });
  test("post delivery requires a full German address", () => {
    const base = { ...customer, delivery: "post", items: [{ productId: priced.id, quantity: 1 }] };
    expect(checkoutRequestSchema.safeParse(base).success).toBe(false);
    expect(checkoutRequestSchema.safeParse({ ...base, street: "Offenbacher Str. 32", postalCode: "63075", city: "Offenbach am Main" }).success).toBe(true);
  });
  test("a missing submission key is rejected (duplicate protection)", () => {
    const { submissionKey, ...withoutKey } = customer;
    expect(checkoutRequestSchema.safeParse({ ...withoutKey, items: [{ productId: priced.id, quantity: 1 }] }).success).toBe(false);
  });
  test("validity periods follow the confirmed rules: 5er 12 months, 10er and vouchers 24", () => {
    expect(validityMonthsFor("five")).toBe(12);
    expect(validityMonthsFor("ten")).toBe(24);
    expect(validityMonthsFor("voucher")).toBe(24);
  });
});
