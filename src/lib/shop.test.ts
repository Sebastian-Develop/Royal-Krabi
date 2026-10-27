import { expect, test } from "bun:test";
import { shopProducts, shopPolicy, canPayForProduct, orderSchema, isApprovedPaymentLink } from "./shop";
test("DHL shipping is Germany-only and free without a minimum order value", () => {
  expect([shopPolicy.shippingProvider, shopPolicy.shippingCountry, shopPolicy.shippingCost, shopPolicy.minimumOrderValue, shopPolicy.minimumQuantity]).toEqual(["DHL", "DE", 0, 0, 1]);
});
test("Handover allowance is three working days, not guaranteed arrival", () => expect(shopPolicy.handoverWorkingDays).toBe(3));
test("Cards do not renew and acceptance is manual", () => expect([shopPolicy.automaticRenewal, shopPolicy.manualAcceptance]).toEqual([false, true]));
test("Unreleased validity and transferability remain undecided", () => expect([shopPolicy.validityMonths, shopPolicy.transferable]).toEqual([null, null]));
test("All products are unavailable until explicit sales release", () => { expect(shopProducts.length).toBeGreaterThan(70); expect(shopProducts.every(p => !canPayForProduct(p))).toBe(true); });
test("Shop retains confirmed example voucher and card prices", () => {
  expect(shopProducts.find(p => p.name === "60 Minuten Royal Thai Massage – ohne Öl")?.price).toBe(59);
  expect(shopProducts.find(p => p.name === "5er-Abo · Royal Thai Massage – ohne Öl")?.price).toBe(280);
  expect(shopProducts.find(p => p.name === "10er-Abo · Royal Thai Massage – ohne Öl")?.price).toBe(531);
});
const input = { productId: "gutschein-1", fullName: "Test Person", email: "test@example.org", phone: "06960511884", delivery: "pickup", street: "", postalCode: "", city: "", country: "DE", recipient: "", giftText: "", notes: "", acceptTerms: true, acknowledgePrivacy: true };
test("Pickup needs no postal address; post needs a German address", () => {
  expect(orderSchema.safeParse(input).success).toBe(true);
  expect(orderSchema.safeParse({ ...input, delivery: "post" }).success).toBe(false);
  expect(orderSchema.safeParse({ ...input, delivery: "post", street: "Teststraße 1", postalCode: "63075", city: "Offenbach" }).success).toBe(true);
  expect(orderSchema.safeParse({ ...input, country: "AT" }).success).toBe(false);
});
test("Reject unknown product, missing acceptance and unsafe links", () => {
  expect(orderSchema.safeParse({ ...input, productId: "unknown" }).success).toBe(false);
  expect(orderSchema.safeParse({ ...input, acceptTerms: false }).success).toBe(false);
  expect(isApprovedPaymentLink("https://pay.sumup.com/example")).toBe(true);
  expect(isApprovedPaymentLink("https://pay.sumup.com.evil.test/example")).toBe(false);
  expect(isApprovedPaymentLink("javascript:alert(1)")).toBe(false);
});