import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, MapPin, Phone, Mail, Clock, ShoppingBag } from "lucide-react";
import { cartCount, useCart } from "@/lib/cart";
import { useEffect, useState, type ReactNode } from "react";
import logo from "@/assets/royal-krabi-logo.png.asset.json";
import logoMark from "@/assets/royal-krabi-logo-trimmed.webp";

const toTop = () => { if (typeof window !== "undefined") window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior }); };

/** Behält die interne Vorschau-Ansicht (?ansicht=…) bei allen Links innerhalb der Website. */
function useAnsicht(): { ansicht?: "website" | "coming-soon" } {
  const ansicht = useRouterState({ select: (s) => (s.location.search as { ansicht?: string }).ansicht });
  return ansicht === "website" || ansicht === "coming-soon" ? { ansicht } : {};
}
import { contact, mailHref, mailHrefPlain, mapsRouteHint, mapsRouteUrl } from "@/lib/contact";
import { vatNotice } from "@/lib/content";
import { CONSENT_EVENT, loadTidio, readConsent, saveConsent } from "@/lib/consent";

export const address = `${contact.street}, ${contact.city}`;

/** Studio address that opens the Google Maps route. Reads as an address, not as a text link. */
export function AddressLink({ children, block = false }: { children: ReactNode; block?: boolean }) {
  return <a className={`address-link ${block ? "address-link-block" : ""}`} href={mapsRouteUrl} target="_blank" rel="noreferrer" title={mapsRouteHint}><span className="sr-only">{mapsRouteHint}. </span>{children}</a>;
}

/** Shared "ROUTE PLANEN" button; opens the same route as every address link. */
export function RouteButton({ className = "btn btn-outline" }: { className?: string }) {
  return <a className={className} href={mapsRouteUrl} target="_blank" rel="noreferrer">ROUTE PLANEN</a>;
}
export const nav = [["Home", "/"], ["Massagen & Preise", "/massagen-preise"], ["Gutscheine", "/gutscheine"], ["Abos", "/abos"], ["Galerie", "/galerie"], ["Über uns", "/ueber-uns"], ["Termine", "/termine"], ["Kontakt & Route", "/kontakt"]] as const;
const legalLinks = [["Impressum", "/impressum"], ["Datenschutz", "/datenschutz"], ["Datenschutzeinstellungen", "/cookies"], ["AGB", "/agb"], ["Widerrufsbelehrung & Widerrufsformular", "/widerruf"]] as const;

export function ButtonLink({ to, children, outline = false, className = "" }: { to: string; children: ReactNode; outline?: boolean; className?: string }) {
  const ansicht = useAnsicht();
  return <Link to={to} search={ansicht} className={`btn ${outline ? "btn-outline" : "btn-gold"} ${className}`}>{children}</Link>;
}

export function CallButton({ className = "" }: { className?: string }) {
  return <a href={contact.phoneHref} className={`btn btn-gold ${className}`}><Phone size={18}/> Jetzt anrufen</a>;
}
export function MailButton({ className = "", short = false }: { className?: string; short?: boolean }) {
  return <a href={mailHref} aria-label="Termin per E-Mail anfragen" className={`btn btn-outline ${className}`}><Mail size={18}/> {short ? "Termin per E-Mail" : "Termin per E-Mail anfragen"}</a>;
}
export function ContactButtons({ className = "", short = false }: { className?: string; short?: boolean }) {
  return <div className={`contact-buttons ${className}`}><CallButton/><MailButton short={short}/></div>;
}

export function HoursNote() {
  return <p className="hours-note hours-block"><Clock size={16}/><span>{contact.hoursShort}<br/>{contact.hoursClosed}<br/><strong className="appointment-rule">{contact.appointmentRule}</strong></span></p>;
}

export function TreatmentCta() {
  return <div className="treatment-cta"><h3>Sie möchten diese Massage genießen?</h3><p>Vereinbaren Sie Ihren Wunschtermin telefonisch oder per E-Mail. Wir informieren Sie gerne über freie Termine und beraten Sie bei der Auswahl der passenden Massage.</p><ContactButtons/></div>;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = useRouterState({ select: (state) => state.location.pathname });
  const ansicht = useAnsicht();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll(); window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [path]);
  return <header className={`site-header ${path === "/" && !scrolled ? "header-clear" : "header-solid"}`}><span className="header-ornament header-ornament-left" aria-hidden="true"/><span className="header-ornament header-ornament-right" aria-hidden="true"/>
    <div className="header-inner">
      <Link to="/" search={ansicht} className="logo-link" aria-label="Royal Krabi Startseite" onClick={toTop}><img src={logoMark} alt="Royal Krabi Serenity Thaimassage" width={1392} height={1197} /></Link>
      <nav className="desktop-nav" aria-label="Hauptnavigation">{nav.map(([label, to]) => <Link key={to} to={to} search={ansicht} activeOptions={{ exact: to === "/" }} className="nav-link">{label}</Link>)}</nav>
      <div className="header-actions"><a href={contact.phoneHref} className="btn btn-gold header-book"><Phone size={17}/> JETZT ANRUFEN</a><button className="menu-button" aria-label={open ? "Menü schließen" : "Menü öffnen"} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button><HeaderCart/></div>
    </div>
    {open && <nav className="mobile-nav" aria-label="Mobile Navigation">{nav.map(([label, to]) => <Link key={to} to={to} search={ansicht} className="nav-link">{label}</Link>)}<ContactButtons className="mobile-nav-buttons" short/></nav>}
  </header>;
}

function HeaderCart() {
  const { cart } = useCart();
  const n = cartCount(cart);
  const ansicht = useAnsicht();
  return <Link to="/warenkorb" search={ansicht} className="header-cart" aria-label={`Warenkorb öffnen, ${n} ${n === 1 ? "Artikel" : "Artikel"}`}><ShoppingBag size={21} aria-hidden="true"/>{n > 0 && <span className="header-cart-count" aria-hidden="true">{n > 99 ? "99+" : n}</span>}</Link>;
}

function FooterLinks({ title, links }: { title: string; links: readonly (readonly [string, string])[] }) {
  const ansicht = useAnsicht();
  return <div><h3>{title}</h3><div className="footer-links">{links.map(([label, to]) => <Link key={to} to={to} search={ansicht}>{label}</Link>)}</div></div>;
}

export function SiteFooter() {
  const ansicht = useAnsicht();
  return <footer className="site-footer"><span className="footer-watermark" aria-hidden="true"/><div className="footer-grid container">
    <div><Link to="/" search={ansicht} className="footer-logo-link" aria-label="Royal Krabi Startseite" onClick={toTop}><img className="footer-logo" src={logo.url} alt="Royal Krabi Serenity Thaimassage"/></Link><p>Traditionelle Thai-Massage in Offenbach – Entspannung und Wohlbefinden in stilvoller Atmosphäre.</p><p className="gold-text"><MapPin size={16}/><AddressLink block>{contact.name}<br/>{contact.street}<br/>{contact.city}</AddressLink></p></div>
    <FooterLinks title="Entdecken" links={nav}/><FooterLinks title="Mehr" links={[["Treuepass", "/treuepass"], ["FAQ", "/faq"], ["Jobs", "/jobs"]]}/>
    <div className="footer-contact"><h3>Kontakt</h3><p><Phone size={15}/> <span>Telefon: <a href={contact.phoneHref}>{contact.phone}</a></span></p><p className="footer-contact-email"><Mail size={15}/> <span>E-Mail: <a href={mailHrefPlain}>{contact.email}</a></span></p><p className="hours-block"><Clock size={15}/> <span><strong>Öffnungszeiten</strong><br/>{contact.hoursOpen}<br/>Sonntag und Montag: geschlossen</span></p><p className="appointment-rule"><strong>{contact.appointmentRule}.</strong></p></div>
  </div><div className="footer-bottom container"><p>© 2026 Royal Krabi Serenity Thaimassage. Alle Rechte vorbehalten.</p><div>{legalLinks.map(([label,to]) => <Link key={to} to={to} search={ansicht}>{label}</Link>)}</div></div><p className="footer-notice">Royal Krabi Serenity Thaimassage bietet ausschließlich professionelle traditionelle Thai-Massagen sowie Wellness- und Entspannungsmassagen an. Wir bieten keine erotischen Massagen oder sexuellen Dienstleistungen an.</p></footer>;
}

export function BrandHeading({ eyebrow = "ROYAL KRABI SERENITY THAIMASSAGE" }: { eyebrow?: string }) {
  return <span className="brand-heading"><span className="eyebrow hero-kicker">{eyebrow}</span><span className="hero-rule" aria-hidden="true"><i/></span></span>;
}

export function PageHero({ eyebrow = "ROYAL KRABI SERENITY THAIMASSAGE", title, intro }: { eyebrow?: string; title: string; intro?: string; image?: string; brandDecoration?: boolean }) {
  return <section className="page-hero"><span className="page-watermark" aria-hidden="true"/><span className="page-ornament" aria-hidden="true"/><div className="container"><BrandHeading eyebrow={eyebrow}/><h1>{title}</h1>{intro && <p>{intro}</p>}</div></section>;
}

export function BookingCta() { return <section className="booking-cta"><div><span className="eyebrow">EIN MOMENT NUR FÜR SIE</span><h2>Zeit für Ihre Erholung</h2><p>Vereinbaren Sie Ihren persönlichen Termin telefonisch oder per E-Mail. {contact.hoursShort} · {contact.hoursClosed}.</p></div><ContactButtons/></section>; }

export function Field({ label, type = "text", children, required = true }: { label: string; type?: string; children?: ReactNode; required?: boolean }) {
  return <label className="field"><span>{label}</span>{children ?? (type === "textarea" ? <textarea required={required} rows={5}/> : <input type={type} required={required}/>)}</label>;
}

export function Notice({ children }: { children: ReactNode }) { return <div className="notice">{children}</div>; }

/** Subtle VAT note placed directly beneath every displayed price list. */
export function PriceVatNotice({ align = "start" }: { align?: "start" | "center" }) {
  return <p className={`price-vat-notice${align === "center" ? " price-vat-center" : ""}`}>{vatNotice}</p>;
}

export function openCookieSettings() { window.dispatchEvent(new Event("rk-open-cookies")); }

/** Lädt Tidio nur, wenn eine gespeicherte Zustimmung vorliegt (einmalig, auch bei Seitenwechseln). */
export function TidioLoader() {
  useEffect(() => {
    const sync = () => { if (readConsent()?.chat) loadTidio(); };
    sync(); window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);
  return null;
}

export function ChatPlaceholder() {
  const [chat, setChat] = useState<boolean | null>(null);
  useEffect(() => {
    const sync = () => setChat(readConsent()?.chat === true);
    sync(); window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);
  if (chat) return null;
  return <div className="chat-placeholder"><p>Für den Live-Chat wird Tidio geladen. Dabei werden Daten an Tidio übermittelt.</p><button className="btn btn-outline" onClick={() => saveConsent({ chat: true })}>Tidio-Chat aktivieren</button></div>;
}

export function CookieBanner() {
  const [show, setShow] = useState(false);
  const [chat, setChat] = useState(false);
  const ansicht = useAnsicht();
  useEffect(() => {
    const c = readConsent();
    if (!c) setShow(true);
    const open = () => { setChat(readConsent()?.chat === true); setShow(true); };
    window.addEventListener("rk-open-cookies", open);
    return () => window.removeEventListener("rk-open-cookies", open);
  }, []);
  const save = (value: boolean) => { setShow(false); saveConsent({ chat: value }); };
  if (!show) return null;
  return <div className="cookie-banner" role="dialog" aria-label="Datenschutzeinstellungen"><p><strong>Datenschutzeinstellungen</strong><br/>Technisch notwendig ist nur die Speicherung Ihrer Auswahl in Ihrem Browser. Den Live-Chat von Tidio laden wir ausschließlich mit Ihrer Zustimmung. Mehr in der <Link to="/datenschutz" search={ansicht}>Datenschutzerklärung</Link>.</p><label><input type="checkbox" checked={chat} onChange={(e) => setChat(e.target.checked)}/><span>Live-Chat (Tidio)</span></label><div className="cookie-actions"><button className="btn btn-gold" onClick={() => save(true)}>Alle akzeptieren</button><button className="btn btn-outline" onClick={() => save(false)}>Alle ablehnen</button><button className="btn btn-outline" onClick={() => save(chat)}>Auswahl speichern</button></div></div>;
}
