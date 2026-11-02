import { createFileRoute } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server";
import { isPublicComingSoon, launch } from "@/lib/launch";

/** While the public launch gate is on, only the publicly reachable pages are listed. */
const comingSoonUrls = ["/", "/impressum", "/datenschutz", "/jobs", "/flyer"];

/** Full-site list for after the launch switch: indexable content pages only, no cart/checkout/order-status. */
const fullSiteUrls = [
  "/",
  "/massagen-preise",
  "/gutscheine",
  "/abos",
  "/termine",
  "/kontakt",
  "/ueber-uns",
  "/galerie",
  "/faq",
  "/treuepass",
  "/jobs",
  "/impressum",
  "/datenschutz",
  "/agb",
  "/widerruf",
  "/cookies",
  "/flyer",
];

function buildSitemap(paths: string[]) {
  const urls = paths.map((p) => `  <url><loc>${launch.permanentUrl}${p}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const host = new URL(getRequest().url).hostname;
        const paths = isPublicComingSoon(host) ? comingSoonUrls : fullSiteUrls;
        return new Response(buildSitemap(paths), {
          status: 200,
          headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" },
        });
      },
    },
  },
});
