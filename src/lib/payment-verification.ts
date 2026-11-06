export type ProviderCheckout = { id: string; status: string; reference: string; amount: number; currency: string };
/** A status claim alone is never proof of payment for our order. */
export function matchesStoredPayment(checkout: ProviderCheckout, expected: { checkoutId: string; orderId: string; totalCents: number; currency: string }): boolean {
  const cents = checkout.amount * 100;
  return checkout.id === expected.checkoutId && checkout.reference === expected.orderId
    && checkout.currency === expected.currency && Number.isFinite(cents)
    && Math.abs(cents - Math.round(cents)) < 0.000001 && Math.round(cents) === expected.totalCents;
}