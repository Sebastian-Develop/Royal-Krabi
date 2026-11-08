// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  vite: {
    resolve: {
      // Only map React Email's legacy imports. A package-wide alias also
      // rewrites htmlparser2's entities/decode export to a nonexistent file.
      alias: [
        {
          find: /^entities\/lib\/decode\.js$/,
          replacement: fileURLToPath(new URL("./node_modules/entities/lib/decode.js", import.meta.url)),
        },
        {
          find: /^entities\/lib\/encode\.js$/,
          replacement: fileURLToPath(new URL("./node_modules/entities/lib/encode.js", import.meta.url)),
        },
      ],
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
