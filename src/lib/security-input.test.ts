import { expect, test } from "bun:test";
import { checkoutRequestSchema } from "./shop-checkout";
import { CHECKOUT_STRING_LIMITS, MAX_CHECKOUT_BODY_BYTES, MAX_CHECKOUT_ITEMS, assertCheckoutInputShape } from "./checkout-input-limits";
import { limitRequestBody } from "./limited-request.server";
import { serialize, deserialize, toJSON, fromJSON } from "seroval";

const order = () => ({ fullName: "Anna Beispiel", email: "anna@example.test", phone: "06960511884", delivery: "pickup", street: "", postalCode: "", city: "", country: "DE", recipient: "", giftText: "", notes: "", acceptTerms: true, acknowledgePrivacy: true, discountCode: "", submissionKey: "00000000-0000-4000-8000-000000000001", items: [{ productId: "gutschein-1", quantity: 20 }] });

test("existing 50-position and 20-unit checkout boundaries remain accepted", () => {
  const data = order(); data.items = Array.from({ length: MAX_CHECKOUT_ITEMS }, () => ({ productId: "gutschein-1", quantity: 20 }));
  expect(checkoutRequestSchema.safeParse(data).success).toBe(true);
  data.items.push({ productId: "gutschein-1", quantity: 1 });
  expect(checkoutRequestSchema.safeParse(data).success).toBe(false);
});
test("oversized list rejected without touching individual entries", () => {
  let visited = false;
  const items = new Array(51);
  Object.defineProperty(items, 0, { get() { visited = true; throw new Error("must not validate item"); } });
  expect(checkoutRequestSchema.safeParse({ ...order(), items }).success).toBe(false);
  expect(visited).toBe(false);
});
test("nested fields and excessive strings fail before expensive Zod validation", () => {
  expect(() => assertCheckoutInputShape({ ...order(), notes: { nested: { deep: [] } } })).toThrow();
  expect(() => assertCheckoutInputShape({ ...order(), notes: "x".repeat(1001) })).toThrow();
  expect(() => assertCheckoutInputShape({ ...order(), items: [{ productId: { deep: [] }, quantity: 1 }] })).toThrow();
  expect(() => assertCheckoutInputShape({ ...order(), injected: [] })).toThrow();
});
test("maximum existing strings fit byte budget even with JSON unicode escapes and RPC framing", async () => {
  const data: Record<string, unknown> = order();
  for (const [key, max] of Object.entries(CHECKOUT_STRING_LIMITS)) data[key] = "漢".repeat(max);
  data['items'] = Array.from({ length: 50 }, () => ({ productId: "漢".repeat(80), quantity: 20, amountCents: 2147483647 }));
  const wire = JSON.stringify({ data, context: {} }).replace(/漢/g, "\\u6f22");
  expect(new TextEncoder().encode(wire).length).toBeLessThan(MAX_CHECKOUT_BODY_BYTES);
  const request = new Request("https://local.test/_serverFn/mock", { method: "POST", body: wire });
  const bounded = await limitRequestBody(request, MAX_CHECKOUT_BODY_BYTES);
  expect(bounded).toBeInstanceOf(Request);
  if (bounded instanceof Request) expect(await bounded.text()).toBe(wire);
});
test("declared oversized body rejected without pulling its stream", async () => {
  let reads = 0;
  const stream = new ReadableStream({ pull(c) { reads++; c.close(); } }, { highWaterMark: 0 });
  const request = new Request("https://local.test", { method: "POST", headers: { "content-length": "1000000" }, body: stream });
  const result = await limitRequestBody(request, MAX_CHECKOUT_BODY_BYTES);
  expect(result instanceof Response ? result.status : 0).toBe(413); expect(reads).toBe(0);
});
test("missing or false Content-Length cannot bypass streaming budget; rest cancelled", async () => {
  for (const headers of [{}, { "content-length": "1" }]) {
    let reads = 0; let cancelled = false;
    const stream = new ReadableStream({ pull(c) { reads++; c.enqueue(new Uint8Array(8)); }, cancel() { cancelled = true; } }, { highWaterMark: 0 });
    const result = await limitRequestBody(new Request("https://local.test", { method: "POST", headers, body: stream }), 16);
    expect(result instanceof Response ? result.status : 0).toBe(413); expect(reads).toBe(3); expect(cancelled).toBe(true);
  }
});
test("Seroval RPC JSON roundtrip preserves order-shaped DTOs without execution", () => {
  expect(fromJSON(toJSON(order()))).toEqual(order());
});
test("Seroval typed-array constructor injection cannot execute in serialization roundtrip", () => {
  const array = new Uint8Array([1, 2, 3]);
  Object.defineProperty(array, "constructor", { value: { name: "(()=>{globalThis.__serovalAttack=true;return Uint8Array})()" } });
  const code = serialize(array);
  expect(code).not.toContain("__serovalAttack");
  expect(Array.from(deserialize(code) as Uint8Array)).toEqual([1, 2, 3]);
});
test("Seroval regex source cannot escape an SSR script tag and roundtrips", () => {
  const re = new RegExp('</script><script>globalThis.__serovalAttack=true</script>');
  const code = serialize({ re });
  expect(code.toLowerCase()).not.toContain('</script');
  expect((deserialize(code) as { re: RegExp }).re.source).toBe(re.source);
});