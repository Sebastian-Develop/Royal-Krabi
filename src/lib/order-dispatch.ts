import { z } from "zod";
import { contact } from "./contact";
import { brandEmailHtml, emailBlocks } from "./application-email";

export const dispatchRequestSchema = z.object({ id: z.string().uuid(), previewToken: z.string().regex(/^[a-f0-9]{64}$/), confirmed: z.literal(true), retry: z.boolean().optional() });
export type DispatchOrder = { id: string; full_name: string; email: string; status: string; paid_at: string | null; delivery: string; dispatch: DispatchRecord | null; digital_provision_url?: string | null; created_at?: string; total_cents?: number; phone?: string; street?: string; postal_code?: string; city?: string; items?: DispatchItem[]; email_history?: EmailHistory[] };
export type EmailHistory = { at: string; kind: string; status: string; providerId: string | null; error: string | null };
export type DispatchRecord = { fulfilledAt: string; operatorId: string; mode: string; emailStatus: "sending" | "sent" | "failed" | "uncertain"; emailAt: string | null; error: string | null; providerId?: string | null; attempt?: number; history?: EmailHistory[]; collectedAt?: string };
export type DispatchItem = { product_name: string; product_kind: string; quantity: number };

export function requireDispatchOperator(isAdmin: boolean) {
  if (!isAdmin) throw new Error("Kein Zugriff auf die Bestellverwaltung.");
}

export function requireDispatchable(order: DispatchOrder, items: DispatchItem[]) {
  if (order.status !== "paid" || !order.paid_at) throw new Error("Nur unabhängig bestätigte, bezahlte Bestellungen können bereitgestellt werden.");
  if (!items.length || items.some(i => i.product_kind === "test")) throw new Error("Testkäufe haben keine Lieferung oder Bereitstellung.");
  if (order.delivery === "digital" && (!order.digital_provision_url || !order.digital_provision_url.startsWith(`${contact.website}/`))) throw new Error("Kein vorhandener sicherer digitaler Bereitstellungsweg. Keine Bereitstellungsnachricht möglich.");
  if (!["post", "pickup", "digital"].includes(order.delivery)) throw new Error("Keine bestätigte Lieferart. Bereitstellung muss zuerst geklärt werden.");
}

export function dispatchMessage(order: DispatchOrder, items: DispatchItem[]) {
  requireDispatchable(order, items);
  const postal = order.delivery === "post";
  const subject = postal ? "Ihre Bestellung wurde versendet – Royal Krabi" : order.delivery === "digital" ? "Ihre Bestellung wurde digital bereitgestellt – Royal Krabi" : "Ihre Bestellung ist zur Abholung bereit – Royal Krabi";
  const notice = postal ? "Ihre Bestellung ist unterwegs. Wir haben Ihre Bestellung versendet." : order.delivery === "digital" ? `Ihre digitalen Produkte sind unter ${order.digital_provision_url} verfügbar. Bereits erhaltene Gutscheine werden nicht erneut versendet.` : `Ihre Bestellung liegt für Sie bereit. Sie können sie bei uns abholen: ${contact.street}, ${contact.city}. ${contact.hoursOpen}; ${contact.hoursClosed}.`;
  const paragraphs = [`Guten Tag ${order.full_name.trim() || ""},`, `Vielen Dank für Ihre Bestellung bei ${contact.name}.`, notice, `Bestellnummer: ${order.id}`, "Produkte:", ...items.map(i => `${i.quantity} × ${i.product_name}`), `Bei Fragen erreichen Sie uns unter ${contact.phone} oder ${contact.email}.`, "Diese Nachricht informiert ausschließlich über den Versand oder die Bereitstellung Ihrer Bestellung."];
  return { to: order.email, subject, text: paragraphs.join("\n\n"), html: brandEmailHtml({ title: subject, main: emailBlocks.h1(emailBlocks.esc(subject)) + paragraphs.map(p => emailBlocks.p(emailBlocks.esc(p))).join("") }) };
}

/** Covers exactly the recipient/content reviewed by the operator; never accepts browser-written mail. */
export async function dispatchPreviewToken(message: ReturnType<typeof dispatchMessage>) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(message)));
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, "0")).join("");
}