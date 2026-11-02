import { launch } from "./launch";

/** Share image: 1200x630 crop of the reception photo, served from the public origin. */
export const ogShareImage = {
  url: `${launch.permanentUrl}/og-share.jpg`,
  alt: "Empfang von Royal Krabi Serenity Thaimassage mit goldenem Logo an der Holzwand",
  width: "1200",
  height: "630",
} as const;

/** Absolute canonical/og:url on the permanent public origin; accepts absolute or site-relative paths. */
export function absoluteUrl(path: string) {
  if (path.startsWith("http")) return path;
  return `${launch.permanentUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageHead(title: string, description: string, path: string, options?: { image?: boolean }) {
  const url = absoluteUrl(path);
  const meta = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:locale", content: "de_DE" },
    { name: "twitter:card", content: "summary_large_image" },
    ...(options?.image
      ? [
          { property: "og:image", content: ogShareImage.url },
          { property: "og:image:width", content: ogShareImage.width },
          { property: "og:image:height", content: ogShareImage.height },
          { property: "og:image:alt", content: ogShareImage.alt },
          { name: "twitter:image", content: ogShareImage.url },
        ]
      : []),
  ];
  return { meta, links: [{ rel: "canonical", href: url }] };
}
