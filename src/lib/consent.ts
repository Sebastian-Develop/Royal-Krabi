// Einwilligungssteuerung: Tidio wird ausschließlich nach ausdrücklicher Zustimmung geladen.
export const CONSENT_KEY = "rk-privacy-consent";
const LEGACY_KEY = "rk-cookie-consent";
export const TIDIO_SRC = "https://code.tidio.co/7selzeyctcpwp87ltysbwjr8irzsuthj.js";
const SCRIPT_ID = "rk-tidio-script";
export const CONSENT_EVENT = "rk-consent-changed";

export type Consent = { chat: boolean };

export function readConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { chat: parsed?.chat === true };
  } catch { return null; }
}

export function loadTidio() {
  if (typeof document === "undefined" || document.getElementById(SCRIPT_ID)) return;
  const s = document.createElement("script");
  s.id = SCRIPT_ID; s.src = TIDIO_SRC; s.async = true;
  document.body.appendChild(s);
}

function clearTidioStorage() {
  for (const store of [localStorage, sessionStorage]) {
    Object.keys(store).filter((k) => /tidio/i.test(k)).forEach((k) => store.removeItem(k));
  }
  document.cookie.split(";").map((c) => (c.split("=")[0] ?? "").trim()).filter((n) => /tidio/i.test(n)).forEach((n) => {
    const host = location.hostname;
    for (const domain of ["", `;domain=${host}`, `;domain=.${host.replace(/^www\./, "")}`]) {
      document.cookie = `${n}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/${domain}`;
    }
  });
}

export function saveConsent(next: Consent) {
  const prev = readConsent();
  localStorage.removeItem(LEGACY_KEY);
  localStorage.setItem(CONSENT_KEY, JSON.stringify({ chat: next.chat, date: new Date().toISOString() }));
  window.dispatchEvent(new Event(CONSENT_EVENT));
  if (next.chat) { loadTidio(); return; }
  clearTidioStorage();
  // Ein bereits geladenes Widget lässt sich nur durch Neuladen vollständig entfernen.
  if (prev?.chat || document.getElementById(SCRIPT_ID)) location.reload();
}
