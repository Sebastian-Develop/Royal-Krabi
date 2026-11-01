import { contact } from "./contact";

/** Versand über Resend – gleiches Muster wie das Bewerbungsformular. */
export async function sendOrderEmail(opts: { to: string; subject: string; html: string; replyTo?: string }): Promise<boolean> {
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
    }),
  });
  if (!res.ok) { console.error(`[order-email] Versand fehlgeschlagen [${res.status}]: ${await res.text()}`); return false; }
  return true;
}

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const eur = (cents: number) => `${(cents / 100).toFixed(2).replace(".", ",")} €`;

export type EmailLine = { name: string; kind: string; quantity: number; unitPriceCents: number; subtotalCents: number; validityMonths: number | null };
export type EmailOrder = {
  id: string; fullName: string; email: string; phone: string; delivery: string;
  street: string; postalCode: string; city: string; recipient: string; giftText: string; notes: string;
  totalCents: number; discountCode: string; discountCents: number;
};

const kindLabel = (kind: string) => kind === "voucher" ? "Gutschein" : kind === "five" ? "5er-Karte" : "10er-Karte";
const deliveryLabel = (order: EmailOrder) => order.delivery === "post"
  ? `Versand mit DHL (kostenfrei) an: ${esc(order.street)}, ${esc(order.postalCode)} ${esc(order.city)}`
  : "Abholung im Studio";

function linesTable(lines: EmailLine[]): string {
  const rows = lines.map(l =>
    `<tr><td>${kindLabel(l.kind)}: ${esc(l.name)}${l.validityMonths ? `<br><small>Gültigkeit: ${l.validityMonths} Monate ab Zahlungseingang</small>` : ""}</td><td>${l.quantity}</td><td>${eur(l.unitPriceCents)}</td><td>${eur(l.subtotalCents)}</td></tr>`,
  ).join("");
  return `<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse"><thead><tr><th>Produkt</th><th>Menge</th><th>Einzelpreis</th><th>Zwischensumme</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function totalsBlock(order: EmailOrder, lines: EmailLine[]): string {
  const subtotal = lines.reduce((s, l) => s + l.subtotalCents, 0);
  const discount = order.discountCents > 0
    ? `<p><b>Rabatt (${esc(order.discountCode)}):</b> −${eur(order.discountCents)}</p>` : "";
  return `<p><b>Zwischensumme:</b> ${eur(subtotal)}</p>${discount}<p><b>Gesamtbetrag:</b> ${eur(order.totalCents)}</p><p><small>Alle Preise inklusive Mehrwertsteuer.</small></p>`;
}

/** A – Bestelleingang: Bestellung gespeichert, Zahlung ggf. noch offen. */
export function orderReceivedEmail(order: EmailOrder, lines: EmailLine[]): { subject: string; html: string } {
  return {
    subject: "Ihre Bestellung bei Royal Krabi ist eingegangen",
    html: `<h2>Vielen Dank für Ihre Bestellung</h2>
<p>Wir haben Ihre Bestellung gespeichert. ${order.discountCents >= 0 ? "" : ""}Die Zahlung ist${order.totalCents > 0 ? " noch offen – sie wird über die Zahlungsseite unseres Zahlungsdienstleisters SumUp abgeschlossen" : ""}.</p>
${linesTable(lines)}${totalsBlock(order, lines)}
<p><b>Lieferart:</b> ${deliveryLabel(order)}</p>
<p>Ihre Bestellung wird von uns persönlich geprüft und angenommen. Bei Fragen erreichen Sie uns unter ${contact.phone} oder ${contact.email}.</p>`,
  };
}

/** B – Zahlungsbestätigung: ausschließlich nach unabhängig verifizierter Zahlung. */
export function paymentConfirmedEmail(order: EmailOrder, lines: EmailLine[]): { subject: string; html: string } {
  return {
    subject: "Zahlungsbestätigung – Ihre Bestellung bei Royal Krabi",
    html: `<h2>Ihre Zahlung ist bestätigt</h2>
<p>Die Zahlung zu Ihrer Bestellung wurde von unserem Zahlungsdienstleister bestätigt. Ihre Bestellung wird nun von uns persönlich geprüft und angenommen.</p>
${linesTable(lines)}${totalsBlock(order, lines)}
<p><b>Lieferart:</b> ${deliveryLabel(order)}</p>
<p>Versandbestellungen geben wir in der Regel innerhalb von 3 Werktagen bei DHL ein; eine Abholung stimmen wir persönlich mit Ihnen ab.</p>
<p>Bei Fragen erreichen Sie uns unter ${contact.phone} oder ${contact.email}.</p>`,
  };
}

/** C – Betreiberbenachrichtigung über neue Bestellung bzw. bestätigte Zahlung. */
export function operatorEmail(kind: "order" | "payment", order: EmailOrder, lines: EmailLine[]): { subject: string; html: string } {
  const title = kind === "order" ? "Neue Bestellung eingegangen" : "Zahlung bestätigt";
  return {
    subject: `${title} – ${order.fullName}`,
    html: `<h2>${title}</h2>
<p><b>Bestellnummer:</b> ${order.id}</p>
<table>${([["Name", order.fullName], ["E-Mail", order.email], ["Telefon", order.phone], ["Lieferart", order.delivery === "post" ? `DHL-Versand: ${order.street}, ${order.postalCode} ${order.city}` : "Abholung"], ["Empfänger", order.recipient || "-"], ["Geschenktext", order.giftText || "-"], ["Anmerkungen", order.notes || "-"]] as [string, string][]).map(([k, v]) => `<tr><td><b>${k}:</b></td><td>${esc(v)}</td></tr>`).join("")}</table>
${linesTable(lines)}${totalsBlock(order, lines)}`,
  };
}
