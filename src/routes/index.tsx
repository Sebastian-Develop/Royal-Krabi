import { createFileRoute, Link } from "@tanstack/react-router";
import { Gift, Leaf, HandHeart, Sparkles, MapPin, Layers3, Phone, Mail, Clock, CalendarDays } from "lucide-react";
import { AddressLink, BookingCta, BrandHeading, ButtonLink, ContactButtons, HoursNote, RouteButton, address } from "@/components/site";
import { contact, mailHrefPlain } from "@/lib/contact";
import { pageHead } from "@/lib/meta";
import { massages } from "@/lib/content";
import heroImage from "@/assets/royal-krabi-reception-clean.jpg.asset.json";
import room from "@/assets/massage-room.jpg";
import oils from "@/assets/orchid-oils.jpg";
import stones from "@/assets/hot-stones.jpg";
import lounge from "@/assets/relax-lounge.jpg";
import { ComingSoon } from "@/components/coming-soon";
import { launch } from "@/lib/launch";

export const Route = createFileRoute("/")({
  head: ({ match }) => match.context.launchShell ? pageHead("Royal Krabi | Ein Ort der Ruhe. Bald auch online.", launch.introduction, launch.permanentUrl) : ({ ...pageHead("Royal Krabi Serenity Thaimassage | Thai-Massagen in Offenbach", "Royal Krabi Serenity Thaimassage in Offenbach. Traditionelle Thai-Massagen in exklusivem Ambiente. Termine telefonisch oder per E-Mail nach Vereinbarung.", "/"), scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context":"https://schema.org", "@type":"HealthAndBeautyBusiness", additionalType:"https://schema.org/DaySpa", name:contact.name, url:contact.website, address:{"@type":"PostalAddress",streetAddress:"Offenbacher Str. 32",postalCode:"63075",addressLocality:"Offenbach am Main",addressCountry:"DE"}, telephone:"+49 69 60511884", email:contact.email, openingHoursSpecification:[{"@type":"OpeningHoursSpecification",dayOfWeek:["Tuesday","Wednesday","Thursday","Friday","Saturday"],opens:"10:00",closes:"20:00"}], knowsAbout:["Thai Massage","Traditionelle Thai-Massage","Wellness"] }) }] }),
  component: Home,
});

function Home() {
  const { launchShell } = Route.useRouteContext();
  return launchShell ? <ComingSoon/> : <FullHome/>;
}

function FullHome() {
  const benefits = [[<Sparkles/>,"AUTHENTISCHE THAI-TRADITION","Traditionelle Techniken mit jahrhundertealtem Wissen."],[<Leaf/>,"STILVOLLES AMBIENTE","Entspannen Sie in einer exklusiven Atmosphäre."],[<Layers3/>,"HOCHWERTIGE ANWENDUNGEN","Wohltuende Massagen für Körper und Geist."],[<HandHeart/>,"PERSÖNLICHE BETREUUNG","Ihr Wohlbefinden liegt uns am Herzen."]];
  const cardImages = [room, oils, stones, lounge];
  return <main>
    <section className="home-hero"><div className="hero-copy"><span className="hero-edge-ornament" aria-hidden="true"/><BrandHeading/><h1>Wo thailändische<br className="hero-break"/>{" "}Tradition auf<br className="hero-break"/>{" "}königliche Ruhe trifft.</h1><p>Entdecken Sie die Kunst der traditionellen Thai-Massage – in einem exklusiven Ambiente, inspiriert von der Schönheit und Kultur Thailands.</p><div className="contact-buttons hero-buttons"><ButtonLink to="/termine"><CalendarDays size={18}/> TERMIN ANFRAGEN</ButtonLink><ButtonLink to="/gutscheine" outline><Gift size={18}/> GUTSCHEINE ENTDECKEN</ButtonLink></div><HoursNote/></div><div className="hero-image"><img src={heroImage.url} width={2304} height={1856} alt="Empfang von Royal Krabi mit goldem Logo an der Holzwand und hinterleuchtetem, geschnitztem Tresen"/></div><span className="hero-watermark" aria-hidden="true"/></section>
    <section className="benefits">{benefits.map(([icon,title,text]) => <div className="benefit" key={String(title)}><span>{icon}</span><h3>{title}</h3><p>{text}</p></div>)}</section>
    <section className="section container home-contact" id="kontakt-termine"><div className="section-heading"><span className="eyebrow">TERMINE NUR NACH VEREINBARUNG</span><h2>Kontakt &amp; Termine</h2><p><strong>Entspannung beginnt mit einem passenden Termin.</strong></p><p>Massagen erfolgen ausschließlich nach vorheriger Terminvereinbarung. Vereinbaren Sie Ihren Wunschtermin telefonisch oder per E-Mail. Wir beraten Sie gerne persönlich und informieren Sie über freie Termine.</p></div><div className="contact-cards"><div><Phone/><h3>Telefon</h3><a href={contact.phoneHref}>{contact.phone}</a></div><div><Mail/><h3>E-Mail</h3><a href={mailHrefPlain}>{contact.email}</a></div><div><Clock/><h3 className="hours-title">Öffnungszeiten</h3><p className="hours-block">{contact.hoursShort}<br/>{contact.hoursShortClosed}</p></div></div><ContactButtons className="center-buttons"/></section>
    <section className="section container"><div className="section-heading"><span className="eyebrow">WOHLTUENDE VIELFALT</span><h2>Traditionelle Thai-Massage in Offenbach</h2><p>Ausgewählte Anwendungen für Entspannung, Ruhe und ein rundum gutes Körpergefühl.</p></div><div className="massage-grid">{massages.slice(0,4).map((m,i) => { const image = cardImages[i]; const firstPrice = m.prices[0]; if (!image || !firstPrice) return null; return <article className="image-card" key={m.name}><img src={image} width={700} height={500} loading="lazy" alt={`${m.name} in stilvoller Thai-Spa-Atmosphäre`}/><div><span>AB {firstPrice[1]} €</span><h3>{m.name}</h3><p>{m.desc}</p><Link to="/massagen-preise">Details & Preise →</Link></div></article>; })}</div><div className="center"><ButtonLink to="/massagen-preise">ALLE MASSAGEN & PREISE</ButtonLink></div></section>
    <section className="split-feature"><div><img src={oils} width={1200} height={912} loading="lazy" alt="Orchideen, Duftöle und Handtücher im Spa"/></div><div><span className="eyebrow">EIN GESCHENK VON HERZEN</span><h2>Schenken Sie Wohlbefinden</h2><p>Verschenken Sie persönliche Erholung – als Gutschein für eine ausgewählte Anwendung oder mit individuellem Wunschbetrag. Gutscheine erhalten Sie nach Absprache telefonisch, per E-Mail oder direkt im Studio.</p><ButtonLink to="/gutscheine"><Gift size={18}/> GUTSCHEINE ENTDECKEN</ButtonLink></div></section>
    <section className="split-feature reverse"><div><img src={lounge} width={1408} height={1008} loading="lazy" alt="Ruhiger Entspannungsbereich mit Holz und Gold"/></div><div><span className="eyebrow">REGELMÄSSIG ABSCHALTEN</span><h2>Ihre regelmäßige Erholung</h2><p>Mit unseren 5er-Abos wird wohltuende Erholung zu einem festen Teil Ihres Alltags – inklusive attraktivem Preisvorteil.</p><ButtonLink to="/abos">5ER-ABOS ENTDECKEN</ButtonLink></div></section>
    <section className="section gallery-teaser container"><div className="section-heading"><span className="eyebrow">EINBLICKE</span><h2>Ein Ort zum Ankommen</h2></div><div className="gallery-grid home-gallery">{[heroImage.url,room,oils,stones,lounge].map((src,i)=><img key={src} src={src} loading="lazy" alt={["Empfang von Royal Krabi","Massagezimmer","Duftöle und Orchideen","Hot-Stone-Arrangement","Ruhebereich"][i]}/>)}</div><div className="center"><ButtonLink to="/galerie" outline>GALERIE ENTDECKEN</ButtonLink></div></section>
    <section className="location-band"><MapPin/><div><span className="eyebrow">OFFENBACH AM MAIN</span><h2>Ihre Thaimassage in Offenbach</h2><p><AddressLink>{address}</AddressLink></p></div><RouteButton/></section>
    <BookingCta/>
  </main>;
}