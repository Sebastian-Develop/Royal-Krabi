import { Link } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import logoMark from "@/assets/royal-krabi-logo-trimmed.webp";
import { contact } from "@/lib/contact";
import { launch, websiteStartStatus } from "@/lib/launch";
import { OpeningInvitation } from "./opening-invitation";
import { FlyerAutoPopup } from "./flyer-popup";
import { SocialLinks } from "./social-links";

export function LaunchHeader() {
  return <header className="launch-header"><Link to="/" search={{ ansicht: "coming-soon" }} aria-label="Royal Krabi Startseite"><img src={logoMark} alt={contact.name} width={1392} height={1197}/></Link></header>;
}

export function LaunchFooter() {
  return <footer className="launch-footer"><SocialLinks/><span>© 2026 {contact.name}</span><nav aria-label="Rechtliche Informationen"><Link to="/impressum" search={{ ansicht: "coming-soon" }}>Impressum</Link><Link to="/datenschutz" search={{ ansicht: "coming-soon" }}>Datenschutz</Link></nav></footer>;
}

export function ComingSoon() {
  return <main className="coming-soon">
    <OpeningInvitation/>
    <div className="launch-jobs"><Link to="/jobs" search={{ ansicht: "coming-soon" }} className="btn btn-gold"><Briefcase size={18}/> JOBS BEI ROYAL KRABI – JETZT BEWERBEN</Link></div>
    <section className="launch-update" aria-labelledby="launch-update-title">
      <span className="launch-status"><span aria-hidden="true"/>{websiteStartStatus()}</span>
      <h2 id="launch-update-title">{launch.updateHeading}</h2>
      <p>{launch.updateText}</p>
    </section>
    <FlyerAutoPopup/>
  </main>;
}