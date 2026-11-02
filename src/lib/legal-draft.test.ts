import { expect, test } from 'bun:test';
import { draftBusinessRules, stampsForPerformedMassage, draftCancellationCents, loyaltyReward } from './legal-draft';
import { CURRENT_ORDER_LEGAL_VERSION, WEBSITE_LEGAL_VERSION, legalTextsFor, orderLegalReleaseError } from './legal-texts';
import { shopPolicy } from './shop';

test('draft vouchers 24, five 12, ten 24 months', () => {
  expect([draftBusinessRules.voucherMonths,draftBusinessRules.fiveMonths,draftBusinessRules.tenMonths]).toEqual([24,12,24]);
});
test('five hours inclusive free, later cancellation and no-show 50 percent', () => {
  expect(draftCancellationCents(5900,5)).toBe(0);
  expect(draftCancellationCents(5900,4.99)).toBe(2950);
  expect(draftCancellationCents(5900,10,true)).toBe(2950);
});
test('performed minutes earn duration-based personal stamps', () => {
  expect([30,60,90,120].map(stampsForPerformedMassage)).toEqual([0,1,1.5,2]);
});
test('ten stamps redeem half, preserve excess and earn reward massage stamps', () => {
  expect(loyaltyReward(5900,11.5,90)).toEqual({discountCents:2950,remainingStamps:3});
  expect(loyaltyReward(5900,9,60)).toEqual({discountCents:0,remainingStamps:10});
});
test('pair reward applies only to each qualified personal share', () => {
  const a = loyaltyReward(6450,10,60), b = loyaltyReward(6450,9,60);
  expect([a.discountCents,b.discountCents]).toEqual([3225,0]);
  expect(loyaltyReward(6450,10,60).discountCents * 2).toBe(6450);
});
test('passes personal, vouchers transferable', () => {
  expect(draftBusinessRules.passesTransferable).toBe(false);
  expect(draftBusinessRules.vouchersTransferable).toBe(true);
});
test('new draft never activates order or public sales release', () => {
  expect(WEBSITE_LEGAL_VERSION).toBe('2026-11-02-review');
  expect(legalTextsFor(WEBSITE_LEGAL_VERSION).released).toBe(false);
  expect(CURRENT_ORDER_LEGAL_VERSION).toBeNull();
  expect(orderLegalReleaseError()).not.toBeNull();
  expect(shopPolicy.salesEnabled).toBe(false);
  expect(legalTextsFor('2026-11-01-review').released).toBe(false);
});