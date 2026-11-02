/** Product purchase is separate from unverified online code redemption. */
export const isValueVoucher = (product: { name: string; price: number | null }) => product.price === null && product.name === 'Individueller Wunschbetrag';
export const valueVoucherLabel = 'Wertgutschein · Wunschbetrag';
export const valueVoucherValidity = '24 Monate gültig ab verifiziertem Zahlungseingang.';
export const valueVoucherDraft = {
  validityMonths: 24,
  validityStartsAt: 'verified_payment_receipt',
  legalReviewRequired: true,
  openingDiscountEligible: false,
  royalKrabi20Eligible: false,
  redeemableForEveryMassage: true,
  retainRemainingBalance: true,
  payPriceDifference: true,
  onlineRedemptionEnabled: false,
} as const;
export const valueVoucherDescription = 'Wertgutschein über einen frei wählbaren Betrag, einlösbar für jede Massage. Bei einem höheren Massagepreis zahlen Sie die Differenz zu; bei einem geringeren Massagepreis bleibt das Restguthaben erhalten.';
/** External SumUp gift card shop: the only sales channel for the custom-amount voucher. Amount is chosen and paid there, never in our cart. */
export const sumupGiftCardUrl = 'https://giftcards.sumup.com/order/MYBHT0NC';
export const sumupGiftCardButtonLabel = 'Wunschbetrag bei SumUp wählen';
export const sumupGiftCardHint = 'Wunschbetrag auswählen und direkt bei SumUp bezahlen.';