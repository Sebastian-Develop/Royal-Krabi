/// <reference types="bun" />
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "bun:test";

const impressum = readFileSync(join(import.meta.dir, "..", "routes", "impressum.tsx"), "utf8");

test("Impressum states the consumer dispute resolution notice in exactly the approved wording", () => {
  expect(impressum).toContain(
    "<p>Wir sind weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>",
  );
  expect(impressum).not.toContain("nicht bereit oder verpflichtet");
  expect(impressum).not.toContain("Vor Veröffentlichung prüfen");
});

test("Impressum carries no legal-data placeholders and none of the removed sections", () => {
  for (const removed of [
    "Rechtsform",
    "Umsatzsteuer",
    "Aufsichtsbehörde / Register",
    "Registergericht",
  ]) {
    expect(impressum).not.toContain(removed);
  }
  expect(impressum).not.toMatch(/\[[^\]\n]{3,}\]/);
});

test("Impressum keeps every remaining section heading attached to its own body text", () => {
  const sections = impressum.split("\n").filter((line) => line.startsWith('{title:"'));
  expect(sections.length).toBe(6);
  for (const section of sections) {
    const body = section.slice(section.indexOf("body:"));
    expect(body).toMatch(/<p>[\s\S]+<\/p>/);
  }
});
