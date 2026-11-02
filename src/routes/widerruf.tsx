import { createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { LegalPage } from "@/components/legal-page";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/meta";
import { LegalText } from '@/components/legal-text';
import { legalTextsFor, WEBSITE_LEGAL_VERSION } from '@/lib/legal-texts';
import { legalDraftNotice, legalDraftReview } from '@/lib/legal-draft';

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
    { title: 'Vor Freigabe zu ergänzende Pflichtfunktion', body: <>{legalDraftReview[2]?.paragraphs.slice(1,3).map((text,i) => <p key={i}><LegalText text={text}/></p>)}</> },
  ]}/></div>;
}
