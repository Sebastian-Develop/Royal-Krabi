import { expect, test } from "bun:test";
import { isInternalPreview, isPublicComingSoon, launch, resolvePublicComingSoon, shouldRedirectDuringLaunch, websiteStartStatus } from "./launch";

test("No launch date or countdown is assumed without confirmation", () => {
  expect(launch.websiteStart).toBeNull();
  expect(websiteStartStatus()).toBe("Website-Start: Termin folgt");
});
test("Flyer destination stays the permanent primary address", () => {
  expect(launch.permanentUrl).toBe("https://royalkrabi-thaimassage.de");
});
test("Only explicitly allowed pages remain public during launch", () => {
  for (const path of ["/", "/impressum", "/datenschutz", "/jobs", "/flyer", "/widerruf", "/verwaltung/widerrufe"]) {
    expect(shouldRedirectDuringLaunch(new URL(`https://royalkrabi-thaimassage.de${path}`))).toBe(false);
  }
  for (const path of ["/massagen-preise", "/gutscheine", "/abos", "/warenkorb", "/checkout", "/termine", "/cookies", "/api/public/test", "/impressum/extra", "/?ansicht=website"]) {
    const url = new URL(`https://royalkrabi-thaimassage.de${path}`);
    expect(isPublicComingSoon(url.hostname)).toBe(true);
    expect(shouldRedirectDuringLaunch(url)).toBe(url.pathname !== "/");
  }
  expect(shouldRedirectDuringLaunch(new URL("https://royalkrabi-thaimassage.de/api/public/flyer-image"))).toBe(false);
  expect(shouldRedirectDuringLaunch(new URL("https://royalkrabi-thaimassage.de/robots.txt"))).toBe(false);
  expect(shouldRedirectDuringLaunch(new URL("https://royalkrabi-thaimassage.de/sitemap.xml"))).toBe(false);
});
test("Withdrawal remains reachable on both live hostnames without opening other pages", () => {
  for (const host of ["royalkrabi-thaimassage.de", "www.royalkrabi-thaimassage.de"]) {
    expect(shouldRedirectDuringLaunch(new URL(`https://${host}/widerruf`))).toBe(false);
    for (const path of ["/shop", "/checkout", "/gutscheine", "/abos", "/widerruf/extra", "/verwaltung/extra"]) {
      expect(shouldRedirectDuringLaunch(new URL(`https://${host}${path}`))).toBe(true);
    }
  }
});
test("Only exact withdrawal RPCs are launch exceptions", () => {
  const paths = ["/_serverFn/withdrawal", "/_serverFn/withdrawal-admin"];
  expect(shouldRedirectDuringLaunch(new URL("https://royalkrabi-thaimassage.de/_serverFn/withdrawal"), paths)).toBe(false);
  expect(shouldRedirectDuringLaunch(new URL("https://royalkrabi-thaimassage.de/_serverFn/checkout"), paths)).toBe(true);
  expect(shouldRedirectDuringLaunch(new URL("https://royalkrabi-thaimassage.de/_serverFn/withdrawal/extra"), paths)).toBe(true);
});
test("Full website remains available on main, draft, commit and local previews", () => {
  for (const host of ["localhost", "id-preview--example.lovable.app", "id-preview-6--example.lovable.app", "id-preview-abc123--example.lovable.app", "preview-3--example.workspace.lovable.app", "project--example-dev.lovable.app", "example.lovableproject.com"]) {
    expect(isInternalPreview(host)).toBe(true);
    expect(shouldRedirectDuringLaunch(new URL(`http://${host}/checkout`))).toBe(false);
  }
});
test("Public hosts and spoofed preview prefixes cannot bypass launch restrictions", () => {
  for (const host of ["www.royalkrabi-thaimassage.de", "royalkrabi-thaimassage.de", "example.lovable.app", "project--example.lovable.app", "id-preview--example.evil.com", "id-preview--example.lovable.app.evil.com"]) {
    expect(isInternalPreview(host)).toBe(false);
    expect(shouldRedirectDuringLaunch(new URL(`https://${host}/gutscheine?ansicht=website`))).toBe(true);
  }
});
test("Launch gate stays on unless a build explicitly switches it off", () => {
  expect(resolvePublicComingSoon(undefined)).toBe(true);
  expect(resolvePublicComingSoon("true")).toBe(true);
  expect(resolvePublicComingSoon("anything")).toBe(true);
  expect(resolvePublicComingSoon("false")).toBe(false);
  expect(resolvePublicComingSoon(false)).toBe(false);
});