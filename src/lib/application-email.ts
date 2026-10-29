import { contact } from "./contact";
import bgAsset from "@/assets/email/email-bg-center.jpg.asset.json";
import logoAsset from "@/assets/email/email-logo.png.asset.json";
import igAsset from "@/assets/email/icon-instagram.png.asset.json";
import ttAsset from "@/assets/email/icon-tiktok.png.asset.json";
import fbAsset from "@/assets/email/icon-facebook.png.asset.json";
import liAsset from "@/assets/email/icon-linkedin.png.asset.json";
import taAsset from "@/assets/email/icon-tripadvisor.png.asset.json";

/** E-Mail-Programme brauchen absolute Bildadressen. */
const SITE = "https://royalkrabi-thaimassage.de";
const abs = (u: string) => (u.startsWith("http") ? u : SITE + u);

/** Social-Media-Profile; leere Adresse = Symbol wird ohne Link gezeigt. */
export const emailSocials = [
  { name: "Instagram", icon: abs(igAsset.url), href: "" },
  { name: "TikTok", icon: abs(ttAsset.url), href: "" },
  { name: "Facebook", icon: abs(fbAsset.url), href: "" },
  { name: "LinkedIn", icon: abs(liAsset.url), href: "" },
  { name: "Tripadvisor", icon: abs(taAsset.url), href: "" },
];

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
const GOLD = "#F1C66B";
const CREAM = "#F7E8C8";
const DISPLAY = "'Cinzel','Cormorant Garamond',Georgia,'Times New Roman',serif";
const BODY = "'Cormorant Garamond',Georgia,'Times New Roman',serif";
/** Zahlen (Telefon, Adresse, Zeiten) in gerader, gleich hoher Schrift wie auf der Website. */
const NUM = "font-family:'Montserrat',Arial,Helvetica,sans-serif;font-variant-numeric:lining-nums tabular-nums;font-feature-settings:'lnum' 1,'tnum' 1";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

const divider = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 0"><tr><td style="border-top:1px solid ${GOLD};opacity:.75">&nbsp;</td><td width="18" align="center" style="color:${GOLD};font-size:11px;line-height:1;vertical-align:middle;padding:0 6px">&#9670;</td><td style="border-top:1px solid ${GOLD};opacity:.75">&nbsp;</td></tr></table>`;

const row = (label: string, value: string) =>
  `<tr><td style="padding:10px 0 2px;color:${GOLD};font-family:${DISPLAY};font-size:12px;line-height:1.5;text-transform:uppercase">${esc(label)}</td></tr><tr><td style="padding:0 0 8px;color:${CREAM};${NUM};font-size:15px;line-height:1.5;overflow-wrap:anywhere">${esc(value)}</td></tr>`;

/** Betreff und HTML-Text der Eingangsbestätigung; der Name erscheint nur, wenn er angegeben wurde. */
export const applicationConfirmationEmail = ({ name, tel, area, type, hasCv }: ApplicationEmailData) => {
  const greeting = name.trim() ? `Guten Tag ${esc(name.trim())},` : "Guten Tag,";
  const rows = [
    area?.trim() ? row("Gewünschte Stelle", area.trim()) : "",
    type?.trim() ? row("Beschäftigungsart", type.trim()) : "",
    row("Telefon", tel.trim() || "-"),
    row("Unterlagen", hasCv ? "Lebenslauf liegt bei" : "Kein Lebenslauf beigefügt"),
  ].join("");

  const socials = emailSocials
    .map((x) => {
      const img = `<img src="${x.icon}" width="34" height="34" alt="${x.name}" style="display:block;border:0;width:34px;height:34px">`;
      return `<td style="padding:0 6px">${x.href ? `<a href="${esc(x.href)}" target="_blank" title="${x.name}">${img}</a>` : img}</td>`;
    })
    .join("");
  const bg = abs(bgAsset.url);

  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>${esc(applicationConfirmationSubject)}</title>
</head>
<body style="margin:0;padding:0;font-variant-numeric:lining-nums;background:${MAHOGANY}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${MAHOGANY}" background="${bg}" style="background:${MAHOGANY} url('${bg}') center top/cover no-repeat">
<tr><td align="center" style="padding:28px 20px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;font-family:${BODY}">
<tr><td style="padding:0 0 6px;text-align:center">
<img src="${abs(logoAsset.url)}" width="240" alt="Royal Krabi Serenity Thaimassage" style="display:inline-block;border:0;width:240px;max-width:100%;height:auto">
${divider}
</td></tr>
<tr><td style="padding:22px 0 8px">
<h1 style="margin:0 0 14px;color:${GOLD};font-family:${DISPLAY};font-size:22px;line-height:1.3;font-weight:600;text-align:center">Vielen Dank für Ihre Bewerbung.</h1>
<p style="margin:0 0 14px;color:${CREAM};font-size:17px;line-height:1.6">${greeting} wir haben Ihre Bewerbung erhalten. Ihre Unterlagen sind bei uns eingegangen und wir melden uns schnellstmöglich bei Ihnen.</p>
<p style="margin:0 0 22px;color:${CREAM};font-size:17px;line-height:1.6">Falls Sie etwas ergänzen oder berichtigen möchten, antworten Sie einfach auf diese E-Mail.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;margin:0 0 24px">
<tr><td style="padding:12px 0 2px;color:${GOLD};font-family:${DISPLAY};font-size:13px;text-transform:uppercase">Ihre Angaben</td></tr>
${rows}
</table>
<p style="margin:0 0 14px;color:${GOLD};font-family:${DISPLAY};font-size:16px;line-height:1.5">${esc(contact.name)}</p>
<p style="margin:0 0 10px;color:${CREAM};${NUM};font-size:14px;line-height:1.7">Öffnungszeiten:<br>${esc(contact.hoursOpen)} &middot; ${esc(contact.hoursClosed)}<br>Telefon: <a href="${contact.phoneHref}" style="color:${CREAM};text-decoration:none">${esc(contact.phone)}</a> &middot; <a href="mailto:${contact.email}" style="color:${CREAM};text-decoration:none;white-space:nowrap">${esc(contact.email)}</a></p>
</td></tr>
<tr><td style="border-top:1px solid ${GOLD};padding:20px 0 0;text-align:center">
<table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 14px"><tr>${socials}</tr></table>
<div style="color:${GOLD};font-family:${DISPLAY};font-size:11px;letter-spacing:.14em;text-transform:uppercase">Offenbacher Str. 32 &middot; 63075 Offenbach am Main</div>
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
    "Öffnungszeiten:",
    `${contact.hoursOpen} · ${contact.hoursClosed}`,
    `Telefon: ${contact.phone} · ${contact.email}`,
  ]
    .filter((line) => line !== "")
    .join("\n");

  return { subject: applicationConfirmationSubject, html, text };
};
