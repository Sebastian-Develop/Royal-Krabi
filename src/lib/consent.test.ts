/// <reference types="bun" />
import { describe, expect, it } from "bun:test";
import { readConsent } from "./consent";
describe("Tidio consent", () => {
  it("has no chat consent without a stored choice (server/fresh session)", () => {
    expect(readConsent()?.chat ?? false).toBe(false);
  });
});
