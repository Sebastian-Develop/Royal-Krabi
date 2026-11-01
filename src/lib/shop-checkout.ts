import { z } from "zod";
import { MAX_QUANTITY } from "./cart";
import { orderAddressRefinement, orderSchemaBase, shopProducts } from "./shop";

/** Eine Warenkorbposition, wie sie das Bestellformular an den Server schickt. */
export const checkoutItemSchema = z.object({
  productId: z.string().trim().min(1).max(80),
  quantity: z.number().int().min(1).max(MAX_QUANTITY),
});

/**
 * Vollständige Bestellanfrage: Kundendaten wie im bisherigen Formular,
 * plus alle Warenkorbpositionen. Preise werden nie vom Client übernommen.
 */
export const checkoutRequestSchema = orderSchemaBase.omit({ productId: true }).extend({
  items: z.array(checkoutItemSchema).min(1, "Ihr Warenkorb ist leer.").max(50),
}).superRefine(orderAddressRefinement);
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

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
export function buildOrderLines(items: { productId: string; quantity: number }[]): { lines: OrderLine[] } | { error: string } {
  const merged = new Map<string, number>();
  for (const item of items) {
    const quantity = Math.floor(Number(item.quantity));
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return { error: "Bitte prüfen Sie die Mengen in Ihrem Warenkorb." };
    }
    merged.set(item.productId, (merged.get(item.productId) ?? 0) + quantity);
  }
  const lines: OrderLine[] = [];
  for (const [productId, quantity] of merged) {
    if (quantity > MAX_QUANTITY) return { error: "Bitte prüfen Sie die Mengen in Ihrem Warenkorb." };
    const product = shopProducts.find(p => p.id === productId);
    if (!product || product.price === null) {
      return { error: "Ein Produkt in Ihrem Warenkorb ist nicht mehr verfügbar. Bitte aktualisieren Sie den Warenkorb." };
    }
    const unitPriceCents = Math.round(product.price * 100);
    lines.push({ productId, name: product.name, kind: product.kind, quantity, unitPriceCents, subtotalCents: unitPriceCents * quantity });
  }
  if (!lines.length) return { error: "Ihr Warenkorb ist leer." };
  return { lines };
}

export const orderTotalCents = (lines: OrderLine[]) => lines.reduce((sum, line) => sum + line.subtotalCents, 0);
/** Euro-Betrag mit zwei Nachkommastellen für die Zahlungsschnittstelle. */
export const centsToAmount = (cents: number) => Math.round(cents) / 100;
