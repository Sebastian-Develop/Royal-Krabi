import { createFileRoute } from "@tanstack/react-router";

/** Serves the opening-flyer image publicly so WhatsApp and social previews can show it. */
export const Route = createFileRoute("/api/public/flyer-image")({
  server: {
    handlers: {
      GET: async () => {
        const { flyerImageBase64 } = await import("@/lib/flyer-image-data");
        const bytes = Uint8Array.from(atob(flyerImageBase64), (c) => c.charCodeAt(0));
        return new Response(bytes, {
          status: 200,
          headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=86400" },
        });
      },
    },
  },
});
