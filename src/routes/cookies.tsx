import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChatPlaceholder, PageHero } from "@/components/site";
import { pageHead } from "@/lib/meta";
import { CONSENT_EVENT, readConsent, saveConsent } from "@/lib/consent";

export const Route = createFileRoute("/cookies")({ head: () => pageHead("Datenschutzeinstellungen | Royal Krabi", "Datenschutzeinstellungen und Live-Chat-Einwilligung für die Website von Royal Krabi Serenity Thaimassage.", "/cookies"), component: Page });

function Page() {
  const [saved, setSaved] = useState<boolean | null>(null);
  const [chat, setChat] = useState(false);
  useEffect(() => {
    const sync = () => { const c = readConsent(); setSaved(c ? c.chat : null); setChat(c?.chat === true); };
    sync(); window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);
  return <><PageHero title="Datenschutzeinstellungen" intro="Hier können Sie Ihre Auswahl jederzeit ändern und eine erteilte Zustimmung widerrufen."/><main className="section narrow"><div className="cookie-panel">
    <label><span><strong>Technisch notwendig</strong><small>Speichert Ihre Auswahl in Ihrem Browser. Immer aktiv.</small></span><input type="checkbox" checked disabled/></label>
    <label><span><strong>Live-Chat (Tidio)</strong><small>Lädt den Chat von Tidio. Dabei werden Daten an Tidio übermittelt. Standardmäßig deaktiviert.</small></span><input type="checkbox" checked={chat} onChange={(e) => setChat(e.target.checked)}/></label>
    <p>Gespeicherte Auswahl: <strong>{saved === null ? "Noch keine Auswahl" : saved ? "Live-Chat erlaubt" : "Live-Chat abgelehnt"}</strong></p>
    <div className="cookie-actions"><button className="btn btn-gold" onClick={() => saveConsent({ chat })}>Auswahl speichern</button><button className="btn btn-outline" onClick={() => saveConsent({ chat: false })}>Alle ablehnen</button></div>
    <p>Beim Widerruf werden im Browser zugängliche Tidio-Speicherwerte entfernt und die Seite neu geladen. Bereits an Tidio übermittelte Daten werden dadurch nicht automatisch gelöscht. Mehr in der <Link to="/datenschutz">Datenschutzerklärung</Link>.</p>
    <ChatPlaceholder/>
  </div></main></>;
}
