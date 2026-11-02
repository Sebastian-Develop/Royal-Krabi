import { expect, test } from 'bun:test';
import { canAcceptPurchase, canPartiallyRedeemMassageVoucher, confirmedPurchaseRules, priceIncreaseAppliesTo } from './purchase-rules';
import { discountForLines, isDiscountActiveAt } from './discount';
import { shopProducts } from './shop';
import { legalTextsFor, WEBSITE_LEGAL_VERSION, CURRENT_ORDER_LEGAL_VERSION } from './legal-texts';

test('contract requires verified full payment AND subsequent acceptance, receipt alone is insufficient', () => {
  expect(canAcceptPurchase(false, true)).toBe(false);
  expect(canAcceptPurchase(true, false)).toBe(false);
  expect(canAcceptPurchase(true, true)).toBe(true);
  expect(confirmedPurchaseRules.contract.receiptIsAcceptance).toBe(false);
});
test('discount basis is verified full payment receipt, not order time', () => {
  expect(confirmedPurchaseRules.discount.basis).toBe('verified_full_payment_receipt');
  expect(isDiscountActiveAt(new Date('2026-11-06T22:59:59Z'))).toBe(false);
  expect(isDiscountActiveAt(new Date('2026-11-06T23:00:00Z'))).toBe(true);
  expect(isDiscountActiveAt(new Date('2026-11-21T22:59:59Z'))).toBe(true);
  expect(isDiscountActiveAt(new Date('2026-11-21T23:00:00Z'))).toBe(false);
});
test('20 percent of displayed eligible voucher and pass prices, no custom value voucher discount', () => {
  for (const kind of ['voucher', 'five', 'ten']) {
    const product = shopProducts.find(p => p.kind === kind && p.duration === 60 && p.price !== null);
    if (!product || product.price === null) throw new Error('missing fixed duration product');
    const cents = Math.round(product.price * 100);
    expect(discountForLines([{ productId: product.id, name: product.name, kind: product.kind, quantity: 1, unitPriceCents: cents, subtotalCents: cents }], 'ROYALKRABI20', new Date('2026-11-08T12:00:00Z'))).toEqual({ ok: true, eligibleCents: cents, discountCents: Math.round(cents * .2) });
  }
  const value = shopProducts.find(p => p.price === null);
  if (!value) throw new Error('missing value voucher');
  expect(discountForLines([{ productId: value.id, name: value.name, kind: value.kind, quantity: 1, unitPriceCents: 10000, subtotalCents: 10000 }], 'ROYALKRABI20', new Date('2026-11-08T12:00:00Z')).ok).toBe(false);
});
test('60, 90 and 120 minute vouchers allow partial use retaining unused minutes', () => {
  expect([30,60,90,120].map(canPartiallyRedeemMassageVoucher)).toEqual([false,true,true,true]);
  expect(confirmedPurchaseRules.massageVoucher.balanceBasis).toBe('unused_minutes');
});
test('massage type change keeps equal price unchanged, higher difference payable, lower balance retained', () => {
  expect(confirmedPurchaseRules.massageVoucher.otherMassageAllowed).toBe(true);
  expect(confirmedPurchaseRules.massageVoucher.equalPriceSurcharge).toBe(0);
  expect(confirmedPurchaseRules.massageVoucher.higherPriceDifferencePayable).toBe(true);
  expect(confirmedPurchaseRules.massageVoucher.lowerPriceBalanceRetained).toBe(true);
});
test('price increases apply to fixed vouchers, partial balances and both passes, not value vouchers', () => {
  expect(['fixed_massage_voucher','partial_massage_voucher_balance','five_royalpass','ten_royalpass','value_voucher'].map(priceIncreaseAppliesTo)).toEqual([true,true,true,true,false]);
  expect(confirmedPurchaseRules.priceIncrease.currentPriceDifferencePayable).toBe(true);
});
test('superseded draft remains distinct and current new draft cannot release checkout', () => {
  expect(legalTextsFor('2026-11-02-review').version).toBe('2026-11-02-review');
  expect(WEBSITE_LEGAL_VERSION).toBe('2026-11-02-confirmed-review');
  expect(legalTextsFor(WEBSITE_LEGAL_VERSION).released).toBe(false);
  expect(CURRENT_ORDER_LEGAL_VERSION).toBeNull();
});