import { z } from "zod";
import { brandEmailHtml, emailBlocks } from "./application-email";

export const dispatchRequestSchema = z.object({ id: z.string().uuid(), previewToken: z.string().regex(/^[a-f0-9]{64}$/), confirmed: z.literal(true) });
export type DispatchOrder = { id: string; full_name: string; email: string; status: string; paid_at: string | null; delivery: string; dispatch: DispatchRecord | null };
export type DispatchRecord = { fulfilledAt: string; operatorId: string; mode: string; emailStatus: "sending" | "sent" | "failed" | "uncertain"; emailAt: string | null; error: string | null };
export type DispatchItem = { product_name: string; product_kind: string; quantity: number };

export function requireDispatchOperator(isAdmin: boolean) {
  if (!isAdmin) throw new Error("Kein Zugriff auf die Bestellverwaltung.");
}

export function requireDispatchable(order: DispatchOrder, items: DispatchItem[]) {
  if (order.status !== "paid" || !order.paid_at) throw new Error("Nur unabhängig bestätigte, bezahlte Bestellungen können bereitgestellt werden.");
  if (!items.length || items.some(i => i.product_kind === "test")) throw new Error("Testkäufe haben keine Lieferung oder Bereitstellung.");
  if (!["post", "pickup", "digital"].includes(order.delivery)) throw new Error("Keine bestätigte Lieferart. Bereitstellung muss zuerst geklärt werden.");
}

export function dispatchMessage(order: DispatchOrder, items: DispatchItem[]) {
  requireDispatchable(order, items);
  const postal = order.delivery === "post";
  const subject = postal ? "Ihre Bestellung wurde versendet – Royal Krabi" : order.delivery === "digital" ? "Ihre Bestellung wurde digital bereitgestellt – Royal Krabi" : "Ihre Bestellung ist zur Abholung bereit – Royal Krabi";
  const notice = postal ? "Ihre Bestellung wurde an DHL übergeben." : order.delivery === "digital" ? "Ihre gekauften digitalen Produkte wurden Ihnen über den vereinbarten Bereitstellungsweg zur Verfügung gestellt. Bereits erhaltene Gutscheine werden mit dieser Nachricht nicht erneut versendet." : "Ihre Bestellung ist im Studio zur vereinbarten Abholung bereit.";
  const paragraphs = [`Guten Tag ${order.full_name.trim() || ""},`, notice, `Bestellnummer: ${order.id}`, "Produkte:", ...items.map(i => `${i.quantity} × ${i.product_name}`), "Diese Nachricht informiert ausschließlich über den Versand oder die Bereitstellung Ihrer Bestellung."];
  return { to: order.email, subject, text: paragraphs.join("\n\n"), html: brandEmailHtml({ title: subject, main: emailBlocks.h1(emailBlocks.esc(subject)) + paragraphs.map(p => emailBlocks.p(emailBlocks.esc(p))).join("") }) };
}

/** Covers exactly the recipient/content reviewed by the operator; never accepts browser-written mail. */
export async function dispatchPreviewToken(message: ReturnType<typeof dispatchMessage>) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(message)));
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, "0")).join("");
}