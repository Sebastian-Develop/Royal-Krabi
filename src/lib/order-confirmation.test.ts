import { describe, expect, test } from "bun:test";
import { orderConfirmationSubject, paymentConfirmedEmail, operatorEmail, type EmailLine, type EmailOrder } from "./order-email";
import { socialProfiles } from "./social";
import { CURRENT_LEGAL_VERSION, legalTextsFor, WEBSITE_LEGAL_VERSION, orderLegalReleaseError } from "./legal-texts";

const order: EmailOrder = {
  id: "11111111-2222-3333-4444-555555555555",
  fullName: "Max Mustermann", email: "max@example.test", phone: "0123 456789", delivery: "post",
  street: "Musterstr. 1", postalCode: "63075", city: "Offenbach am Main", recipient: "", giftText: "", notes: "",
  totalCents: 6800, discountCode: "ROYALKRABI20", discountCents: 1700,
  createdAt: "2026-11-08T10:15:00.000Z", paidAt: "2026-11-08T10:19:00.000Z", legalVersion: CURRENT_LEGAL_VERSION,
};
const lines: EmailLine[] = [
  { name: "Traditionelle Thai-Massage (60 Minuten)", kind: "voucher", quantity: 1, unitPriceCents: 8500, subtotalCents: 8500, validityMonths: 24 },
];

describe("Kundenbestätigung nach Zahlung", () => {
  test("Betreff exakt wie vorgegeben", () => {
    expect(orderConfirmationSubject).toBe("Ihre Bestellung und Zahlung sind bestätigt – Royal Krabi");
    expect(paymentConfirmedEmail(order, lines).subject).toBe(orderConfirmationSubject);
  });

  test("enthält Bestellnummer, beide Zeitpunkte, Rabatt, Gesamtbetrag und Lieferart", () => {
    const { html, text } = paymentConfirmedEmail(order, lines);
    for (const part of [html, text]) {
      expect(part).toContain(order.id);
      expect(part).toContain("08.11.2026");
      expect(part).toContain("ROYALKRABI20");
      expect(part).toContain("68,00");
      expect(part).toContain("DHL");
    }
    expect(html).toContain("Vielen Dank! Ihre Zahlung wurde bestätigt.");
    expect(html).toContain("Bestelleingangsbestätigung.pdf");
    expect(html).toContain("Widerrufsbelehrung-und-Musterformular.pdf");
  });

  test("behauptet weder Abholbereitschaft noch erfolgten Versand", () => {
    const { html, text } = paymentConfirmedEmail(order, lines);
    expect(html + text).not.toContain("abholbereit");
    expect(html + text).not.toContain("wurde versandt");
    expect(html + text).not.toContain("versendet");
  });

  test("Betreiberhinweis enthält Bestellnummer und Kundendaten", () => {
    const mail = operatorEmail(order, lines);
    expect(mail.subject).toContain("Zahlung bestätigt");
    expect(mail.html).toContain(order.id);
    expect(mail.html).toContain("Max Mustermann");
  });
});

describe("Social-Media-Profile", () => {
  test("TikTok und LinkedIn exakt wie vorgegeben verlinkt", () => {
    expect(socialProfiles.find(p => p.id === "tiktok")?.href).toBe("https://www.tiktok.com/@royal.krabiserenit");
    expect(socialProfiles.find(p => p.id === "linkedin")?.href).toBe("https://www.linkedin.com/company/royal-krabi-serenity-thaimassage");
  });

  test("Instagram, Facebook und Tripadvisor unverändert", () => {
    expect(socialProfiles.find(p => p.id === "instagram")?.href).toBe("https://www.instagram.com/royalkrabithaimassage");
    expect(socialProfiles.find(p => p.id === "facebook")?.href).toBe("https://www.facebook.com/Royalkrabiserenitythaimassage/");
    expect(socialProfiles.find(p => p.id === "tripadvisor")?.href).toContain("tripadvisor.de");
  });

  test("alle fünf Profile sind verlinkt", () => {
    expect(socialProfiles.every(p => p.href.length > 0)).toBe(true);
  });
});

describe("Rechtstext-Versionierung", () => {
  test("aktuelle Fassung ist bekannt und vollständig", () => {
    const legal = legalTextsFor(CURRENT_LEGAL_VERSION);
    expect(legal.agb.length).toBeGreaterThanOrEqual(11);
    expect(legal.widerruf.length).toBeGreaterThanOrEqual(4);
    expect(legal.widerrufForm.join(" ")).toContain("Hiermit widerrufe");
  });

  test("unbekannte gespeicherte Fassung wird niemals ersetzt", () => {
    expect(() => legalTextsFor("unbekannt")).toThrow();
  });
  test("neue Bestellfassung muss vollständig freigegeben sein", () => {
    expect(orderLegalReleaseError()).not.toBeNull();
    expect(legalTextsFor(WEBSITE_LEGAL_VERSION).released).toBe(false);
  });
  test("neue und alte Fassungen bleiben getrennt und unverändert", () => {
    const original = legalTextsFor('2026-10-21');
    const changed = legalTextsFor(WEBSITE_LEGAL_VERSION);
    changed.agb[0]?.paragraphs.push('Changed locally');
    expect(legalTextsFor('2026-10-21')).toEqual(original);
    expect(original.datenschutz).toBeUndefined();
    expect(legalTextsFor(WEBSITE_LEGAL_VERSION).datenschutz).toHaveLength(10);
    expect(legalTextsFor(WEBSITE_LEGAL_VERSION).agb[0]?.paragraphs).not.toContain('Changed locally');
  });
});

describe("PDF-Anhänge", () => {
  test("vier getrennte, lesbare PDFs mit korrekten Dateinamen", async () => {
    const { buildOrderPdfs } = await import("./order-pdf.server");
    if (!order.paidAt) throw new Error('missing test payment time');
    const pdfs = await buildOrderPdfs(order, lines, { createdAt: order.createdAt, paidAt: order.paidAt, legalVersion: order.legalVersion });
    expect(pdfs.map(p => p.filename)).toEqual([
      "Bestelleingangsbestätigung.pdf",
      "Zahlungsbestätigung.pdf",
      "AGB.pdf",
      "Widerrufsbelehrung-und-Musterformular.pdf",
    ]);
    for (const pdf of pdfs) {
      expect(pdf.bytes.length).toBeGreaterThan(1000);
      expect(new TextDecoder("latin1").decode(pdf.bytes.subarray(0, 5))).toBe("%PDF-");
    }
  });
  test('fünf neue Anhänge nur im ausdrücklich gekennzeichneten Testmodus', async () => {
    const { buildOrderPdfs } = await import('./order-pdf.server');
    const meta = { createdAt: order.createdAt, paidAt: '2026-11-08T10:19:00Z', legalVersion: WEBSITE_LEGAL_VERSION };
    await expect(buildOrderPdfs(order, lines, meta)).rejects.toThrow('nicht zum Versand freigegeben');
    const pdfs = await buildOrderPdfs({ ...order, legalVersion: WEBSITE_LEGAL_VERSION }, lines, { ...meta, preview: true });
    expect(pdfs.map(p => p.filename)).toEqual(['Bestelleingangsbestätigung.pdf', 'Zahlungsbestätigung.pdf', 'AGB.pdf', 'Widerrufsbelehrung-und-Musterformular.pdf', 'Datenschutzinformationen.pdf']);
  });
});
