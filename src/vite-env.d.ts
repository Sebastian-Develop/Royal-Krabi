// Build-time switch consumed by src/lib/launch.ts: since the public release on
// 07.11.2026 the full website is served by default. Only an explicit
// VITE_PUBLIC_COMING_SOON="true" switches the launch gate back on.
interface ImportMetaEnv {
  readonly VITE_PUBLIC_COMING_SOON?: string;
}
