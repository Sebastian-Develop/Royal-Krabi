/**
 * SumUp-Anbindung (nur serverseitig). Der API-Schlüssel wird ausschließlich
 * als Authorization-Header verschickt und niemals protokolliert oder zurückgegeben.
 */
const SUMUP_API = "https://api.sumup.com";

async function sumupRequest(apiKey: string, path: string, init?: RequestInit): Promise<Record<string, unknown>> {
  const res = await fetch(`${SUMUP_API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    // Keine Antwortinhalte weiterreichen – sie könnten Kontodaten enthalten.
    throw new Error(`SumUp-Anfrage fehlgeschlagen (HTTP ${res.status}).`);
  }
  return (await res.json()) as Record<string, unknown>;
}

/** Liest den Händlercode des hinterlegten Kontos (lesende Profilabfrage). */
export async function sumupMerchantCode(apiKey: string): Promise<string> {
  const me = await sumupRequest(apiKey, "/v0.1/me");
  const profile = (me["merchant_profile"] ?? {}) as Record<string, unknown>;
  const code = profile["merchant_code"] ?? me["merchant_code"];
  if (typeof code !== "string" || !code) throw new Error("SumUp-Händlercode nicht gefunden.");
  return code;
}

export type CreatedCheckout = { id: string; hostedUrl: string; status: string };

/** Erstellt einen SumUp Hosted Checkout und liefert die Zahlungsseiten-URL. */
export async function sumupCreateCheckout(
  apiKey: string,
  opts: { amount: number; reference: string; description: string; merchantCode: string; redirectUrl: string; webhookUrl: string; validUntil?: string },
): Promise<CreatedCheckout> {
  const body = await sumupRequest(apiKey, "/v0.1/checkouts", {
    method: "POST",
    body: JSON.stringify({
      amount: opts.amount,
      currency: "EUR",
      checkout_reference: opts.reference,
      description: opts.description,
      merchant_code: opts.merchantCode,
      hosted_checkout: { enabled: true },
      redirect_url: opts.redirectUrl,
      return_url: opts.webhookUrl,
      // Rabattierte Zahlungsseiten verfallen spätestens mit Aktionsende.
      ...(opts.validUntil ? { valid_until: opts.validUntil } : {}),
    }),
  });
  const id = body["id"];
  const hostedUrl = body["hosted_checkout_url"];
  if (typeof id !== "string" || !id || typeof hostedUrl !== "string" || !hostedUrl) {
    throw new Error("SumUp hat keine vollständige Zahlungsseite geliefert.");
  }
  const status = body["status"];
  return { id, hostedUrl, status: typeof status === "string" ? status : "PENDING" };
}

/** Fragt den aktuellen Zahlungsstatus unabhängig bei SumUp ab. */
export async function sumupGetCheckoutStatus(apiKey: string, checkoutId: string): Promise<string> {
  const body = await sumupRequest(apiKey, `/v0.1/checkouts/${encodeURIComponent(checkoutId)}`);
  const status = body["status"];
  return typeof status === "string" ? status : "PENDING";
}

/**
 * Sucht eine bestehende Checkout-Session anhand unserer Bestellnummer.
 * Wichtig nach einem Timeout: erst suchen, bevor eine neue Session entsteht.
 */
export async function sumupFindCheckoutByReference(apiKey: string, reference: string): Promise<CreatedCheckout | null> {
  const res = await fetch(`${SUMUP_API}/v0.1/checkouts?checkout_reference=${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`SumUp-Suche fehlgeschlagen (HTTP ${res.status}).`);
  const list = (await res.json()) as unknown;
  if (!Array.isArray(list) || !list.length) return null;
  const latest = list[list.length - 1] as Record<string, unknown>;
  const id = latest["id"];
  const hostedUrl = latest["hosted_checkout_url"];
  const status = latest["status"];
  if (typeof id !== "string" || !id) return null;
  return { id, hostedUrl: typeof hostedUrl === "string" ? hostedUrl : "", status: typeof status === "string" ? status : "PENDING" };
}
