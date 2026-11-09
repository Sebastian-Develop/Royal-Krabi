/** Existing checkout contract: 50 positions, 20 units per position; no new purchase limit. */
export const MAX_CHECKOUT_ITEMS = 50;
export const CHECKOUT_STRING_LIMITS: Readonly<Record<string, number>> = {
  fullName: 100, email: 255, phone: 40, street: 150, postalCode: 5, city: 100,
  country: 2, recipient: 100, giftText: 500, notes: 1000, delivery: 6,
  discountCode: 40, submissionKey: 36,
};
// Six bytes per character covers JSON \uXXXX escaping. Per-line budget includes
// product ID (80), quantity, cents, keys and syntax; RPC allowance covers framing.
export const MAX_CHECKOUT_BODY_BYTES = 6 * (Object.values(CHECKOUT_STRING_LIMITS).reduce((a, b) => a + b, 0) + MAX_CHECKOUT_ITEMS * 128) + 16 * 1024;

/** Bounded, flat shape inspection BEFORE Zod walks or validates individual items. */
export function assertCheckoutInputShape(value: unknown): void {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Ungültige Bestellanfrage.");
  const data = value as Record<string, unknown>;
  const items = data['items'];
  if (!Array.isArray(items) || items.length < 1 || items.length > MAX_CHECKOUT_ITEMS) throw new Error("Bitte prüfen Sie die Anzahl der Warenkorbpositionen.");
  const keys = Object.keys(data);
  if (keys.length > Object.keys(CHECKOUT_STRING_LIMITS).length + 3) throw new Error("Ungültige Bestellfelder.");
  for (const key of keys) {
    if (key === "items") continue;
    const item = data[key];
    const limit = CHECKOUT_STRING_LIMITS[key];
    if (limit !== undefined) {
      if (typeof item !== "string" || item.length > limit) throw new Error("Bestelltext überschreitet die zulässige Länge.");
    } else if (!["acceptTerms", "acknowledgePrivacy"].includes(key) || typeof item !== "boolean") throw new Error("Ungültige Bestellfelder.");
  }
  for (const item of items) {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error("Ungültige Warenkorbposition.");
    const line = item as Record<string, unknown>;
    if (Object.keys(line).length > 3 || Object.keys(line).some(k => !["productId", "quantity", "amountCents"].includes(k))) throw new Error("Ungültige Warenkorbposition.");
    if (typeof line['productId'] !== "string" || line['productId'].length > 80 || typeof line['quantity'] !== "number" || (line['amountCents'] !== undefined && typeof line['amountCents'] !== "number")) throw new Error("Ungültige Warenkorbposition.");
  }
}