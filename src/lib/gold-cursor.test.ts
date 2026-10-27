/// <reference types="bun" />
import { expect, test } from "bun:test";
import { CURSOR_SCALE, cursorKind, cursorMode, makeGoldCursors, PARTICLE_LIMIT } from "./gold-cursor";

test("reduced motion retains gold cursors without animated dust", () => {
  expect(cursorMode(true, true)).toEqual({ cursor: true, dust: false });
});
test("touch-only devices have neither custom cursors nor dust", () => {
  expect(cursorMode(false, false)).toEqual({ cursor: false, dust: false });
});
test("links and buttons keep a hand rather than an arrow", () => {
  expect(cursorKind("auto", true, true, false)).toBe("pointer");
});
test("text and inputs retain the text caret", () => {
  expect(cursorKind("auto", false, true, false)).toBe("text");
});
test("disabled controls retain an unavailable shape", () => {
  expect(cursorKind("pointer", true, false, true)).toBe("not-allowed");
});
test("explicit resize and loading states are preserved", () => {
  expect(cursorKind("se-resize", false, false, false)).toBe("se-resize");
  expect(cursorKind("wait", true, false, false)).toBe("wait");
});
test("particle population is bounded", () => {
  expect(PARTICLE_LIMIT).toBe(168);
});
test("cursor shapes stay at the familiar system size", () => {
  const arrow = makeGoldCursors("#F3DFAF", "#C89535", "#A76B2A", "#1C100A")["default"];
  expect(arrow).toBeDefined();
  expect(CURSOR_SCALE).toBeLessThanOrEqual(0.8);
  expect(decodeURIComponent(arrow!.url.replace("data:image/svg+xml,", ""))).toContain(`scale(${CURSOR_SCALE})`);
  expect(arrow!.css).toMatch(/\) 2 2, default$/);
});