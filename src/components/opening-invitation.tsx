import { UtensilsCrossed, Sparkles, Flower2, CalendarHeart, MapPin, Phone, Mail, MessageCircle, Share2, Clock } from "lucide-react";
import receptionA from "@/assets/royal-krabi-reception-clean.jpg.asset.json";
import receptionB from "@/assets/royal-krabi-reception-2.webp.asset.json";
import { contact, mapsRouteUrl, mapsRouteHint } from "@/lib/contact";
import { openingEvent as ev, whatsappContactHref, whatsappShareHref } from "@/lib/opening-event";

const icons = { snacks: UtensilsCrossed, dance: Sparkles, studio: Flower2, advice: CalendarHeart };
const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Reusable opening invitation; can later be placed on the full home page unchanged. */
export function OpeningInvitation() {
  return <div className="opening">
    <section className="opening-hero" aria-labelledby="opening-title">
      <p className="opening-brand">{contact.name}</p>
      <p className="opening-tagline">{ev.tagline}</p>
      <div className="launch-divider" aria-hidden="true"><span/>◇<span/></div>
      <h1 id="opening-title">{ev.heading}</h1>
      <p className="opening-date">{ev.subheading}</p>
      {ev.time && <p className="opening-time"><Clock size={16}/> {ev.time}</p>}
      <p className="opening-text">{ev.invitation}</p>
      <p className="opening-free">{ev.freeEntry}</p>
      <p className="opening-location"><MapPin size={17}/> {ev.location}</p>
      <div className="opening-actions">
        <a href="#programm" className="btn btn-gold">Das erwartet Sie</a>
        <a href={mapsRouteUrl} {...ext} aria-label={mapsRouteHint} className="btn btn-outline">Anfahrt planen</a>
      </div>
    </section>

    <section id="programm" className="opening-section" aria-labelledby="program-title">
      <h2 id="program-title">{ev.programHeading}</h2>
      <div className="opening-cards">
        {ev.program.map((p) => { const I = icons[p.icon]; return <article key={p.title} className="opening-card"><span className="opening-icon"><I size={22}/></span><h3>{p.title}</h3><p>{p.text}</p></article>; })}
      </div>
    </section>

    <section className="opening-offer" aria-labelledby="offer-title">
      <p className="opening-percent" aria-hidden="true">20 %</p>
      <h2 id="offer-title">{ev.offer.heading}</h2>
      <p className="opening-offer-text">{ev.offer.text}</p>
      <p className="opening-validity">{ev.offer.validity}</p>
      <p className="opening-small">{ev.offer.aboNote}</p>
      <p className="opening-text">{ev.offer.invite}</p>
    </section>

    <section className="opening-section" aria-labelledby="studio-title">
      <h2 id="studio-title">Einblicke ins Studio</h2>
      <div className="opening-photos">
        <img src={receptionA.url} alt="Empfang mit goldenem Royal-Krabi-Logo an der Holzwand" loading="lazy"/>
        <img src={receptionB.url} alt="Empfangsbereich mit Logo-Wand und Empfangstheke" loading="lazy"/>
      </div>
    </section>

    <section className="opening-section" aria-labelledby="visit-title">
      <h2 id="visit-title">Wir freuen uns auf Ihren Besuch</h2>
      <address className="opening-address"><strong>{contact.name}</strong><br/>Offenbacher Straße 32<br/>63075 Offenbach am Main – Bürgel</address>
      <p className="opening-contact-line"><Phone size={16}/> Telefon / WhatsApp: <a href={contact.phoneHref}>{contact.phone}</a></p>
      <p className="opening-contact-line"><Mail size={16}/> E-Mail: <a href={`mailto:${contact.email}`} className="nowrap">{contact.email}</a></p>
      <div className="opening-actions">
        <a href={mapsRouteUrl} {...ext} aria-label={mapsRouteHint} className="btn btn-outline"><MapPin size={17}/> Anfahrt planen</a>
        <a href={contact.phoneHref} className="btn btn-gold"><Phone size={17}/> Fragen? Jetzt anrufen</a>
        <a href={whatsappContactHref} {...ext} className="btn btn-outline"><MessageCircle size={17}/> Per WhatsApp kontaktieren</a>
      </div>
    </section>

    <section className="opening-hours" aria-labelledby="hours-title">
      <h2 id="hours-title">{ev.hoursHeading}</h2>
      <p>{ev.hoursOpen}</p>
      <p>{ev.hoursClosed}</p>
      <p className="opening-small">{ev.appointmentNote}</p>
    </section>

    <section className="opening-section" aria-label="Einladung teilen">
      <a href={whatsappShareHref} {...ext} className="btn btn-gold"><Share2 size={17}/> Familie & Freunde per WhatsApp einladen</a>
    </section>
  </div>;
}
