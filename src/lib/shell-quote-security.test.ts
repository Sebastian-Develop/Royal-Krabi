import { expect, test } from "bun:test";
import { createRequire } from "node:module";

// Resolve through the real parent, proving the tooling receives the fixed version.
const toolingRequire = createRequire(import.meta.resolve("launch-editor"));
const shell = toolingRequire("shell-quote") as { quote(tokens: unknown[]): string; parse(value: string): unknown[] };
test("launch-editor resolves corrected shell-quote without changing parent APIs", () => {
  expect(toolingRequire("shell-quote/package.json").version).toBe("1.11.0");
  expect(shell.parse('code "folder with spaces/file.ts"')).toEqual(['code', 'folder with spaces/file.ts']);
});
test("GHSA-pqg4-j6r4-53mv rejects command injection after comment for all line terminators", () => {
  for (const newline of ["\n", "\r", "\u2028", "\u2029"]) {
    expect(() => shell.quote(['echo', 'ok', { comment: 'x' }, `a${newline}id;#`])).toThrow(TypeError);
  }
});