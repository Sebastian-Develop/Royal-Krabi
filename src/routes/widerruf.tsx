import { createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { LegalPage } from "@/components/legal-page";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/meta";
import { LegalText } from '@/components/legal-text';
import { legalTextsFor, WEBSITE_LEGAL_VERSION } from '@/lib/legal-texts';

export const Route = createFileRoute("/widerruf")({
  head: () => pageHead("Widerrufsbelehrung & Widerrufsformular | Royal Krabi", "Widerrufsbelehrung für Gutscheine und vorausbezahlte Massagekarten sowie das freiwillige Muster-Widerrufsformular von Royal Krabi Serenity Thaimassage.", "https://royalkrabi-thaimassage.de/widerruf"),
  component: Page,
});

function Page() {
  const legal = legalTextsFor(WEBSITE_LEGAL_VERSION);
  const paragraphs = (index: number) => legal.widerruf[index]?.paragraphs.map((text, i) => <p key={i}><LegalText text={text}/></p>);
  return <div className="withdrawal-page"><LegalPage title="Widerrufsbelehrung & Widerrufsformular" sections={[
    { title: 'Geltungsbereich', body: <>{paragraphs(0)}</> },
    { title: 'Widerrufsbelehrung', body: <><h3>Widerrufsrecht</h3>{paragraphs(1)}<h3>Folgen des Widerrufs</h3>{paragraphs(2)}</> },
    { title: 'Ergänzende Klarstellungen', body: <>{paragraphs(3)}</> },
    { title: "Muster-Widerrufsformular", body: <>
      <div className="withdrawal-print-actions"><Button variant="outline" className="btn btn-outline" onClick={() => window.print()}><Printer size={18}/> Drucken</Button></div>
      <div className="withdrawal-form">
        {legal.widerrufForm.map((text,i) => <p key={i}><LegalText text={text}/></p>)}
      </div>

    </> },
  ]}/></div>;
}
