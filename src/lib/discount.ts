import { shopProducts } from "./shop";
import type { OrderLine } from "./shop-checkout";

/**
 * Neueröffnungsrabatt – bestätigte Regeln (01.11.2026):
 * Code ROYALKRABI20, 20 % auf Angebote ab 60 Minuten (Gutscheine mit fester
 * Dauer und 5er-/10er-Karten), Basis ist der ausgewiesene Verkaufs- bzw.
 * Paketpreis. Kein Rabatt unter 60 Minuten und nicht auf den freien
 * Wunschbetrag. Zeitraum 07.11.–21.11.2026 (Europe/Berlin), nicht mit
 * anderen Aktionen oder dem Treuepass kombinierbar.
 * Offen: maßgeblicher Aktionszeitpunkt (Bestellung oder Zahlung) – aktuell
 * wird der Zeitpunkt der Bestellübermittlung geprüft.
 */
export const openingDiscount = {
  code: "ROYALKRABI20",
  percent: 20,
  minMinutes: 60,
  validFrom: "2026-11-07",
  validUntil: "2026-11-21",
  timezone: "Europe/Berlin",
} as const;

export const normalizeDiscountCode = (value: string) => value.trim().toUpperCase();

/** Kalenderdatum in Europe/Berlin als "JJJJ-MM-TT" – Grundlage der Aktionsfrist. */
export function berlinDateString(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: openingDiscount.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function isDiscountActiveAt(now: Date): boolean {
  const day = berlinDateString(now);
  return day >= openingDiscount.validFrom && day <= openingDiscount.validUntil;
}

/** Eine Position ist berechtigt, wenn ihre Massage mindestens 60 Minuten dauert. */
export function isLineEligible(line: OrderLine): boolean {
  const product = shopProducts.find(p => p.id === line.productId);
  return product?.duration !== null && product?.duration !== undefined && product.duration >= openingDiscount.minMinutes;
}

export type DiscountResult = { ok: true; discountCents: number; eligibleCents: number } | { ok: false; error: string };

/**
 * Prüft Code, Aktionszeitraum und Berechtigung und berechnet den Rabatt in Cent.
 * `now` ist bewusst ein Parameter, damit die Frist mit kontrollierter Testzeit geprüft wird.
 */
export function discountForLines(lines: OrderLine[], code: string, now: Date): DiscountResult {
  if (normalizeDiscountCode(code) !== openingDiscount.code) {
    return { ok: false, error: "Der Rabattcode ist ungültig." };
  }
  if (!isDiscountActiveAt(now)) {
    return { ok: false, error: "Die Rabattaktion gilt vom 07.11. bis einschließlich 21.11.2026." };
  }
  const eligibleCents = lines.filter(isLineEligible).reduce((sum, line) => sum + line.subtotalCents, 0);
  if (eligibleCents === 0) {
    return { ok: false, error: "Der Rabatt gilt nur für Angebote ab 60 Minuten." };
  }
  return { ok: true, discountCents: Math.round(eligibleCents * openingDiscount.percent / 100), eligibleCents };
}
