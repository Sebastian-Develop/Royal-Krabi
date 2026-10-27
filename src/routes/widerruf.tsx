import { createFileRoute, Link } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { LegalPage } from "@/components/legal-page";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/meta";
import { contact, withdrawalMailHref } from "@/lib/contact";
import { AddressLink } from "@/components/site";
import { withdrawalTerms } from "@/lib/withdrawal";

export const Route = createFileRoute("/widerruf")({
  head: () => pageHead("Widerrufsbelehrung & Widerrufsformular | Royal Krabi", "Widerrufsbelehrung für Gutscheine und vorausbezahlte Massagekarten sowie das freiwillige Muster-Widerrufsformular von Royal Krabi Serenity Thaimassage.", "https://royalkrabi-thaimassage.de/widerruf"),
  component: Page,
});

function Recipient() {
  return <>{contact.owner}, {contact.name}, <AddressLink>{contact.street}, {contact.city}</AddressLink>, Deutschland, E-Mail-Adresse: <a href={withdrawalMailHref}>{contact.email}</a></>;
}

function Page() {
  return <div className="withdrawal-page"><LegalPage title="Widerrufsbelehrung & Widerrufsformular" sections={[
    { title: "Geltungsbereich", body: <>
      <p>Über diese Website sind derzeit kein Onlinekauf und keine Onlinezahlung möglich. Gutscheine und Mehrfachkarten erhalten Sie nach telefonischer, schriftlicher oder persönlicher Absprache.</p>
      <p>Die folgende Belehrung ist für den Kauf von Gutscheinen sowie vorausbezahlten 5er- und 10er-Massagekarten durch Verbraucher über unsere Website vorgesehen, soweit der jeweilige Vertrag als Dienstleistungsvertrag einzuordnen ist und ein gesetzliches Widerrufsrecht besteht. Vor Einführung eines Onlineverkaufs wird sie auf den konkreten Verkaufsablauf und die jeweilige Gutschein- oder Kartenart abgestimmt.</p>
      <p>Die als „Abos“ bezeichneten Mehrfachkarten umfassen die vereinbarte Anzahl von Massagen; sie {withdrawalTerms.automaticRenewal ? "verlängern sich automatisch" : "verlängern sich nicht automatisch"} und begründen keinen laufenden Zahlungsvertrag.</p>
      <p>Diese Seite regelt nicht die Absage oder Umbuchung einzelner Massagetermine. Die hierzu vereinbarten Regelungen finden Sie in den <Link to="/agb">AGB</Link>. Andere zwingende gesetzliche Widerrufsrechte werden durch diese Eingrenzung nicht ausgeschlossen oder eingeschränkt.</p>
    </> },
    { title: "Widerrufsbelehrung", body: <>
      <h3>Widerrufsrecht</h3>
      <p>Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.</p>
      <p>Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des {withdrawalTerms.periodStart === "Vertragsabschluss" ? "Vertragsabschlusses" : withdrawalTerms.periodStart}.</p>
      <p>Um Ihr Widerrufsrecht auszuüben, müssen Sie uns ({contact.owner}, {contact.name}, <AddressLink>{contact.street}, {contact.city}</AddressLink>, Deutschland, Telefonnummer: <a href={contact.phoneHref}>{contact.phone}</a>, E-Mail-Adresse: <a href={withdrawalMailHref}>{contact.email}</a>) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.</p>
      <p>Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.</p>
      <h3>Folgen des Widerrufs</h3>
      <p>Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.</p>
    </> },
    { title: "Ergänzende Klarstellungen", body: <>
      <p>Eine Begründung für den Widerruf ist nicht erforderlich. Für einen wirksamen gesetzlichen Widerruf werden keine Storno- oder Bearbeitungsgebühren erhoben. Eine Regelung zur nicht freiwillig angebotenen Barauszahlung von Restguthaben schränkt gesetzliche Rückzahlungsansprüche nicht ein.</p>
      <p>Die Zahlung, der Versand oder die Abholung des Gutscheins beziehungsweise der Mehrfachkarte führen nicht automatisch zum Verlust des Widerrufsrechts. Auch die bloße Ausstellung einer Karte ist nicht ohne weitere Prüfung als vollständige Erbringung der versprochenen Massageleistungen anzusehen.</p>
      <p><strong>Vorzeitige Einlösung:</strong> Ob bei einer ausdrücklich gewünschten Einlösung innerhalb der Widerrufsfrist Wertersatz geschuldet wird oder das Widerrufsrecht nach vollständiger Leistung erlischt, richtet sich nach den gesetzlichen Voraussetzungen und der rechtlichen Einordnung des konkreten Vertrags. Ein automatischer Verfall allein durch eine Teileinlösung ist nicht vorgesehen.</p>
    </> },
    { title: "Muster-Widerrufsformular", body: <>
      <div className="withdrawal-print-actions"><Button variant="outline" className="btn btn-outline" onClick={() => window.print()}><Printer size={18}/> Drucken</Button></div>
      <div className="withdrawal-form">
        <p>(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)</p>
        <p>– An <Recipient/>:</p>
        <p>– Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*)</p>
        <div className="withdrawal-lines" aria-hidden="true"><span/><span/><span/></div>
        <p>– Bestellt am (*)/erhalten am (*)</p><div className="withdrawal-lines" aria-hidden="true"><span/></div>
        <p>– Name des/der Verbraucher(s)</p><div className="withdrawal-lines" aria-hidden="true"><span/></div>
        <p>– Anschrift des/der Verbraucher(s)</p><div className="withdrawal-lines" aria-hidden="true"><span/><span/></div>
        <p>– Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)</p><div className="withdrawal-lines" aria-hidden="true"><span/></div>
        <p>– Datum</p><div className="withdrawal-lines" aria-hidden="true"><span/></div>
        <p>(*) Unzutreffendes streichen.</p>
      </div>
      <p>Bezeichnen Sie den Gutschein oder die 5er-/10er-Karte möglichst genau, beispielsweise durch Wert, Massageart und Dauer. Eine Bestellnummer können Sie ergänzen, falls vorhanden; sie ist keine Voraussetzung. Das Feld „erhalten am“ im amtlichen Formular legt nicht den rechtlichen Fristbeginn fest. Für einen Widerruf per E-Mail ist keine Unterschrift erforderlich; eine eindeutige Erklärung ohne dieses Formular genügt.</p>
    </> },
  ]}/></div>;
}
