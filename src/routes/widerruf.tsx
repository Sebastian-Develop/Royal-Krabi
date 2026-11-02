import { createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { LegalPage } from "@/components/legal-page";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/meta";
import { LegalText } from '@/components/legal-text';
import { legalTextsFor, WEBSITE_LEGAL_VERSION } from '@/lib/legal-texts';
import { legalDraftNotice } from '@/lib/legal-draft';
import { WithdrawalFunction } from '@/components/withdrawal-function';
import { contact } from '@/lib/contact';
import dividerAsset from '@/assets/email/email-gold-divider.png.asset.json';

export const Route = createFileRoute("/widerruf")({
  head: () => pageHead("Widerrufsbelehrung & Widerrufsformular | Royal Krabi", "Widerrufsbelehrung für Gutscheine und vorausbezahlte Massagekarten sowie das freiwillige Muster-Widerrufsformular von Royal Krabi Serenity Thaimassage.", "https://royalkrabi-thaimassage.de/widerruf"),
  component: Page,
});

function Page() {
  const legal = legalTextsFor(WEBSITE_LEGAL_VERSION);
  return <div className="withdrawal-page"><LegalPage title="Widerrufsbelehrung & Widerrufsformular" notice={legalDraftNotice} sections={[
    ...legal.widerruf.map(section => ({ title: section.title, body: <>{section.paragraphs.map((text, i) => <p key={i}><LegalText text={text}/></p>)}</> })),
    { title: "Muster-Widerrufsformular", body: <>
      <div className="withdrawal-print-actions"><Button variant="outline" className="btn btn-outline" onClick={() => window.print()}><Printer size={18}/> Drucken</Button></div>
      <div className="withdrawal-form">
        {legal.widerrufForm.map((text,i) => <p key={i}><LegalText text={text}/></p>)}
      </div>

    </> },
    { title: 'Vertrag widerrufen', body: <div className="withdrawal-online">
      <p><LegalText text={`Sie können Ihren Vertrag auch elektronisch über die Funktion ‚Vertrag widerrufen‘ auf dieser Seite widerrufen. Alternativ können Sie den Widerruf per E-Mail an ${contact.email} erklären.`}/></p>
      <WithdrawalFunction/>
    </div> },
  ]}/>
  <footer className="container withdrawal-brand-footer" aria-label="Kontakt">
    <img src={dividerAsset.url} alt="" role="presentation" width={1200} height={80}/>
    <p className="withdrawal-brand-name">{contact.name}</p>
    <p>Öffnungszeiten:<br/>{contact.hoursOpen} · {contact.hoursClosed}<br/>Telefon: <a href={contact.phoneHref}>{contact.phone}</a> · <a href={`mailto:${contact.email}`}>{contact.email}</a></p>
    <p className="withdrawal-brand-address">{contact.street} · {contact.city}</p>
  </footer></div>;
}
