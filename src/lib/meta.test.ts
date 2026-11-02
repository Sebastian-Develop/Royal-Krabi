import { expect, test } from "bun:test";
import { absoluteUrl, ogShareImage, pageHead } from "./meta";

test("Canonical and og:url are always absolute on the permanent non-www origin", () => {
  for (const path of ["/", "/massagen-preise", "impressum", "https://royalkrabi-thaimassage.de/abos"]) {
    const head = pageHead("T", "D", path);
    const canonical = head.links.find((l) => l.rel === "canonical");
    const ogUrl = head.meta.find((m) => "property" in m && m.property === "og:url");
    expect(canonical?.href.startsWith("https://royalkrabi-thaimassage.de")).toBe(true);
    expect(ogUrl && "content" in ogUrl && ogUrl.content).toBe(canonical?.href);
    expect(canonical?.href.includes("www.")).toBe(false);
  }
});

test("Every page head carries exactly one canonical and the German locale", () => {
  const head = pageHead("T", "D", "/faq");
  expect(head.links.filter((l) => l.rel === "canonical")).toHaveLength(1);
  expect(head.meta.some((m) => "property" in m && m.property === "og:locale" && m.content === "de_DE")).toBe(true);
});

test("Share image is an absolute 1200x630 URL on the permanent origin and only added when requested", () => {
  expect(ogShareImage.url).toBe("https://royalkrabi-thaimassage.de/og-share.jpg");
  const withImage = pageHead("T", "D", "/", { image: true });
  expect(withImage.meta.some((m) => "property" in m && m.property === "og:image" && m.content === ogShareImage.url)).toBe(true);
  expect(withImage.meta.some((m) => "property" in m && m.property === "og:image:alt")).toBe(true);
  const without = pageHead("T", "D", "/kontakt");
  expect(without.meta.some((m) => "property" in m && m.property === "og:image")).toBe(false);
});

test("Relative paths resolve against the permanent origin", () => {
  expect(absoluteUrl("/")).toBe("https://royalkrabi-thaimassage.de/");
  expect(absoluteUrl("jobs")).toBe("https://royalkrabi-thaimassage.de/jobs");
});
