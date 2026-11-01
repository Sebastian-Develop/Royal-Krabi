/** Internal review requirements only; neither sales nor code redemption are enabled. */
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