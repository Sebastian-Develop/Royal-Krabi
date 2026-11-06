import { contractAcceptanceNotice } from "./purchase-rules";
import { formatCents as eur } from "./money";
import { legalTextsFor } from "./legal-texts";
import { contact, withdrawalEmail } from "./contact";
import { brandEmailHtml, emailBlocks } from "./application-email";

export interface EmailAttachment {
  filename: string;
  /** Base64-kodierter Dateiinhalt. */
  contentBase64: string;
}

/** Versand über Resend – gleiches Muster wie das Bewerbungsformular, mit Anhängen und Textversion. */
export async function sendOrderEmail(opts: { to: string; subject: string; html: string; text?: string; replyTo?: string; attachments?: EmailAttachment[]; idempotencyKey?: string }): Promise<boolean> {
  const key = process.env["RESEND_API_KEY"];
  if (!key) { console.error("[order-email] RESEND_API_KEY fehlt."); return false; }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(opts.idempotencyKey ? { "Idempotency-Key": opts.idempotencyKey } : {}) },
    body: JSON.stringify({
      from: process.env["RESEND_SHOP_FROM"] || process.env["RESEND_FROM"] || "Royal Krabi Shop <shop@royalkrabi-thaimassage.de>",
      to: [opts.to],
      reply_to: opts.replyTo ?? contact.email,
      subject: opts.subject,
      html: opts.html,
      ...(opts.text ? { text: opts.text } : {}),
      ...(opts.attachments?.length
        ? { attachments: opts.attachments.map(a => ({ filename: a.filename, content: a.contentBase64 })) }
        : {}),
    }),
  });
  if (!res.ok) { console.error(`[order-email] Versand fehlgeschlagen [${res.status}]: ${await res.text()}`); return false; }
  return true;
}

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

const berlinDateTime = (iso: string) =>
  new Date(iso).toLocaleString("de-DE", { timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) + " Uhr";

export type EmailLine = { name: string; kind: string; quantity: number; unitPriceCents: number; subtotalCents: number; validityMonths: number | null };
export type EmailOrder = {
  id: string; fullName: string; email: string; phone: string; delivery: string;
  street: string; postalCode: string; city: string; recipient: string; giftText: string; notes: string;
  totalCents: number; discountCode: string; discountCents: number;
  createdAt: string; paidAt: string | null; legalVersion: string;
  /** Ergebnis der verbindlichen Rabattprüfung zum verifizierten Zahlungseingang (null = nicht geprüft). */
  discountValid?: boolean | null;
};

export const kindLabel = (kind: string) => kind === "test" ? "Echter Testkauf" : kind === "voucher" ? "Gutschein" : kind === "five" ? "5er-Karte" : "10er-Karte";
const deliveryLabel = (order: EmailOrder) => order.delivery === "none" ? "Keine physische Lieferung · keine Versandkosten" : order.delivery === "post"
  ? `Versand mit DHL (kostenfrei) an: ${esc(order.street)}, ${esc(order.postalCode)} ${esc(order.city)}`
  : "Abholung im Studio (wird persönlich mit Ihnen abgestimmt)";

function linesTable(lines: EmailLine[]): string {
  const cell = (numeric: boolean, width: string) => `width="${width}" align="${numeric ? 'right' : 'left'}" valign="top" style="width:${width};border-bottom:1px solid #B98A2F;padding:8px 6px;vertical-align:top;${emailBlocks.whiteText};${numeric ? emailBlocks.num + ';white-space:nowrap' : 'overflow-wrap:anywhere'}"`;
  const rows = lines.map(l => `<tr><td ${cell(false,'40%')}>${emailBlocks.protectText(`${kindLabel(l.kind)}: ${esc(l.name)}${l.validityMonths ? `<br><small>Gültigkeit: ${l.validityMonths} Monate ab Zahlungseingang</small>` : ''}`)}</td><td ${cell(true,'10%')}>${emailBlocks.protectText(String(l.quantity))}</td><td ${cell(true,'25%')}>${emailBlocks.protectText(eur(l.unitPriceCents))}</td><td ${cell(true,'25%')}>${emailBlocks.protectText(eur(l.subtotalCents))}</td></tr>`).join('');
  const heads = ['Produkt','Menge','Einzelpreis','Summe'].map((h,i) => `<th ${cell(i>0,['40%','10%','25%','25%'][i] ?? '25%')}>${h}</th>`).join('');
  return `<table class="email-order-table" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;border-collapse:collapse;margin:0 0 18px;font-family:Arial,sans-serif;font-size:14px"><thead><tr>${heads}</tr></thead><tbody>${rows}</tbody></table>`;
}
function totalsBlock(order: EmailOrder, lines: EmailLine[]): string {
  const subtotal = lines.reduce((s,l) => s+l.subtotalCents,0);
  const row = (label: string, value: string) => `<tr><td align="left" valign="top" style="padding:4px 6px;${emailBlocks.whiteText}">${emailBlocks.protectText(esc(label))}</td><td width="25%" align="right" valign="top" style="padding:4px 6px;width:25%;white-space:nowrap;${emailBlocks.whiteText};${emailBlocks.num}">${emailBlocks.protectText(value)}</td></tr>`;
  return `<table width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;font-family:Arial,sans-serif;font-size:14px">${row('Zwischensumme',eur(subtotal))}${order.discountCents > 0 ? row(`Rabatt (${order.discountCode})`,`−${eur(order.discountCents)}`) : ''}${row('Bezahlter Gesamtbetrag',eur(order.totalCents))}</table><p><small>Alle Preise inklusive Mehrwertsteuer.</small></p>`;
}

export const orderConfirmationSubject = "Ihre Bestellung und Zahlung sind bestätigt – Royal Krabi";

/**
 * Die EINE gemeinsame Kunden-E-Mail nach unabhängig verifizierter Zahlung:
 * Bestellzusammenfassung plus Hinweis auf die vier PDF-Anhänge.
 * Wird ausschließlich aus der bezahlt-Verarbeitung aufgerufen.
 */
export function paymentConfirmedEmail(order: EmailOrder, lines: EmailLine[]): { subject: string; html: string; text: string } {
  const acceptance = order.legalVersion === '2026-11-02-confirmed-review' ? contractAcceptanceNotice : "Ihre Bestellung wird nun von uns persönlich geprüft und angenommen.";
  const hasPrivacy = Boolean(legalTextsFor(order.legalVersion).datenschutz);
  const attachments = 'Bestelleingangsbestätigung.pdf, Zahlungsbestätigung.pdf, AGB.pdf, Widerrufsbelehrung-und-Musterformular.pdf' + (hasPrivacy ? ', Datenschutzinformationen.pdf' : '');
  const greeting = order.fullName.trim() ? `Guten Tag ${esc(order.fullName.trim())},` : "Guten Tag,";
  const meta = emailBlocks.table(
    emailBlocks.label("Ihre Bestellung")
    + emailBlocks.row("Bestellnummer", order.id)
    + emailBlocks.row("Bestellung eingegangen am", berlinDateTime(order.createdAt))
    + (order.paidAt ? emailBlocks.row("Zahlung bestätigt am", berlinDateTime(order.paidAt)) : "")
    + emailBlocks.row("Lieferart", order.delivery === "none" ? "Keine Lieferung (Testkauf)" : order.delivery === "post" ? "DHL-Versand (kostenfrei)" : "Abholung im Studio"),
  );

  const main = [
    emailBlocks.h1("Vielen Dank! Ihre Zahlung wurde bestätigt."),
    emailBlocks.p(`${greeting} Ihre Bestellung und die zugehörige Zahlung sind bei uns bestätigt eingegangen. ${acceptance}`),
    meta,
    emailBlocks.p("Ihre Bestellung im Überblick:"),
    ...(lines.some(line => line.kind === "test") ? [emailBlocks.p("Testpositionen sind echte Testkäufe ohne einlösbaren Gutschein, Massageguthaben oder Royalpass-Sitzungen.")] : []),
    linesTable(lines),
    totalsBlock(order, lines),
    emailBlocks.p(`<b>Lieferart:</b> ${deliveryLabel(order)}`),
    emailBlocks.p(order.delivery === "none" ? "Echter Testkauf: kein einlösbarer Gutschein, kein Massageguthaben und keine Royalpass-Sitzungen. Zahlungs- und Bestellnachweise bleiben erhalten." : "Versandbestellungen geben wir in der Regel innerhalb von 3 Werktagen bei DHL ein; eine Abholung stimmen wir persönlich mit Ihnen ab."),
    emailBlocks.p(`An dieser E-Mail finden Sie ${hasPrivacy ? "fünf" : "vier"} PDF-Dokumente – jeweils in der für Ihre Bestellung maßgeblichen Fassung: ${attachments}.`),
    ...(hasPrivacy ? [emailBlocks.p("Die Datenschutzinformationen sind zur Information beigefügt; damit wird keine Einwilligung verlangt oder erklärt.")] : []),
    emailBlocks.p(`<b>Widerruf:</b> Ihren Widerruf können Sie jederzeit per E-Mail an ${esc(withdrawalEmail)} erklären. Das beigefügte Muster-Widerrufsformular können Sie dafür verwenden, es ist jedoch nicht vorgeschrieben – eine eindeutige Erklärung per E-Mail genügt. Einzelheiten stehen in der beigefügten Widerrufsbelehrung.`),
    emailBlocks.p(`Bei Fragen erreichen Sie uns unter ${esc(contact.phone)} oder ${esc(contact.email)}.`),
  ].join("");

  const text = [
    "Vielen Dank! Ihre Zahlung wurde bestätigt.",
    "",
    `${order.fullName.trim() ? `Guten Tag ${order.fullName.trim()},` : "Guten Tag,"} Ihre Bestellung und die zugehörige Zahlung sind bei uns bestätigt eingegangen. ${acceptance}`,
    "",
    `Bestellnummer: ${order.id}`,
    `Bestellung eingegangen am: ${berlinDateTime(order.createdAt)}`,
    order.paidAt ? `Zahlung bestätigt am: ${berlinDateTime(order.paidAt)}` : "",
    "",
    "Ihre Bestellung:",
    ...lines.map(l => `- ${kindLabel(l.kind)}: ${l.name} – ${l.quantity} × ${eur(l.unitPriceCents)} = ${eur(l.subtotalCents)}${l.validityMonths ? ` (Gültigkeit: ${l.validityMonths} Monate ab Zahlungseingang)` : ""}`),
    order.discountCents > 0 ? `Rabatt (${order.discountCode}): −${eur(order.discountCents)}` : "",
    `Bezahlter Gesamtbetrag: ${eur(order.totalCents)} (alle Preise inklusive Mehrwertsteuer)`,
    "",
    `Lieferart: ${order.delivery === "none" ? "Keine physische Lieferung · keine Versandkosten" : order.delivery === "post" ? `DHL-Versand (kostenfrei) an: ${order.street}, ${order.postalCode} ${order.city}` : "Abholung im Studio (wird persönlich abgestimmt)"}`,
    order.delivery === "none" ? "Echter Testkauf: kein einlösbarer Gutschein, kein Massageguthaben und keine Royalpass-Sitzungen. Nachweise bleiben erhalten." : "Versandbestellungen geben wir in der Regel innerhalb von 3 Werktagen bei DHL ein; eine Abholung stimmen wir persönlich mit Ihnen ab.",
    "",
    `Anhänge: ${attachments}`,
    "",
    `Widerruf: jederzeit per E-Mail an ${withdrawalEmail} – das beigefügte Muster-Widerrufsformular kann verwendet werden, ist aber nicht vorgeschrieben.`,
    "",
    `${contact.name} · ${contact.street}, ${contact.city}`,
    `Telefon: ${contact.phone} · ${contact.email}`,
  ].filter(l => l !== "").join("\n");

  return { subject: orderConfirmationSubject, html: brandEmailHtml({ title: orderConfirmationSubject, main }), text };
}

/** Betreiberbenachrichtigung – ausschließlich nach bestätigter Zahlung. */
export function operatorEmail(order: EmailOrder, lines: EmailLine[]): { subject: string; html: string } {
  return {
    subject: `${lines.some(line => line.kind === "test") ? "Echter Testkauf – " : ""}Zahlung bestätigt – ${order.fullName}`,
    html: `<h2>Bestellung bezahlt</h2>
<p><b>Bestellnummer:</b> ${esc(order.id)}</p>
<p><b>Bestellung eingegangen am:</b> ${berlinDateTime(order.createdAt)}${order.paidAt ? `<br><b>Zahlung bestätigt am:</b> ${berlinDateTime(order.paidAt)}` : ""}</p>
<table>${([["Name", order.fullName], ["E-Mail", order.email], ["Telefon", order.phone], ["Lieferart", order.delivery === "none" ? "Keine Lieferung (Testkauf)" : order.delivery === "post" ? `DHL-Versand: ${order.street}, ${order.postalCode} ${order.city}` : "Abholung"], ["Empfänger", order.recipient || "-"], ["Geschenktext", order.giftText || "-"], ["Anmerkungen", order.notes || "-"]] as [string, string][]).map(([k, v]) => `<tr><td><b>${k}:</b></td><td>${esc(v)}</td></tr>`).join("")}</table>
${linesTable(lines)}${totalsBlock(order, lines)}`,
  };
}
