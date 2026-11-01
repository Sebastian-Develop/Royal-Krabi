import { z } from "zod";
import { MAX_QUANTITY } from "./cart";
import { orderAddressRefinement, orderSchemaBase, shopProducts } from "./shop";
import { isValueVoucher, valueVoucherLabel } from './value-voucher';
import { MAX_STORED_CENTS, validCents, formatCents } from './money';
import { cartItemKey, type CartItem } from './cart';

/** Eine Warenkorbposition, wie sie das Bestellformular an den Server schickt. */
export const checkoutItemSchema = z.object({
  productId: z.string().trim().min(1).max(80),
  quantity: z.number().int().min(1).max(MAX_QUANTITY),
  amountCents: z.number().int().positive().max(MAX_STORED_CENTS).optional(),
}).superRefine((item, ctx) => {
  const product = shopProducts.find(p => p.id === item.productId);
  if (!product || (isValueVoucher(product) ? !validCents(item.amountCents) : item.amountCents !== undefined)) ctx.addIssue({ code: 'custom', message: 'Bitte prüfen Sie Produkt und Gutscheinwert.' });
});

/**
 * Vollständige Bestellanfrage: Kundendaten wie im bisherigen Formular,
 * plus alle Warenkorbpositionen. Preise werden nie vom Client übernommen.
 */
export const checkoutRequestSchema = orderSchemaBase.omit({ productId: true }).extend({
  items: z.array(checkoutItemSchema).min(1, "Ihr Warenkorb ist leer.").max(50),
  /** Freiwilliger Rabattcode; wird serverseitig gegen Code, Frist und Berechtigung geprüft. */
  discountCode: z.string().trim().max(40).optional().default(""),
  /** Wiederholungsschlüssel des Formulars: dieselbe Übermittlung erzeugt keine zweite Bestellung. */
  submissionKey: z.string().uuid(),
}).superRefine(orderAddressRefinement);
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

/** Bestätigte Laufzeiten ab verifiziertem Zahlungseingang (rechtliche Prüfung bleibt offen). */
export const validityMonthsFor = (kind: string): number => kind === "five" ? 12 : 24;

export type OrderLine = {
  productId: string;
  name: string;
  kind: string;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
};

/**
 * Rechnet Warenkorbpositionen serverseitig gegen den Katalog.
 * Gleiche Produkte werden zusammengefasst; unbekannte oder unverkäufliche
 * Produkte (z. B. Wunschbetrag ohne Festpreis) werden abgelehnt.
 */
export function buildOrderLines(items: CartItem[]): { lines: OrderLine[] } | { error: string } {
  const merged = new Map<string, CartItem>();
  for (const item of items) {
    const quantity = item.quantity;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return { error: "Bitte prüfen Sie die Mengen in Ihrem Warenkorb." };
    }
    const parsed = checkoutItemSchema.safeParse(item);
    if (!parsed.success) return { error: 'Bitte prüfen Sie Produkt und Gutscheinwert.' };
    const key = cartItemKey(item);
    merged.set(key, { ...item, quantity: (merged.get(key)?.quantity ?? 0) + quantity });
  }
  const lines: OrderLine[] = [];
  for (const { productId, quantity, amountCents } of merged.values()) {
    if (quantity > MAX_QUANTITY) return { error: "Bitte prüfen Sie die Mengen in Ihrem Warenkorb." };
    const product = shopProducts.find(p => p.id === productId);
    if (!product || (product.price === null && !isValueVoucher(product))) {
      return { error: "Ein Produkt in Ihrem Warenkorb ist nicht mehr verfügbar. Bitte aktualisieren Sie den Warenkorb." };
    }
    const unitPriceCents = isValueVoucher(product) ? amountCents : Math.round((product.price ?? 0) * 100);
    if (!validCents(unitPriceCents) || !validCents(unitPriceCents * quantity)) return { error: 'Der Betrag überschreitet die technische Speichergrenze. Bitte kontaktieren Sie uns.' };
    lines.push({ productId, name: isValueVoucher(product) ? `${valueVoucherLabel} – Gutscheinwert: ${formatCents(unitPriceCents)}` : product.name, kind: product.kind, quantity, unitPriceCents, subtotalCents: unitPriceCents * quantity });
  }
  if (!lines.length) return { error: "Ihr Warenkorb ist leer." };
  if (!validCents(orderTotalCents(lines))) return { error: 'Die Gesamtsumme überschreitet die technische Speichergrenze. Bitte kontaktieren Sie uns.' };
  return { lines };
}

export const orderTotalCents = (lines: OrderLine[]) => lines.reduce((sum, line) => sum + line.subtotalCents, 0);
/** Euro-Betrag mit zwei Nachkommastellen für die Zahlungsschnittstelle. */
export const centsToAmount = (cents: number) => Math.round(cents) / 100;
