import { contact } from "./contact";

/**
 * Automatische Eingangsbestätigung für Bewerberinnen und Bewerber.
 * Nur diese eine E-Mail darf an die im Formular angegebene Adresse gehen:
 * sie bestätigt den Eingang einer konkreten Bewerbung und enthält keine Werbung.
 */
export const applicationConfirmationSubject = `Bewerbungseingang – ${contact.name}`;

export interface ApplicationEmailData {
  name: string;
  tel: string;
  email: string;
  area?: string;
  type?: string;
  hasCv: boolean;
}

const MAHOGANY = "#4A210F";
const PANEL = "#431D0C";
const GOLD = "#F1C66B";
const CREAM = "#F7E8C8";
const DARK = "#3F1B0D";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const divider = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 0"><tr><td style="border-top:1px solid ${GOLD};opacity:.75">&nbsp;</td><td width="18" align="center" style="color:${GOLD};font-size:11px;line-height:1;vertical-align:middle;padding:0 6px">&#9670;</td><td style="border-top:1px solid ${GOLD};opacity:.75">&nbsp;</td></tr></table>`;

const row = (label: string, value: string) =>
  `<tr><td style="padding:7px 0;color:${GOLD};font-size:12px;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;vertical-align:top;padding-right:16px">${esc(label)}</td><td style="padding:7px 0;color:${CREAM};font-size:15px;line-height:1.55">${esc(value)}</td></tr>`;

/** Betreff und HTML-Text der Eingangsbestätigung; der Name erscheint nur, wenn er angegeben wurde. */
export const applicationConfirmationEmail = ({ name, tel, area, type, hasCv }: ApplicationEmailData) => {
  const greeting = name.trim() ? `Guten Tag ${esc(name.trim())},` : "Guten Tag,";
  const rows = [
    area?.trim() ? row("Gewünschte Stelle", area.trim()) : "",
    type?.trim() ? row("Beschäftigungsart", type.trim()) : "",
    row("Telefon", tel.trim() || "-"),
    row("Unterlagen", hasCv ? "Lebenslauf liegt bei" : "Kein Lebenslauf beigefügt"),
  ].join("");

  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(applicationConfirmationSubject)}</title></head>
<body style="margin:0;padding:0;background:#ffffff">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff">
<tr><td align="center" style="padding:28px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${MAHOGANY};border:1px solid ${GOLD};border-radius:14px;overflow:hidden;font-family:Georgia,'Times New Roman',serif">
<tr><td style="background:${PANEL};padding:26px 28px;text-align:center">
<div style="color:${GOLD};font-size:11px;letter-spacing:.22em;text-transform:uppercase">Royal Krabi</div>
<div style="color:${CREAM};font-size:19px;letter-spacing:.06em;margin-top:6px">Serenity Thaimassage</div>
${divider}
</td></tr>
<tr><td style="padding:30px 28px 8px">
<h1 style="margin:0 0 14px;color:${GOLD};font-size:22px;line-height:1.3;font-weight:600">Vielen Dank für Ihre Bewerbung.</h1>
<p style="margin:0 0 14px;color:${CREAM};font-size:15px;line-height:1.65">${greeting} wir haben Ihre Bewerbung erhalten. Ihre Unterlagen sind bei uns eingegangen und wir melden uns schnellstmöglich bei Ihnen.</p>
<p style="margin:0 0 22px;color:${CREAM};font-size:15px;line-height:1.65">Falls Sie etwas ergänzen oder berichtigen möchten, antworten Sie einfach auf diese E-Mail.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PANEL};border:1px solid rgba(241,198,107,.45);border-radius:10px;padding:4px 16px;margin:0 0 24px">
<tr><td colspan="2" style="padding:12px 0 2px;color:${GOLD};font-size:11px;letter-spacing:.16em;text-transform:uppercase">Ihre Angaben</td></tr>
${rows}
<tr><td colspan="2" style="padding:0 0 12px">&nbsp;</td></tr>
</table>
<p style="margin:0 0 6px;color:${GOLD};font-size:11px;letter-spacing:.16em;text-transform:uppercase">Royal Krabi Serenity Thaimassage</p>
<p style="margin:0 0 10px;color:${CREAM};font-size:14px;line-height:1.6">${esc(contact.street)}, ${esc(contact.city)}<br>${esc(contact.hoursOpen)} &middot; ${esc(contact.hoursClosed)}<br>Telefon: ${esc(contact.phone)} &middot; ${esc(contact.email)}</p>
</td></tr>
<tr><td style="background:${PANEL};border-top:1px solid rgba(241,198,107,.4);padding:16px 28px;text-align:center">
<div style="color:${GOLD};font-size:11px;letter-spacing:.14em;text-transform:uppercase">Offenbacher Str. 32 &middot; 63075 Offenbach am Main</div>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;

  const text = [
    "Vielen Dank für Ihre Bewerbung.",
    "",
    `${name.trim() ? `Guten Tag ${name.trim()},` : "Guten Tag,"} wir haben Ihre Bewerbung erhalten. Ihre Unterlagen sind bei uns eingegangen und wir melden uns schnellstmöglich bei Ihnen.`,
    "",
    "Ihre Angaben:",
    area?.trim() ? `- Gewünschte Stelle: ${area.trim()}` : "",
    type?.trim() ? `- Beschäftigungsart: ${type.trim()}` : "",
    `- Telefon: ${tel.trim() || "-"}`,
    `- Unterlagen: ${hasCv ? "Lebenslauf liegt bei" : "Kein Lebenslauf beigefügt"}`,
    "",
    `${contact.name}`,
    `${contact.street}, ${contact.city}`,
    `${contact.hoursOpen} · ${contact.hoursClosed}`,
    `Telefon: ${contact.phone} · ${contact.email}`,
  ]
    .filter((line) => line !== "")
    .join("\n");

  return { subject: applicationConfirmationSubject, html, text };
};
