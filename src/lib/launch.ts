/** Public release approved 07.11.2026: the gate stays off unless a build explicitly sets "true". */
export function resolvePublicComingSoon(flag: string | boolean | undefined): boolean {
  return flag === true || flag === "true";
}

/** Central launch switch and all interim customer copy. No confirmed date yet. */
export const launch = {
  publicComingSoon: resolvePublicComingSoon(import.meta.env.VITE_PUBLIC_COMING_SOON),
  websiteStart: null as string | null,
  heading: "Ein Ort der Ruhe. Bald auch online.",
  welcome: "Willkommen bei Royal Krabi Serenity Thaimassage",
  introduction: "Unsere neue Website entsteht gerade mit viel Liebe zum Detail. Schon bald findest du hier unsere Massagen, Angebote und alle Informationen für deine persönliche Auszeit.",
  updateHeading: "Unsere neue Website ist bald für Sie da",
  updateText: "Schon bald finden Sie hier alle Massagen, Angebote und Informationen. Über den QR-Code auf Ihrem Flyer kommen Sie jederzeit auf diese Seite zurück.",
  pendingStatus: "Website-Start: Termin folgt",
  permanentUrl: "https://royalkrabi-thaimassage.de",
};

export function websiteStartStatus() {
  return launch.websiteStart ? `Website-Start: ${launch.websiteStart}` : launch.pendingStatus;
}

/** Host classification selects presentation, not user authorization. */
export function isInternalPreview(hostname: string) {
  return isLocalDevelopment(hostname) || isPaymentPreview(hostname);
}

export const isLocalDevelopment = (hostname: string) => ["localhost", "127.0.0.1", "[::1]"].includes(hostname.toLowerCase());

/** Only supported hosted previews may transact; local development is excluded. */
export function isPaymentPreview(hostname: string) {
  const host = hostname.toLowerCase();
  const staticSuffix = [".lovable.app", ".gpt-eng.com", ".gptengineer.run"].some((s) => host.endsWith(s));
  const label = host.split(".")[0] ?? "";
  if (staticSuffix && /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/.test(label)) return true;
  if (staticSuffix && /^project--.+-dev$/.test(label)) return true;
  if (staticSuffix && /^live--[0-9a-f-]{36}(?:-thr_[a-z0-9]+)?$/.test(label) && host.split(".").length === 4) return true;
  return host.endsWith(".lovableproject.com") || host.endsWith(".lovableproject-dev.com");
}

export function isPublicComingSoon(hostname: string) {
  return launch.publicComingSoon && !isInternalPreview(hostname);
}

export function isLaunchPage(path: string) {
  return ["/", "/impressum", "/datenschutz", "/jobs", "/flyer", "/widerruf"].includes(path);
}

/** Public login shell only; all operator data operations independently require an admin role. */
export const isOperatorPage = (path: string) => path === "/verwaltung/widerrufe";

/** Only explicitly supplied withdrawal RPC paths bypass launch presentation, never other server functions. */
export const isWithdrawalRpcPath = (path: string, allowed: readonly string[]) => allowed.includes(path);

/** Exact page allowlist; no query string can bypass the public launch gate. */
export function shouldRedirectDuringLaunch(url: URL, withdrawalRpcPaths: readonly string[] = []) {
  if (!isPublicComingSoon(url.hostname) || isLaunchPage(url.pathname) || isOperatorPage(url.pathname) || isWithdrawalRpcPath(url.pathname, withdrawalRpcPaths)) return false;
  // Hosting serves bundled/static resources separately; keep their fallback requests usable.
  if (/^\/(?:assets|__l5e\/assets-v1)\//.test(url.pathname)) return false;
  if (url.pathname === "/api/public/sumup-webhook") return false;
  if (url.pathname === "/api/public/bewerbung") return false;
  if (url.pathname === "/api/public/flyer-image") return false;
  if (["/favicon.png", "/favicon.ico", "/robots.txt", "/sitemap.xml", "/llms.txt", "/.well-known/ard.json"].includes(url.pathname)) return false;
  return true;
}
/** Independent RPC gate: launch routing alone never authorizes a purchase. */
export const canCreatePayment = (hostname: string) => !isLocalDevelopment(hostname) && (isPaymentPreview(hostname) || !launch.publicComingSoon);
export const previewPaymentWarning = "Testzugang mit echten Zahlungen: Bei einem Kauf wird echtes Geld abgebucht und eine echte Bestellung ausgelöst.";
/** Fixed callback origin; deploying its exact exception requires separate publication approval. */
export const sumupCallbackUrl = "https://royalkrabi-thaimassage.de/api/public/sumup-webhook";
