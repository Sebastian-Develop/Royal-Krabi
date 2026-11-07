import { describe, expect, test } from "bun:test";
import { checkoutDiscount, discountForLines, testDiscount } from "./discount";
import { buildOrderLines, centsToAmount, checkoutRequestSchema, validityMonthsFor } from "./shop-checkout";
import { previewTestProduct, shopProducts } from "./shop";
import { canCreatePayment, isPaymentPreview, shouldRedirectDuringLaunch } from "./launch";
import { matchesStoredPayment } from "./payment-verification";

const host = "id-preview--8b969554-43d1-4653-abfd-07ad93d8716c.lovable.app";
const built = buildOrderLines([{ productId: previewTestProduct.id, quantity: 1 }]);
if (!("lines" in built)) throw new Error("Test product missing");
const lines = built.lines;
describe("approved preview test rules", () => {
  test("one test article costs exactly 100 cents and generates no entitlement", () => {
    expect(lines[0]?.unitPriceCents).toBe(100);
    expect(centsToAmount(100)).toBe(1);
    expect(centsToAmount(80)).toBe(0.8);
    expect(validityMonthsFor("test")).toBeNull();
    expect(previewTestProduct.massageCount).toBeNull();
    expect(previewTestProduct.duration).toBeNull();
  });
  test("TESTCODE20 reduces one test article to 80 cents", () => {
    expect(checkoutDiscount(lines, "TESTCODE20", new Date("2026-11-06T12:00:00Z"), host)).toEqual({ ok: true, discountCents: 20, eligibleCents: 100 });
  });
  test("fixed Berlin end boundary has no extension", () => {
    expect(checkoutDiscount(lines, testDiscount.code, new Date("2026-11-06T22:59:59.999Z"), host).ok).toBe(true);
    expect(checkoutDiscount(lines, testDiscount.code, new Date("2026-11-06T23:00:00Z"), host).ok).toBe(false);
    expect(checkoutDiscount(lines, testDiscount.code, new Date("2026-11-05T22:59:59Z"), host).ok).toBe(false);
  });
  test("public and local callers cannot redeem test code", () => {
    for (const h of ["localhost", "royalkrabi-thaimassage.de", "www.royalkrabi-thaimassage.de", "royalkrabi-thaimassage.lovable.app"]) {
      expect(isPaymentPreview(h)).toBe(false);
      expect(checkoutDiscount(lines, testDiscount.code, new Date("2026-11-06T12:00:00Z"), h).ok).toBe(false);
    }
    expect(canCreatePayment("localhost")).toBe(false);
    expect(canCreatePayment("royalkrabi-thaimassage.de")).toBe(true);
  });
  test("mixed cart discounts only test item; normal code excludes test item", () => {
    const product = shopProducts.find(p => p.kind === "voucher" && p.duration === 60 && p.price !== null);
    if (!product) throw new Error("Regular product missing");
    const mixed = buildOrderLines([{ productId: product.id, quantity: 1 }, { productId: previewTestProduct.id, quantity: 1 }]);
    if (!("lines" in mixed)) throw new Error("Mixed cart missing");
    expect(checkoutDiscount(mixed.lines, testDiscount.code, new Date("2026-11-06T12:00:00Z"), host)).toEqual({ ok: true, discountCents: 20, eligibleCents: 100 });
    expect(discountForLines(lines, "ROYALKRABI20", new Date("2026-11-07T12:00:00Z")).ok).toBe(false);
    expect(checkoutDiscount(lines, "TESTCODE20 ROYALKRABI20", new Date("2026-11-06T12:00:00Z"), host).ok).toBe(false);
  });
  test("public release serves shop and checkout without redirects", () => {
    expect(shouldRedirectDuringLaunch(new URL("https://royalkrabi-thaimassage.de/api/public/sumup-webhook"))).toBe(false);
    for (const path of ["/shop", "/checkout", "/_serverFn/checkout"]) expect(shouldRedirectDuringLaunch(new URL(`https://royalkrabi-thaimassage.de${path}?ansicht=website`))).toBe(false);
  });
  test("test-only checkout requires no delivery and mixed carts need a regular delivery", () => {
    const customer = { fullName: "Anna Beispiel", email: "anna@example.de", phone: "06960511884", street: "", postalCode: "", city: "", country: "DE", recipient: "", giftText: "", notes: "", acceptTerms: true, acknowledgePrivacy: true, submissionKey: "0f3b3d7a-1c2e-4b5a-9c8d-7e6f5a4b3c2d", items: [{ productId: previewTestProduct.id, quantity: 1 }] };
    expect(checkoutRequestSchema.safeParse({ ...customer, delivery: "none" }).success).toBe(true);
    expect(checkoutRequestSchema.safeParse({ ...customer, delivery: "pickup" }).success).toBe(false);
    const regular = shopProducts.find(p => p.kind === "voucher" && p.price !== null);
    if (!regular) throw new Error("Product missing");
    const items = [...customer.items, { productId: regular.id, quantity: 1 }];
    expect(checkoutRequestSchema.safeParse({ ...customer, items, delivery: "none" }).success).toBe(false);
    expect(checkoutRequestSchema.safeParse({ ...customer, items, delivery: "pickup" }).success).toBe(true);
  });
});
describe("provider proof must match stored order", () => {
  const proof = { id: "checkout", reference: "order", amount: 0.8, currency: "EUR", status: "PAID" };
  const expected = { checkoutId: "checkout", orderId: "order", totalCents: 80, currency: "EUR" };
  test("verified amount 80 cents accepted", () => expect(matchesStoredPayment(proof, expected)).toBe(true));
  test("wrong amount rejected", () => expect(matchesStoredPayment({ ...proof, amount: 1 }, expected)).toBe(false));
  test("wrong currency rejected", () => expect(matchesStoredPayment({ ...proof, currency: "USD" }, expected)).toBe(false));
  test("wrong order rejected", () => expect(matchesStoredPayment({ ...proof, reference: "other" }, expected)).toBe(false));
  test("wrong checkout rejected", () => expect(matchesStoredPayment({ ...proof, id: "other" }, expected)).toBe(false));
});