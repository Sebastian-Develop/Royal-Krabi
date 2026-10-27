import { expect, test } from "bun:test";
import { addItem, cartTotal, cartLines, removeItem, setQuantity, normalizeCart, MAX_QUANTITY } from "./cart";
import { shopProducts } from "./shop";

const card5 = shopProducts.find(p => p.name === "5er-Abo · Royal Thai Massage – ohne Öl")!;
const voucher = shopProducts.find(p => p.name === "60 Minuten Royal Thai Massage – ohne Öl")!;
const variable = shopProducts.find(p => p.price === null);

test("Total sums all lines with no shipping cost", () => {
  let c = addItem([], card5.id); c = addItem(c, voucher.id); c = addItem(c, voucher.id);
  expect(cartTotal(c)).toBe(280 + 2 * 59);
});
test("Quantity change and removal", () => {
  let c = setQuantity(addItem([], voucher.id), voucher.id, 3);
  expect(cartLines(c)[0].subtotal).toBe(177);
  c = removeItem(c, voucher.id);
  expect(c).toEqual([]);
});
test("Variable-amount vouchers and unknown items are not cartable", () => {
  if (variable) expect(addItem([], variable.id)).toEqual([]);
  expect(normalizeCart([{ productId: "x", quantity: 1 }])).toEqual([]);
  expect(normalizeCart([{ productId: voucher.id, quantity: 999 }])[0].quantity).toBe(MAX_QUANTITY);
  expect(setQuantity(addItem([], voucher.id), voucher.id, 0)).toEqual([]);
});
