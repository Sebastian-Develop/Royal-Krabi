import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import logoMark from "@/assets/royal-krabi-logo-trimmed.webp";
import { contact } from "@/lib/contact";
import { launch, websiteStartStatus } from "@/lib/launch";
import { AddressLink } from "./site";

export function LaunchHeader() {
  return <header className="launch-header"><Link to="/" search={{ ansicht: "coming-soon" }} aria-label="Royal Krabi Startseite"><img src={logoMark} alt={contact.name} width={1392} height={1197}/></Link></header>;
}

export function LaunchFooter() {
  return <footer className="launch-footer"><span>© 2026 {contact.name}</span><nav aria-label="Rechtliche Informationen"><Link to="/impressum" search={{ ansicht: "coming-soon" }}>Impressum</Link><Link to="/datenschutz" search={{ ansicht: "coming-soon" }}>Datenschutz</Link></nav></footer>;
}

export function ComingSoon() {
  return <main className="coming-soon">
    <section className="launch-introduction" aria-labelledby="launch-title">
      <div className="launch-divider" aria-hidden="true"><span/>◇<span/></div>
      <h1 id="launch-title">{launch.heading}</h1>
      <p className="launch-welcome">{launch.welcome}</p>
      <p className="launch-description">{launch.introduction}</p>
    </section>
    <section className="launch-update" aria-labelledby="launch-update-title">
      <span className="launch-status"><span aria-hidden="true"/>{websiteStartStatus()}</span>
      <h2 id="launch-update-title">{launch.updateHeading}</h2>
      <p>{launch.updateText}</p>
    </section>
    <section className="launch-contact" aria-labelledby="launch-contact-title">
      <h2 id="launch-contact-title">Kontakt</h2>
      <div className="launch-contact-links">
        <a href={contact.phoneHref}><Phone size={18}/><span>{contact.phone}</span><ArrowUpRight size={15}/></a>
        <a href={`mailto:${contact.email}`}><Mail size={18}/><span>{contact.email}</span><ArrowUpRight size={15}/></a>
      </div>
      <div className="launch-address"><MapPin size={18}/><AddressLink>{contact.street}, {contact.city}</AddressLink></div>
    </section>
  </main>;
}