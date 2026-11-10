import { expect, test } from "bun:test";
import { verifyStoredPayment } from "./shop-payment.server";
import { operatorNotificationEmail } from "./contact";

/** In-memory database and HTTP stubs only; no real orders, provider requests or emails. */
function fixture() {
  const order: Record<string, unknown> = { id: "order-1", status: "awaiting_payment", total_cents: 80, currency: "EUR", full_name: "Anna Beispiel", email: "anna@example.de", phone: "06960511884", delivery: "none", street: "", postal_code: "", city: "", recipient: "", gift_text: "", notes: "", discount_code: "TESTCODE20", discount_cents: 20, legal_version: "2026-11-02-confirmed-review", created_at: "2026-11-06T12:00:00Z", paid_at: null, paid_email_sent_at: null, operator_notified_at: null, customer_email_claimed_at: null, operator_email_claimed_at: null };
  const attempt: Record<string, unknown> = { id: "attempt", order_id: "order-1", sumup_checkout_id: "checkout-1", status: "PENDING" };
  const tables: Record<string, Record<string, unknown>[]> = { shop_orders: [order], shop_payment_attempts: [attempt], shop_order_items: [{ order_id: "order-1", product_name: "Testartikel – 1 €", product_kind: "test", quantity: 1, unit_price_cents: 100, subtotal_cents: 100, validity_months: null }], shop_email_events: [] };
  const admin = { from(table: string) {
    let patch: Record<string, unknown> | undefined;
    let inserted: Record<string, unknown> | undefined;
    const filters: ((row: Record<string, unknown>) => boolean)[] = [];
    const result = () => { if (inserted) tables[table]?.push(inserted); const rows = (tables[table] ?? []).filter(row => filters.every(f => f(row))); if (patch) rows.forEach(row => Object.assign(row, patch)); return { data: rows, error: null }; };
    const chain = { select() { return chain; }, update(value: Record<string, unknown>) { patch = value; return chain; }, insert(value: Record<string, unknown>) { inserted = value; return chain; }, eq(k: string, v: unknown) { filters.push(row => row[k] === v); return chain; }, neq(k: string, v: unknown) { filters.push(row => row[k] !== v); return chain; }, is(k: string, v: unknown) { filters.push(row => (row[k] ?? null) === v); return chain; }, maybeSingle() { return Promise.resolve({ ...result(), data: result().data[0] ?? null }); }, then(resolve: (value: ReturnType<typeof result>) => unknown) { return Promise.resolve(result()).then(resolve); } };
    return chain;
  } } as unknown as Parameters<typeof verifyStoredPayment>[0];
  return { admin, order, attempt };
}

test("independent callback processing pays once and sends one email per recipient despite concurrent callbacks", async () => {
  const f = fixture();
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.RESEND_API_KEY;
  let emails = 0;
  const payloads: { to: string[]; html: string; subject: string }[] = [];
  process.env.RESEND_API_KEY = "mock-key";
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    if (url.startsWith("https://api.sumup.com/")) return Response.json({ id: "checkout-1", checkout_reference: "order-1", amount: 0.8, currency: "EUR", status: "PAID" });
    if (url === "https://api.resend.com/emails") { emails++; payloads.push(JSON.parse(String(init?.body))); return Response.json({ id: "mock-email" }); }
    return new Response("", { status: 404 });
  }) as typeof fetch;
  try {
    await Promise.all([verifyStoredPayment(f.admin, "mock", "checkout-1"), verifyStoredPayment(f.admin, "mock", "checkout-1")]);
    await verifyStoredPayment(f.admin, "mock", "checkout-1");
    expect(f.order.status).toBe("paid");
    expect(f.attempt.status).toBe("PAID");
    expect(emails).toBe(2);
    expect(operatorNotificationEmail).toBe("j.rudklang@royalkrabi-thaimassage.de");
    expect(payloads.filter(p => p.to[0] === operatorNotificationEmail).length).toBe(1);
    expect(payloads.find(p => p.to[0] === operatorNotificationEmail)?.html).toContain("https://royalkrabi-thaimassage.de/verwaltung/widerrufe?order=order-1");
    expect(payloads.some(p => p.subject.includes("versendet") || p.subject.includes("bereitgestellt"))).toBe(false);
    expect(f.order.paid_email_sent_at).toBeString();
  } finally { globalThis.fetch = originalFetch; if (originalKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = originalKey; }
});

test("failed, cancelled/pending and mismatched payments never become paid or send mail", async () => {
  const originalFetch = globalThis.fetch;
  try {
    for (const status of ["FAILED", "PENDING", "EXPIRED", "MISMATCH"]) {
      const f = fixture();
      globalThis.fetch = (async () => Response.json({ id: "checkout-1", checkout_reference: "order-1", amount: status === "MISMATCH" ? 1 : 0.8, currency: "EUR", status: status === "MISMATCH" ? "PAID" : status })) as typeof fetch;
      if (status === "MISMATCH") await expect(verifyStoredPayment(f.admin, "mock", "checkout-1")).rejects.toThrow("stimmen nicht überein");
      else await verifyStoredPayment(f.admin, "mock", "checkout-1");
      expect(f.order.status).not.toBe("paid");
      expect(f.order.paid_at).toBeNull();
      expect(f.order.paid_email_sent_at).toBeNull();
    }
  } finally { globalThis.fetch = originalFetch; }
});