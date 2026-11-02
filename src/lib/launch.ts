/** The static GitHub-Pages copy is built with an explicit "false"; anything else keeps the gate on. */
export function resolvePublicComingSoon(flag: string | boolean | undefined): boolean {
  return !(flag === false || flag === "false");
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
  const host = hostname.toLowerCase();
  if (["localhost", "127.0.0.1", "[::1]"].includes(host)) return true;
  const staticSuffix = [".lovable.app", ".gpt-eng.com", ".gptengineer.run"].some((s) => host.endsWith(s));
  const label = host.split(".")[0] ?? "";
  if (staticSuffix && /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/.test(label)) return true;
  if (staticSuffix && /^project--.+-dev$/.test(label)) return true;
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
  if (url.pathname === "/api/public/bewerbung") return false;
  if (url.pathname === "/api/public/flyer-image") return false;
  if (["/favicon.png", "/favicon.ico", "/robots.txt", "/sitemap.xml", "/llms.txt", "/.well-known/ard.json"].includes(url.pathname)) return false;
  return true;
}