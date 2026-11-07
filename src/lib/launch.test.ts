import { expect, test } from "bun:test";
import { canCreatePayment, isPaymentPreview, isInternalPreview, isPublicComingSoon, launch, resolvePublicComingSoon, shouldRedirectDuringLaunch, websiteStartStatus } from "./launch";

test("No launch date or countdown is assumed without confirmation", () => {
  expect(launch.websiteStart).toBeNull();
  expect(websiteStartStatus()).toBe("Website-Start: Termin folgt");
});
test("Flyer destination stays the permanent primary address", () => {
  expect(launch.permanentUrl).toBe("https://royalkrabi-thaimassage.de");
});
test("Public release: the full website is served on the live domain without redirects", () => {
  for (const path of ["/", "/massagen-preise", "/gutscheine", "/abos", "/shop", "/warenkorb", "/checkout", "/termine", "/widerruf", "/impressum", "/datenschutz", "/cookies", "/jobs", "/flyer", "/verwaltung/widerrufe"]) {
    expect(shouldRedirectDuringLaunch(new URL(`https://royalkrabi-thaimassage.de${path}`))).toBe(false);
  }
  expect(isPublicComingSoon("royalkrabi-thaimassage.de")).toBe(false);
  expect(shouldRedirectDuringLaunch(new URL("https://royalkrabi-thaimassage.de/gutscheine?ansicht=website"))).toBe(false);
});
test("Public release: withdrawal and server calls are reachable on both live hostnames", () => {
  for (const host of ["royalkrabi-thaimassage.de", "www.royalkrabi-thaimassage.de"]) {
    for (const path of ["/widerruf", "/shop", "/checkout", "/gutscheine", "/abos", "/_serverFn/checkout", "/_serverFn/withdrawal"]) {
      expect(shouldRedirectDuringLaunch(new URL(`https://${host}${path}`))).toBe(false);
    }
  }
});
test("Full website remains available on main, draft, commit and local previews", () => {
  for (const host of ["localhost", "id-preview--example.lovable.app", "id-preview-6--example.lovable.app", "id-preview-abc123--example.lovable.app", "preview-3--example.workspace.lovable.app", "project--example-dev.lovable.app", "example.lovableproject.com"]) {
    expect(isInternalPreview(host)).toBe(true);
    expect(shouldRedirectDuringLaunch(new URL(`http://${host}/checkout`))).toBe(false);
  }
});
test("Spoofed preview prefixes are not treated as internal previews", () => {
  for (const host of ["www.royalkrabi-thaimassage.de", "royalkrabi-thaimassage.de", "example.lovable.app", "project--example.lovable.app", "id-preview--example.evil.com", "id-preview--example.lovable.app.evil.com"]) {
    expect(isInternalPreview(host)).toBe(false);
  }
});
test("Launch gate stays off unless a build explicitly switches it on", () => {
  expect(resolvePublicComingSoon(undefined)).toBe(false);
  expect(resolvePublicComingSoon("false")).toBe(false);
  expect(resolvePublicComingSoon("anything")).toBe(false);
  expect(resolvePublicComingSoon(false)).toBe(false);
  expect(resolvePublicComingSoon("true")).toBe(true);
  expect(resolvePublicComingSoon(true)).toBe(true);
});
test("Purchases allowed on live domain and previews; local direct RPCs blocked", () => {
  expect(canCreatePayment("id-preview--8b969554-43d1-4653-abfd-07ad93d8716c.lovable.app")).toBe(true);
  for (const host of ["royalkrabi-thaimassage.de", "www.royalkrabi-thaimassage.de", "royalkrabi-thaimassage.lovable.app"]) expect(canCreatePayment(host)).toBe(true);
  for (const host of ["localhost", "127.0.0.1"]) expect(canCreatePayment(host)).toBe(false);
});
test("SumUp callback stays reachable", () => {
  expect(shouldRedirectDuringLaunch(new URL("https://royalkrabi-thaimassage.de/api/public/sumup-webhook"))).toBe(false);
});
test("branded main and draft previews supported, unrelated domains rejected", () => {
  expect(isPaymentPreview("live--8b969554-43d1-4653-abfd-07ad93d8716c.workspace.lovable.app")).toBe(true);
  expect(isPaymentPreview("live--8b969554-43d1-4653-abfd-07ad93d8716c-thr_abc.workspace.lovable.app")).toBe(true);
  expect(isPaymentPreview("live--8b969554-43d1-4653-abfd-07ad93d8716c.evil.com")).toBe(false);
});
