/**
 * Serverseitige PDF-Erstellung für Bestellunterlagen (nur Server).
 * Vier getrennte Dokumente je bezahlter Bestellung: Bestelleingangsbestätigung,
 * Zahlungsbestätigung, AGB und Widerrufsbelehrung mit Musterformular.
 * Reine Text-PDFs mit hellem Hintergrund, Logo und dezenten Goldakzenten.
 */
import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";
import { contractAcceptanceNotice } from "./purchase-rules";
import { contact } from "./contact";
import { legalTextsFor } from "./legal-texts";
import type { EmailLine, EmailOrder } from "./order-email";
import logoAsset from "@/assets/email/email-logo.png.asset.json";
import { formatCents as eur } from './money';

const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;
const MARGIN = 56;
const CONTENT_W = PAGE_W - MARGIN * 2;

const MAHOGANY = rgb(0x4a / 255, 0x21 / 255, 0x0f / 255);
const GOLD = rgb(0xb9 / 255, 0x8a / 255, 0x2f / 255);
const CREAM_BG = rgb(0xfd / 255, 0xf8 / 255, 0xef / 255);
const TEXT = rgb(0x3a / 255, 0x2a / 255, 0x1a / 255);
const MUTED = rgb(0x6b / 255, 0x55 / 255, 0x40 / 255);

const berlinDateTime = (iso: string) =>
  new Date(iso).toLocaleString("de-DE", { timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) + " Uhr";

const kindLabel = (kind: string) => (kind === "voucher" ? "Gutschein" : kind === "five" ? "5er-Karte" : "10er-Karte");

/** Only historical versions retain their original document presentation. */
function validityEnd(paidAt: string, months: number): string {
  const d = new Date(paidAt);
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString("de-DE", { timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit", year: "numeric" });
}
interface Ctx {
  doc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  bold: PDFFont;
  y: number;
}

function newPage(ctx: Ctx): void {
  ctx.page = ctx.doc.addPage([PAGE_W, PAGE_H]);
  ctx.page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: CREAM_BG });
  ctx.y = PAGE_H - MARGIN;
}

function ensureSpace(ctx: Ctx, needed: number): void {
  if (ctx.y - needed < MARGIN) newPage(ctx);
}

/** WinAnsi kann einige Unicode-Zeichen nicht kodieren – auf nahe Entsprechungen abbilden. */
const pdfSafe = (text: string) => text.replace(/−/g, "-").replace(/[‎‏‎]/g, "");

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = pdfSafe(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function paragraph(ctx: Ctx, text: string, opts: { size?: number; font?: PDFFont; color?: typeof TEXT; gapAfter?: number } = {}): void {
  const size = opts.size ?? 10;
  const font = opts.font ?? ctx.font;
  const lineHeight = size * 1.45;
  for (const line of wrapText(text, font, size, CONTENT_W)) {
    ensureSpace(ctx, lineHeight);
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y - size, size, font, color: opts.color ?? TEXT });
    ctx.y -= lineHeight;
  }
  ctx.y -= opts.gapAfter ?? 6;
}

function heading(ctx: Ctx, text: string, size = 13): void {
  ensureSpace(ctx, size * 2.4);
  ctx.y -= 4;
  paragraph(ctx, text, { size, font: ctx.bold, color: MAHOGANY, gapAfter: 2 });
  ctx.page.drawLine({ start: { x: MARGIN, y: ctx.y }, end: { x: MARGIN + CONTENT_W, y: ctx.y }, thickness: 0.7, color: GOLD });
  ctx.y -= 10;
}

async function drawHeader(ctx: Ctx, docTitle: string): Promise<void> {
  // Logo von der öffentlichen Asset-Adresse; bei Fehler Text-Schriftzug.
  let logoDrawn = false;
  try {
    const res = await fetch(`https://royalkrabi-thaimassage.de${logoAsset.url}`);
    if (res.ok) {
      const png = await ctx.doc.embedPng(await res.arrayBuffer());
      const w = 90;
      const h = (png.height / png.width) * w;
      ctx.page.drawImage(png, { x: (PAGE_W - w) / 2, y: ctx.y - h, width: w, height: h });
      ctx.y -= h + 10;
      logoDrawn = true;
    }
  } catch { /* unten Text-Fallback */ }
  if (!logoDrawn) {
    const name = contact.name;
    const w = ctx.bold.widthOfTextAtSize(name, 15);
    ctx.page.drawText(name, { x: (PAGE_W - w) / 2, y: ctx.y - 15, size: 15, font: ctx.bold, color: MAHOGANY });
    ctx.y -= 30;
  }
  const tw = ctx.bold.widthOfTextAtSize(docTitle, 16);
  ctx.page.drawText(docTitle, { x: (PAGE_W - tw) / 2, y: ctx.y - 16, size: 16, font: ctx.bold, color: MAHOGANY });
  ctx.y -= 24;
  ctx.page.drawLine({ start: { x: MARGIN, y: ctx.y }, end: { x: MARGIN + CONTENT_W, y: ctx.y }, thickness: 1.2, color: GOLD });
  ctx.y -= 16;
}

function footer(ctx: Ctx, note: string): void {
  // Fußzeile auf jeder Seite: Kontakt ohne erfundene Angaben.
  const pages = ctx.doc.getPages();
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: MARGIN, y: MARGIN - 14 }, end: { x: MARGIN + CONTENT_W, y: MARGIN - 14 }, thickness: 0.5, color: GOLD });
    const line1 = `${contact.name} · ${contact.street}, ${contact.city} · ${contact.phone} · ${contact.email}`;
    p.drawText(line1, { x: MARGIN, y: MARGIN - 28, size: 7.5, font: ctx.font, color: MUTED });
    p.drawText(`${note} · Seite ${i + 1} von ${pages.length}`, { x: MARGIN, y: MARGIN - 38, size: 7.5, font: ctx.font, color: MUTED });
  });
}

function positionsTable(ctx: Ctx, lines: EmailLine[]): void {
  const cols = [0, 255, 353, CONTENT_W]; // stable right edges for numeric columns
  const heads = ["Produkt", "Menge", "Einzelpreis", "Zwischensumme"];
  const rowH = 16;
  ensureSpace(ctx, rowH * 2);
  const drawCell = (text: string, index: number, y: number, bold = false) => { const font = bold ? ctx.bold : ctx.font; const edge = cols[index] ?? 0; ctx.page.drawText(text, { x: MARGIN + edge - (index ? font.widthOfTextAtSize(text, 9) : 0), y, size: 9, font, color: bold ? MAHOGANY : TEXT }); };
  heads.forEach((h, i) => drawCell(h, i, ctx.y - 10, true));
  ctx.y -= rowH;
  ctx.page.drawLine({ start: { x: MARGIN, y: ctx.y }, end: { x: MARGIN + CONTENT_W, y: ctx.y }, thickness: 0.5, color: GOLD });
  ctx.y -= 4;
  for (const l of lines) {
    const label = `${kindLabel(l.kind)}: ${l.name}`;
    const wrapped = wrapText(label, ctx.font, 9, 214);
    const h = Math.max(rowH, wrapped.length * 12 + 6);
    ensureSpace(ctx, h);
    wrapped.forEach((line, i) => drawCell(line, 0, ctx.y - 10 - i * 12));
    drawCell(String(l.quantity), 1, ctx.y - 10);
    drawCell(eur(l.unitPriceCents), 2, ctx.y - 10);
    drawCell(eur(l.subtotalCents), 3, ctx.y - 10);
    ctx.y -= h;
  }
  ctx.page.drawLine({ start: { x: MARGIN, y: ctx.y }, end: { x: MARGIN + CONTENT_W, y: ctx.y }, thickness: 0.5, color: GOLD });
  ctx.y -= 10;
}

function totals(ctx: Ctx, order: EmailOrder, lines: EmailLine[]): void {
  const subtotal = lines.reduce((s, l) => s + l.subtotalCents, 0);
  const row = (label: string, amount: string, bold = false) => { ensureSpace(ctx, 20); const font = bold ? ctx.bold : ctx.font; ctx.page.drawText(label, { x: MARGIN, y: ctx.y - 10, size: 10, font, color: TEXT }); ctx.page.drawText(pdfSafe(amount), { x: PAGE_W - MARGIN - font.widthOfTextAtSize(pdfSafe(amount), 10), y: ctx.y - 10, size: 10, font, color: TEXT }); ctx.y -= 20; };
  row('Zwischensumme', eur(subtotal));
  if (order.discountCents > 0) row(`Rabatt (${order.discountCode})`, `−${eur(order.discountCents)}`);
  row('Gesamtbetrag', eur(order.totalCents), true);
  paragraph(ctx, "Alle Preise inklusive Mehrwertsteuer.", { size: 8.5, color: MUTED });
}

const deliveryText = (order: EmailOrder) =>
  order.delivery === "post"
    ? `Versand mit DHL (kostenfrei) an: ${order.street}, ${order.postalCode} ${order.city}`
    : "Abholung im Studio (wird persönlich abgestimmt)";

export interface OrderMeta {
  createdAt: string;
  paidAt: string;
  legalVersion: string;
  /** Only offline sample generation can opt into draft documents. */
  preview?: boolean;
}

export interface OrderPdf {
  filename: string;
  bytes: Uint8Array;
}

async function newCtx(): Promise<Ctx> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ctx: Ctx = { doc, page: undefined as unknown as PDFPage, font, bold, y: 0 };
  newPage(ctx);
  return ctx;
}

/** A – Bestelleingangsbestätigung mit tatsächlichem Eingangszeitpunkt. */
async function pdfOrderReceived(order: EmailOrder, lines: EmailLine[], meta: OrderMeta): Promise<OrderPdf> {
  const ctx = await newCtx();
  await drawHeader(ctx, "Bestelleingangsbestätigung");
  if (meta.preview) paragraph(ctx, 'TESTDATEN – VORSCHAU, KEINE FREIGABE', { font: ctx.bold });
  paragraph(ctx, `${contact.name}, ${contact.street}, ${contact.city}, Deutschland`, { size: 9, color: MUTED, gapAfter: 2 });
  paragraph(ctx, `Telefon: ${contact.phone} · E-Mail: ${contact.email} · ${contact.website}`, { size: 9, color: MUTED });
  heading(ctx, "Bestelldaten");
  paragraph(ctx, `Bestellnummer: ${order.id}`, { font: ctx.bold, gapAfter: 2 });
  paragraph(ctx, `Bestellung eingegangen am: ${berlinDateTime(meta.createdAt)}`, { gapAfter: 2 });
  paragraph(ctx, `Kunde: ${order.fullName}, ${order.email}`, { gapAfter: 2 });
  paragraph(ctx, `Lieferart: ${deliveryText(order)}`);
  heading(ctx, "Bestellte Positionen");
  positionsTable(ctx, lines);
  totals(ctx, order, lines);
  heading(ctx, "Produktbedingungen");
  if (meta.legalVersion === '2026-11-02-review' || meta.legalVersion === '2026-11-02-confirmed-review') {
    paragraph(ctx, "Gültigkeit und Nutzungsbedingungen finden Sie in den beigefügten AGB der zu dieser Bestellung gespeicherten Fassung.", { size: 9 });
  } else {
    for (const l of lines) if (l.validityMonths) paragraph(ctx, `${kindLabel(l.kind)} „${l.name}": Gültigkeit ${l.validityMonths} Monate ab bestätigtem Zahlungseingang.`, { size: 9, gapAfter: 3 });
  }
  paragraph(ctx, meta.legalVersion === '2026-11-02-confirmed-review' ? contractAcceptanceNotice : meta.legalVersion === '2026-11-02-review' || meta.legalVersion === '2026-11-02-confirmed-review'
    ? "Entwurf: Diese Bestätigung dokumentiert den elektronischen Eingang. Eine ausdrückliche automatische Vertragsannahme nach verifizierter Zahlung ist noch gesondert zu bestätigen und umzusetzen; Zahlung allein ist keine Annahme."
    : "Diese Bestätigung dokumentiert den elektronischen Eingang der Bestellung. Der Vertragsschluss erfolgt erst durch unsere ausdrückliche manuelle Annahme.", { size: 9, color: MUTED });
  footer(ctx, "Bestelleingangsbestätigung");
  return { filename: "Bestelleingangsbestätigung.pdf", bytes: await ctx.doc.save() };
}

/** B – Zahlungsbestätigung mit Verifizierungszeitpunkt und Gültigkeiten. */
async function pdfPaymentConfirmed(order: EmailOrder, lines: EmailLine[], meta: OrderMeta): Promise<OrderPdf> {
  const ctx = await newCtx();
  await drawHeader(ctx, "Zahlungsbestätigung");
  if (meta.preview) paragraph(ctx, 'TESTDATEN – VORSCHAU, KEINE FREIGABE', { font: ctx.bold });
  heading(ctx, "Zahlung");
  paragraph(ctx, `Bestellnummer: ${order.id}`, { font: ctx.bold, gapAfter: 2 });
  paragraph(ctx, `Zahlung bestätigt am (Verifizierungszeitpunkt): ${berlinDateTime(meta.paidAt)}`, { gapAfter: 2 });
  paragraph(ctx, `Bestätigter Betrag: ${eur(order.totalCents)} (EUR)`, { font: ctx.bold, gapAfter: 2 });
  paragraph(ctx, "Zahlungsdienstleister: SumUp", { gapAfter: 2 });
  paragraph(ctx, "Diese Bestätigung ist keine steuerlich vollständige Rechnung.", { size: 9, color: MUTED });
  heading(ctx, meta.legalVersion === '2026-11-02-review' || meta.legalVersion === '2026-11-02-confirmed-review' ? "Zugehörige Positionen" : "Zugehörige Positionen und Gültigkeit");
  positionsTable(ctx, lines);
  if (meta.legalVersion === '2026-11-02-review' || meta.legalVersion === '2026-11-02-confirmed-review') {
    paragraph(ctx, "Gültigkeit und Nutzungsbedingungen finden Sie in den beigefügten AGB der zu dieser Bestellung gespeicherten Fassung.", { size: 9 });
  } else {
    for (const l of lines) if (l.validityMonths) paragraph(ctx, `${kindLabel(l.kind)} „${l.name}": gültig ab ${berlinDateTime(meta.paidAt)} bis ${validityEnd(meta.paidAt, l.validityMonths)}.`, { size: 9, gapAfter: 3 });
  }
  if (meta.legalVersion === '2026-11-02-confirmed-review') paragraph(ctx, contractAcceptanceNotice, { size: 9, color: MUTED });
  footer(ctx, "Zahlungsbestätigung");
  return { filename: "Zahlungsbestätigung.pdf", bytes: await ctx.doc.save() };
}

/** C – AGB in der bei der Bestellung maßgeblichen Fassung. */
async function pdfAgb(meta: OrderMeta): Promise<OrderPdf> {
  const legal = legalTextsFor(meta.legalVersion);
  const ctx = await newCtx();
  await drawHeader(ctx, "Allgemeine Geschäftsbedingungen");
  if (meta.preview) paragraph(ctx, 'TESTDATEN – VORSCHAU, KEINE FREIGABE', { font: ctx.bold });
  paragraph(ctx, `Fassung vom ${legal.version}`, { size: 9, color: MUTED });
  for (const section of legal.agb) {
    heading(ctx, section.title, 11);
    for (const p of section.paragraphs) paragraph(ctx, p, { size: 9.5 });
  }
  footer(ctx, `AGB, Fassung ${legal.version}`);
  return { filename: "AGB.pdf", bytes: await ctx.doc.save() };
}

/** D – Widerrufsbelehrung und Muster-Widerrufsformular in der Bestellfassung. */
async function pdfWiderruf(meta: OrderMeta): Promise<OrderPdf> {
  const legal = legalTextsFor(meta.legalVersion);
  const ctx = await newCtx();
  await drawHeader(ctx, "Widerrufsbelehrung & Muster-Widerrufsformular");
  if (meta.preview) paragraph(ctx, 'TESTDATEN – VORSCHAU, KEINE FREIGABE', { font: ctx.bold });
  paragraph(ctx, `Fassung vom ${legal.version}`, { size: 9, color: MUTED });
  for (const section of legal.widerruf) {
    heading(ctx, section.title, 11);
    for (const p of section.paragraphs) paragraph(ctx, p, { size: 9.5 });
  }
  heading(ctx, "Muster-Widerrufsformular", 11);
  for (const p of legal.widerrufForm) paragraph(ctx, p, { size: 9.5 });
  footer(ctx, `Widerrufsbelehrung, Fassung ${legal.version}`);
  return { filename: "Widerrufsbelehrung-und-Musterformular.pdf", bytes: await ctx.doc.save() };
}

async function pdfPrivacy(meta: OrderMeta): Promise<OrderPdf> {
  const legal = legalTextsFor(meta.legalVersion);
  const ctx = await newCtx();
  await drawHeader(ctx, 'Datenschutzinformationen');
  if (meta.preview) paragraph(ctx, 'TESTDATEN – VORSCHAU, KEINE FREIGABE', { font: ctx.bold });
  paragraph(ctx, `Fassung ${legal.version} – Information, keine Einwilligung.`, { size: 9 });
  for (const section of legal.datenschutz ?? []) { heading(ctx, section.title, 11); for (const text of section.paragraphs) paragraph(ctx, text, { size: 9.5 }); }
  footer(ctx, `Datenschutzinformationen, Fassung ${legal.version}`);
  return { filename: 'Datenschutzinformationen.pdf', bytes: await ctx.doc.save() };
}

/** Builds only the exact saved version; historical four-document releases stay unchanged. */
export async function buildOrderPdfs(order: EmailOrder, lines: EmailLine[], meta: OrderMeta): Promise<OrderPdf[]> {
  const legal = legalTextsFor(meta.legalVersion);
  if (!meta.preview && !legal.released) throw new Error('Rechtstextentwurf nicht zum Versand freigegeben.');
  return [
    await pdfOrderReceived(order, lines, meta),
    await pdfPaymentConfirmed(order, lines, meta),
    await pdfAgb(meta),
    await pdfWiderruf(meta),
    ...(legal.datenschutz ? [await pdfPrivacy(meta)] : []),
  ];
}
