import { expect, test } from "bun:test";
import { isInternalPreview, isPublicComingSoon, launch, shouldRedirectDuringLaunch, websiteStartStatus } from "./launch";

test("No launch date or countdown is assumed without confirmation", () => {
  expect(launch.websiteStart).toBeNull();
  expect(websiteStartStatus()).toBe("Website-Start: Termin folgt");
});
test("Flyer destination stays the permanent primary address", () => {
  expect(launch.permanentUrl).toBe("https://royalkrabi-thaimassage.de");
});
test("Only home and the two legal pages remain public during launch", () => {
  for (const path of ["/", "/impressum", "/datenschutz"]) {
    expect(shouldRedirectDuringLaunch(new URL(`https://royalkrabi-thaimassage.de${path}`))).toBe(false);
  }
  for (const path of ["/massagen-preise", "/gutscheine", "/abos", "/warenkorb", "/checkout", "/termine", "/cookies", "/api/public/test", "/impressum/extra", "/?ansicht=website"]) {
    const url = new URL(`https://royalkrabi-thaimassage.de${path}`);
    expect(isPublicComingSoon(url.hostname)).toBe(true);
    expect(shouldRedirectDuringLaunch(url)).toBe(url.pathname !== "/");
  }
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