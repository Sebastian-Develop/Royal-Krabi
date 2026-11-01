import { expect, test } from 'bun:test';
import { valueVoucherDraft } from './value-voucher';

test('Value voucher draft is 24 months from verified payment, pending legal review', () => {
  expect(valueVoucherDraft.validityMonths).toBe(24);
  expect(valueVoucherDraft.validityStartsAt).toBe('verified_payment_receipt');
  expect(valueVoucherDraft.legalReviewRequired).toBe(true);
});
test('Value voucher has no opening or ROYALKRABI20 discount', () => {
  expect(valueVoucherDraft.openingDiscountEligible).toBe(false);
  expect(valueVoucherDraft.royalKrabi20Eligible).toBe(false);
});
test('Value voucher covers every massage, preserves balance and requires price difference', () => {
  expect(valueVoucherDraft.redeemableForEveryMassage).toBe(true);
  expect(valueVoucherDraft.retainRemainingBalance).toBe(true);
  expect(valueVoucherDraft.payPriceDifference).toBe(true);
});
test('Unproven SumUp redemption stays disabled', () => expect(valueVoucherDraft.onlineRedemptionEnabled).toBe(false));