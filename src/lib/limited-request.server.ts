/** Read only up to the configured budget; never trust Content-Length alone. */
export async function limitRequestBody(request: Request, maxBytes: number): Promise<Request | Response> {
  const reject = () => new Response("Bestellanfrage zu groß.", { status: 413, headers: { "cache-control": "no-store" } });
  const length = request.headers.get("content-length");
  if (length && Number(length) > maxBytes) return reject();
  if (!request.body) return request;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { void reader.cancel().catch(() => {}); return reject(); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return new Request(request.url, { method: request.method, headers: request.headers, body, signal: request.signal });
}