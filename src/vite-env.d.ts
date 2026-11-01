// Build-time switch consumed by src/lib/launch.ts: the static GitHub-Pages copy
// is built with VITE_PUBLIC_COMING_SOON="false" so it can show the full website.
interface ImportMetaEnv {
  readonly VITE_PUBLIC_COMING_SOON?: string;
}
