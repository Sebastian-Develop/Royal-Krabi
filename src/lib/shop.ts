import { z } from "zod";
import { massages, partialMassages, subscriptions, vouchers } from "./content";

export const shopPolicy = { salesEnabled: false, shippingCountry: "DE", shippingProvider: "DHL", shippingCost: 0, minimumOrderValue: 0, minimumQuantity: 1, handoverWorkingDays: 3, automaticRenewal: false, manualAcceptance: true, validityMonths: null, transferable: null } as const;
export const validityNotice = "Gültigkeitsdauer und Nutzungsbedingungen werden vor Abschluss des Kaufs mitgeteilt.";
export const shippingNotice = "Versand innerhalb Deutschlands mit DHL. Kostenfrei. Wir bearbeiten Ihre Bestellung und geben sie nach Prüfung des Zahlungseingangs in der Regel innerhalb von 3 Werktagen bei DHL ein. Die DHL-Laufzeit kommt hinzu. Sie erhalten auf Anfrage einen Einlieferungsbeleg als Nachweis der Übergabe an DHL.";
export type ShopProduct = { id: string; kind: "voucher" | "five" | "ten"; name: string; description: string; price: number | null; regular: number | null; SUMUP_LINK_GUTSCHEIN: string; SUMUP_LINK_5ER_ABO: string; SUMUP_LINK_10ER_ABO: string };
const emptyLinks = { SUMUP_LINK_GUTSCHEIN: "", SUMUP_LINK_5ER_ABO: "", SUMUP_LINK_10ER_ABO: "" };
export const shopProducts: ShopProduct[] = [
  ...vouchers.map(([name, price, description], index) => ({ id: `gutschein-${index + 1}`, kind: "voucher" as const, name: name ?? "Gutschein", description: description || "Zeit, Ruhe und Wohlbefinden verschenken.", price: price?.endsWith(" €") ? Number(price.replace(" €", "")) : null, regular: null, ...emptyLinks })),
  ...subscriptions.map((abo, index) => ({ id: `abo-${index + 1}`, kind: abo.count === 5 ? "five" as const : "ten" as const, name: `${abo.count}er-Abo · ${abo.name}`, description: `${abo.count} Massagen · je ${abo.duration} Minuten. ${[...massages, ...partialMassages].find(m => m.name === abo.name)?.desc ?? ""}`, price: abo.price, regular: abo.regular, ...emptyLinks })),
];
export const getProductLink = (product: ShopProduct) => product.kind === "voucher" ? product.SUMUP_LINK_GUTSCHEIN : product.kind === "five" ? product.SUMUP_LINK_5ER_ABO : product.SUMUP_LINK_10ER_ABO;
export function isApprovedPaymentLink(value: string) {
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password && (url.hostname === "pay.sumup.com" || url.hostname === "sumup.me"); } catch { return false; }
}
export const canPayForProduct = (product: ShopProduct) => shopPolicy.salesEnabled && product.price !== null && isApprovedPaymentLink(getProductLink(product));
const text = (max: number) => z.string().trim().max(max);
export const orderSchema = z.object({
  productId: text(80).refine(id => shopProducts.some(p => p.id === id), "Bitte wählen Sie ein vorhandenes Produkt."),
  fullName: text(100).min(2, "Bitte geben Sie Ihren Vor- und Nachnamen an.").refine(name => name.split(/\s+/).length >= 2, "Bitte geben Sie Vor- und Nachnamen an."),
  email: text(255).email("Bitte geben Sie eine gültige E-Mail-Adresse an."),
  phone: text(40).min(5).regex(/^[+\d\s()./-]+$/, "Bitte geben Sie eine gültige Telefonnummer an."),
  delivery: z.enum(["pickup", "post"]), street: text(150), postalCode: text(5), city: text(100), country: z.literal("DE"),
  recipient: text(100), giftText: text(500), notes: text(1000),
  acceptTerms: z.literal(true), acknowledgePrivacy: z.literal(true),
}).superRefine((data, ctx) => {
  if (data.delivery !== "post") return;
  if (data.street.length < 3) ctx.addIssue({ code: "custom", path: ["street"], message: "Bitte geben Sie Straße und Hausnummer an." });
  if (!/^\d{5}$/.test(data.postalCode)) ctx.addIssue({ code: "custom", path: ["postalCode"], message: "Bitte geben Sie eine fünfstellige deutsche Postleitzahl an." });
  if (data.city.length < 2) ctx.addIssue({ code: "custom", path: ["city"], message: "Bitte geben Sie den Ort an." });
});