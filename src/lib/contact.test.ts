/// <reference types="bun" />
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "bun:test";
import { contact, mapsRouteHint, mapsRouteUrl } from "./contact";

test("Royal Krabi's confirmed legal operator is Jirayut Rudklang", () => {
  expect(contact.owner).toBe("Jirayut Rudklang");
});

test("Compact opening hours in the three contact cards stay exactly as requested", () => {
  expect(contact.hoursShort).toBe("Di.–Sa.: 10:00–20:00 Uhr");
  expect(contact.hoursShortClosed).toBe("So. & Mo.: geschlossen");
});

test("Royal Krabi retains its own contact details, not those of the first shop", () => {
  expect([contact.street, contact.city, contact.phone, contact.email]).toEqual([
    "Offenbacher Str. 32",
    "63075 Offenbach am Main",
    "069 60511884",
    "kontakt@royalkrabi-thaimassage.de",
  ]);
});

test("Every studio address opens exactly the requested Google Maps route", () => {
  expect(mapsRouteUrl).toBe("https://www.google.com/maps/dir/?api=1&destination=Offenbacher+Str.+32%2C+63075+Offenbach+am+Main");
  expect(mapsRouteHint).toBe("Route zu Royal Krabi Serenity Thaimassage in Google Maps öffnen");
});

test("No page or component hardcodes a second Google Maps route", () => {
  const root = join(import.meta.dir, "..");
  const offenders: string[] = [];
  for (const dir of ["routes", "components"]) {
    for (const file of readdirSync(join(root, dir))) {
      if (!/\.(ts|tsx)$/.test(file)) continue;
      if (readFileSync(join(root, dir, file), "utf8").includes("maps/dir")) offenders.push(`${dir}/${file}`);
    }
  }
  expect(offenders).toEqual([]);
});
