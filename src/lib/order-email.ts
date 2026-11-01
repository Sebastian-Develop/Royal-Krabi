import { contact } from "./contact";
import { brandEmailHtml, emailBlocks } from "./application-email";

export interface EmailAttachment {
  filename: string;
  /** Base64-kodierter Dateiinhalt. */
  contentBase64: string;
}

/** Versand über Resend – gleiches Muster wie das Bewerbungsformular, mit Anhängen und Textversion. */
export async function sendOrderEmail(opts: { to: string; subject: string; html: string; text?: string; replyTo?: string; attachments?: EmailAttachment[] }): Promise<boolean> {
  const key = process.env["RESEND_API_KEY"];
  if (!key) { console.error("[order-email] RESEND_API_KEY fehlt."); return false; }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
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

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const eur = (cents: number) => `${(cents / 100).toFixed(2).replace(".", ",")} €`;
const berlinDateTime = (iso: string) =>
  new Date(iso).toLocaleString("de-DE", { timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) + " Uhr";

export type EmailLine = { name: string; kind: string; quantity: number; unitPriceCents: number; subtotalCents: number; validityMonths: number | null };
export type EmailOrder = {
  id: string; fullName: string; email: string; phone: string; delivery: string;
  street: string; postalCode: string; city: string; recipient: string; giftText: string; notes: string;
  totalCents: number; discountCode: string; discountCents: number;
  createdAt: string; paidAt: string | null; legalVersion: string;
};

export const kindLabel = (kind: string) => kind === "voucher" ? "Gutschein" : kind === "five" ? "5er-Karte" : "10er-Karte";
const deliveryLabel = (order: EmailOrder) => order.delivery === "post"
  ? `Versand mit DHL (kostenfrei) an: ${esc(order.street)}, ${esc(order.postalCode)} ${esc(order.city)}`
  : "Abholung im Studio (wird persönlich mit Ihnen abgestimmt)";

function linesTable(lines: EmailLine[]): string {
  const cell = `style="border-bottom:1px solid #B98A2F;padding:8px 6px;vertical-align:top"`;
  const rows = lines.map(l =>
    `<tr><td ${cell}>${kindLabel(l.kind)}: ${esc(l.name)}${l.validityMonths ? `<br><small>Gültigkeit: ${l.validityMonths} Monate ab Zahlungseingang</small>` : ""}</td><td ${cell}>${l.quantity}</td><td ${cell}>${eur(l.unitPriceCents)}</td><td ${cell}>${eur(l.subtotalCents)}</td></tr>`,
  ).join("");
  const head = ["Produkt", "Menge", "Einzelpreis", "Zwischensumme"].map(h => `<th align="left" style="border-bottom:2px solid #B98A2F;padding:6px;text-transform:uppercase;font-size:11px">${h}</th>`).join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 18px;font-size:14px"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
}

function totalsBlock(order: EmailOrder, lines: EmailLine[]): string {
  const subtotal = lines.reduce((s, l) => s + l.subtotalCents, 0);
  const discount = order.discountCents > 0
    ? `<p style="margin:0 0 6px"><b>Rabatt (${esc(order.discountCode)}):</b> −${eur(order.discountCents)}</p>` : "";
  return `<p style="margin:0 0 6px"><b>Zwischensumme:</b> ${eur(subtotal)}</p>${discount}<p style="margin:0 0 6px"><b>Bezahlter Gesamtbetrag:</b> ${eur(order.totalCents)}</p><p style="margin:0 0 14px"><small>Alle Preise inklusive Mehrwertsteuer.</small></p>`;
}

export const orderConfirmationSubject = "Ihre Bestellung und Zahlung sind bestätigt – Royal Krabi";

/**
 * Die EINE gemeinsame Kunden-E-Mail nach unabhängig verifizierter Zahlung:
 * Bestellzusammenfassung plus Hinweis auf die vier PDF-Anhänge.
 * Wird ausschließlich aus der bezahlt-Verarbeitung aufgerufen.
 */
export function paymentConfirmedEmail(order: EmailOrder, lines: EmailLine[]): { subject: string; html: string; text: string } {
  const greeting = order.fullName.trim() ? `Guten Tag ${esc(order.fullName.trim())},` : "Guten Tag,";
  const meta = emailBlocks.table(
    emailBlocks.label("Ihre Bestellung")
    + emailBlocks.row("Bestellnummer", order.id)
    + emailBlocks.row("Bestellung eingegangen am", berlinDateTime(order.createdAt))
    + (order.paidAt ? emailBlocks.row("Zahlung bestätigt am", berlinDateTime(order.paidAt)) : "")
    + emailBlocks.row("Lieferart", order.delivery === "post" ? "DHL-Versand (kostenfrei)" : "Abholung im Studio"),
  );

  const main = [
    emailBlocks.h1("Vielen Dank! Ihre Zahlung wurde bestätigt."),
    emailBlocks.p(`${greeting} Ihre Bestellung und die zugehörige Zahlung sind bei uns bestätigt eingegangen. Ihre Bestellung wird nun von uns persönlich geprüft und angenommen.`),
    meta,
    emailBlocks.p("Ihre Bestellung im Überblick:"),
    linesTable(lines),
    totalsBlock(order, lines),
    emailBlocks.p(`<b>Lieferart:</b> ${deliveryLabel(order)}`),
    emailBlocks.p("Versandbestellungen geben wir in der Regel innerhalb von 3 Werktagen bei DHL ein; eine Abholung stimmen wir persönlich mit Ihnen ab."),
    emailBlocks.p("An dieser E-Mail finden Sie vier PDF-Dokumente – jeweils in der für Ihre Bestellung maßgeblichen Fassung: Bestelleingangsbestätigung.pdf, Zahlungsbestätigung.pdf, AGB.pdf und Widerrufsbelehrung-und-Musterformular.pdf."),
    emailBlocks.p(`Bei Fragen erreichen Sie uns unter ${esc(contact.phone)} oder ${esc(contact.email)}.`),
  ].join("");

  const text = [
    "Vielen Dank! Ihre Zahlung wurde bestätigt.",
    "",
    `${order.fullName.trim() ? `Guten Tag ${order.fullName.trim()},` : "Guten Tag,"} Ihre Bestellung und die zugehörige Zahlung sind bei uns bestätigt eingegangen. Ihre Bestellung wird nun von uns persönlich geprüft und angenommen.`,
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
    `Lieferart: ${order.delivery === "post" ? `DHL-Versand (kostenfrei) an: ${order.street}, ${order.postalCode} ${order.city}` : "Abholung im Studio (wird persönlich abgestimmt)"}`,
    "Versandbestellungen geben wir in der Regel innerhalb von 3 Werktagen bei DHL ein; eine Abholung stimmen wir persönlich mit Ihnen ab.",
    "",
    "Anhänge: Bestelleingangsbestätigung.pdf, Zahlungsbestätigung.pdf, AGB.pdf, Widerrufsbelehrung-und-Musterformular.pdf",
    "",
    `${contact.name} · ${contact.street}, ${contact.city}`,
    `Telefon: ${contact.phone} · ${contact.email}`,
  ].filter(l => l !== "").join("\n");

  return { subject: orderConfirmationSubject, html: brandEmailHtml({ title: orderConfirmationSubject, main }), text };
}

/** Betreiberbenachrichtigung – ausschließlich nach bestätigter Zahlung. */
export function operatorEmail(order: EmailOrder, lines: EmailLine[]): { subject: string; html: string } {
  return {
    subject: `Zahlung bestätigt – ${order.fullName}`,
    html: `<h2>Bestellung bezahlt</h2>
<p><b>Bestellnummer:</b> ${esc(order.id)}</p>
<p><b>Bestellung eingegangen am:</b> ${berlinDateTime(order.createdAt)}${order.paidAt ? `<br><b>Zahlung bestätigt am:</b> ${berlinDateTime(order.paidAt)}` : ""}</p>
<table>${([["Name", order.fullName], ["E-Mail", order.email], ["Telefon", order.phone], ["Lieferart", order.delivery === "post" ? `DHL-Versand: ${order.street}, ${order.postalCode} ${order.city}` : "Abholung"], ["Empfänger", order.recipient || "-"], ["Geschenktext", order.giftText || "-"], ["Anmerkungen", order.notes || "-"]] as [string, string][]).map(([k, v]) => `<tr><td><b>${k}:</b></td><td>${esc(v)}</td></tr>`).join("")}</table>
${linesTable(lines)}${totalsBlock(order, lines)}`,
  };
}
