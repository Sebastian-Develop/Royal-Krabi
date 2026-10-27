/** Approved service-contract variant; future online sales remain disabled. */
export const withdrawalTerms = {
  periodDays: 14,
  periodStart: "Vertragsabschluss",
  repaymentDays: 14,
  automaticRenewal: false,
  withdrawalFee: 0,
} as const;