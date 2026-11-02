import { z } from "zod";

/** Mandatory explicit declaration text of the electronic withdrawal function (§ 356a BGB). */
export const withdrawalDeclaration = "Hiermit widerrufe ich meinen Vertrag.";

export const withdrawalRequestSchema = z.object({
  fullName: z.string().trim().min(2, "Bitte Vor- und Nachnamen angeben.").max(120),
  email: z.string().trim().email("Bitte eine gültige E-Mail-Adresse angeben.").max(255),
  orderReference: z.string().trim().min(3, "Bitte Bestellnummer oder eine andere eindeutige Bestellkennung angeben.").max(200),
  declarationConfirmed: z.literal(true, { errorMap: () => ({ message: "Bitte die Widerrufserklärung bestätigen." }) }),
  remark: z.string().trim().max(2000).default(""),
});
export type WithdrawalRequestInput = z.input<typeof withdrawalRequestSchema>;

/** Only real order IDs (UUIDs) are matched to orders; any other identifier is stored as free text. */
export const looksLikeOrderId = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim());

/** On-page receipt — deliberately does not claim legal effectiveness. */
export const withdrawalReceiptNotice = "Ihre Widerrufserklärung ist bei uns eingegangen. Bitte bewahren Sie diese Eingangsbestätigung mit Datum und Uhrzeit auf. Die Bearbeitung und Prüfung erfolgt durch Royal Krabi; diese Bestätigung trifft keine Aussage über die rechtliche Wirksamkeit im Einzelfall.";

export const formatReceivedAt = (iso: string) =>
  new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeStyle: "medium", timeZone: "Europe/Berlin" }).format(new Date(iso)) + " Uhr";
