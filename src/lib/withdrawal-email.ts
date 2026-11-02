import { brandEmailHtml, emailBlocks } from "./application-email";
import { contact } from "./contact";
import { isInternalPreview } from "./launch";
import { formatReceivedAt, withdrawalDeclaration } from "./withdrawal-request";

export const withdrawalConfirmationSubject = "Bestätigung Ihres Widerrufs – Royal Krabi Serenity Thaimassage";
export const withdrawalStoredNotice = "Ihr Widerruf wurde zur weiteren Bearbeitung gespeichert.";

export type WithdrawalEmailData = {
  id: string; receivedAt: string; fullName: string; email: string; orderReference: string; remark?: string;
};

/** Customer confirmation of an electronic withdrawal (subject, HTML, plain text). */
export function withdrawalConfirmationEmail(d: WithdrawalEmailData) {
  const { esc, h1, p, table, row } = emailBlocks;
  const when = formatReceivedAt(d.receivedAt);
  const rows = [
    row("Eingangsdatum und Uhrzeit", esc(when)),
    row("Referenznummer des Widerrufs", esc(d.id)),
    row("Name", esc(d.fullName)),
    row("E-Mail-Adresse", esc(d.email)),
    row("Bestellnummer / Bestellreferenz", esc(d.orderReference)),
    row("Kopie Ihrer Widerrufserklärung", `„${esc(withdrawalDeclaration)}“${d.remark ? `<br>Anmerkung: ${esc(d.remark)}` : ""}`),
  ].join("");
  const main = h1("Bestätigung Ihres Widerrufs")
    + p(`Guten Tag ${esc(d.fullName)},<br>wir bestätigen den Eingang Ihrer Widerrufserklärung über die Funktion „Vertrag widerrufen“.`)
    + table(rows)
    + p(`${withdrawalStoredNotice} Bei Rückfragen erreichen Sie uns unter ${esc(contact.email)}.`);
  const text = [
    "Bestätigung Ihres Widerrufs", "",
    `Eingangsdatum und Uhrzeit: ${when}`,
    `Referenznummer des Widerrufs: ${d.id}`,
    `Name: ${d.fullName}`, `E-Mail-Adresse: ${d.email}`,
    `Bestellnummer / Bestellreferenz: ${d.orderReference}`,
    `Kopie Ihrer Widerrufserklärung: „${withdrawalDeclaration}“`,
    ...(d.remark ? [`Anmerkung: ${d.remark}`] : []), "",
    withdrawalStoredNotice, "", contact.name, contact.email,
  ].join("\n");
  return { subject: withdrawalConfirmationSubject, html: brandEmailHtml({ title: withdrawalConfirmationSubject, main }), text };
}

/** Real sending only on the live domain; preview/local hosts never send. */
export const shouldSendWithdrawalEmail = (hostname: string) => !!hostname && !isInternalPreview(hostname);
