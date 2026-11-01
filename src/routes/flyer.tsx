import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Download, ArrowLeft } from "lucide-react";
import flyerImage from "@/assets/royal-krabi-flyer.jpg";
import { contact, mapsRouteUrl, mapsRouteHint } from "@/lib/contact";
import { launch } from "@/lib/launch";

const image = `${launch.permanentUrl}/api/public/flyer-image`;

export const Route = createFileRoute("/flyer")({
  head: () => ({
    meta: [
      { title: "Flyer: Neueröffnung & Tag der offenen Tür am 07.11.2026 | Royal Krabi Serenity Thaimassage" },
      { name: "description", content: "Flyer zur Neueröffnung von Royal Krabi Serenity Thaimassage: Tag der offenen Tür am 07.11.2026 in Offenbach-Bürgel, 20 % Eröffnungsrabatt, Eintritt frei." },
      { property: "og:title", content: "Neueröffnung & Tag der offenen Tür am 07.11.2026" },
      { property: "og:description", content: "Royal Krabi Serenity Thaimassage eröffnet: 07.11.2026, Offenbacher Straße 32, Eintritt frei, 20 % Rabatt vom 07.11. bis 21.11.2026." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${launch.permanentUrl}/flyer` },
      { property: "og:image", content: image },
      { name: "twitter:image", content: image },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${launch.permanentUrl}/flyer` }],
  }),
  component: FlyerPage,
});

function FlyerPage() {
  return <main className="flyer-page">
    <h1>Flyer zur Neueröffnung</h1>
    <p className="flyer-sub">Tag der offenen Tür am 07.11.2026 · Eintritt frei</p>
    <img src={flyerImage} alt="Flyer: Neueröffnung und Tag der offenen Tür von Royal Krabi Serenity Thaimassage am 07.11.2026 mit 20 % Eröffnungsrabatt" width={1200} height={1875}/>
    <div className="opening-actions">
      <a href="/api/public/flyer-image" download="Royal-Krabi-Flyer-Neueroeffnung.jpg" className="btn btn-gold"><Download size={17}/> Flyer herunterladen</a>
      <a href={mapsRouteUrl} target="_blank" rel="noopener noreferrer" aria-label={mapsRouteHint} className="btn btn-outline"><MapPin size={17}/> Anfahrt planen</a>
    </div>
    <p className="opening-small">{contact.phone} · <a href={`mailto:${contact.email}`} className="nowrap">{contact.email}</a></p>
    <p className="flyer-back"><Link to="/" search={{}}><ArrowLeft size={15}/> Zurück zur Startseite</Link></p>
  </main>;
}
