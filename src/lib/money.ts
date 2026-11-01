/** Storage constraint, not a business or documented SumUp limit. */
export const MAX_STORED_CENTS = 2_147_483_647;
export const validCents = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value > 0 && value <= MAX_STORED_CENTS;
export function parseEuroCents(input: string): number | null {
  const value = input.trim();
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(value)) return null;
  const [whole = '', decimal = ''] = value.split(/[.,]/);
  const cents = Number(whole) * 100 + Number(decimal.padEnd(2, '0'));
  return validCents(cents) ? cents : null;
}
export const formatCents = (cents: number) => new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }).format(cents / 100) + ' €';
export const formatEuro = (euros: number) => formatCents(Math.round(euros * 100));