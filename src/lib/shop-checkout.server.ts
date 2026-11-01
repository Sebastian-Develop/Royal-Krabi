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
  opts: { amount: number; reference: string; description: string; merchantCode: string; redirectUrl: string },
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
