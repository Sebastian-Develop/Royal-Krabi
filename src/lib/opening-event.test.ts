import { expect, test } from "bun:test";
import { openingEvent, whatsappShareHref } from "./opening-event";

test("Opening discount is 20 % from 60 minutes, 07.11.–21.11.2026", () => {
  expect(openingEvent.offer.percent).toBe(20);
  expect(openingEvent.offer.minMinutes).toBe(60);
  expect(openingEvent.offer.validFrom).toBe("2026-11-07");
  expect(openingEvent.offer.validUntil).toBe("2026-11-21");
});
test("Event time is not shown until confirmed", () => {
  expect(openingEvent.time).toBeNull();
});
test("No '14 Tage' wording anywhere in the opening copy", () => {
  expect(JSON.stringify(openingEvent)).not.toContain("14 Tage");
});
test("WhatsApp share contains the prepared invitation without a recipient", () => {
  expect(whatsappShareHref.startsWith("https://wa.me/?text=")).toBe(true);
  expect(decodeURIComponent(whatsappShareHref)).toContain("07.11.2026");
});
