import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { pageHead } from "@/lib/meta";
import { contact } from "@/lib/contact";
import { AddressLink } from "@/components/site";

export const Route = createFileRoute("/agb")({
  head: () => pageHead("AGB | Royal Krabi Serenity Thaimassage", "Allgemeine Geschäftsbedingungen von Royal Krabi Serenity Thaimassage in Offenbach.", "/agb"),
  component: Page,
});

function Page() {
  return <LegalPage title="Allgemeine Geschäftsbedingungen" sections={[
    { title: "1. Anbieter und Geltungsbereich", body: <>
      <p>Anbieter ist <strong>Jirayut Rudklang</strong>, tätig unter <strong>{contact.name}</strong>, <AddressLink>{contact.street}, {contact.city}</AddressLink>, Deutschland.</p>
      <p>Telefon: <strong>{contact.phone}</strong><br />E-Mail: <strong>{contact.email}</strong></p>
      <p>Diese allgemeinen Geschäftsbedingungen betreffen die vereinbarten Wellnessmassagen, bezahlte Gutscheine sowie vorausbezahlte 5er- und 10er-Mehrfachkarten, soweit sie wirksam in den jeweiligen Vertrag einbezogen wurden. Individuell getroffene Vereinbarungen haben Vorrang.</p>
      <p>Unsere Massagen dienen der Entspannung und dem allgemeinen Wohlbefinden. Sie sind keine medizinischen Leistungen und ersetzen keine ärztliche Untersuchung, Diagnose oder Therapie. Ein bestimmter gesundheitlicher Erfolg wird nicht zugesagt.</p>
    </> },
    { title: "2. Terminvereinbarung, Leistungsumfang und Preise", body: <>
      <p>Massagen erfolgen nach vorheriger Terminvereinbarung. Terminanfragen sind telefonisch oder per E-Mail möglich. Eine Anfrage allein ist noch keine Terminbestätigung. Ein Termin ist verbindlich vereinbart, sobald wir ihn telefonisch oder schriftlich bestätigt haben.</p>
      <p>Die Website bietet keine automatische Onlinebuchung, keinen Onlinekauf und keine Onlinezahlung an. Die Kontaktbuttons öffnen einen Telefonanruf oder eine vorbereitete Nachricht im eigenen E-Mail-Programm; eine solche vorbereitete Nachricht wird nicht automatisch versendet.</p>
      <p>Für die Massage gelten die bei Vertragsschluss vereinbarten Preise, die vereinbarte Massageart und die vereinbarte Dauer. Für Gutscheine und Mehrfachkarten gelten der jeweils vereinbarte Umfang und Kaufpreis. Die konkret angebotene Zahlungsweise wird vor Vertragsschluss mitgeteilt.</p>
    </> },
    { title: "3. Gesundheitliche Hinweise und sichere Durchführung", body: <>
      <p>Bitte informieren Sie uns vor Beginn über bekannte Umstände, die für eine sichere Durchführung der vereinbarten Massage relevant sein können. Dazu gehören insbesondere Schwangerschaft, akute Beschwerden, Verletzungen, kürzlich erfolgte Operationen sowie relevante Unverträglichkeiten gegenüber verwendeten Produkten. Eine pauschale Offenlegung sämtlicher Diagnosen wird nicht verlangt.</p>
      <p>Bei Unsicherheit über die gesundheitliche Eignung lassen Sie diese bitte vorab ärztlich abklären. Aus Sicherheitsgründen kann eine Massage nach Rücksprache angepasst, abgelehnt oder abgebrochen werden.</p>
      <p>Eine Anpassung, Ablehnung oder ein Abbruch begründet nicht automatisch eine Pflicht zur Zahlung des vollständigen Preises. Ob und in welcher Höhe Ansprüche bestehen, richtet sich nach der konkreten Situation und den gesetzlichen Voraussetzungen. Unsere eigene gesetzliche Haftung wird durch diese Hinweise nicht ausgeschlossen oder eingeschränkt.</p>
    </> },
    { title: "4. Terminabsagen, Umbuchungen und Nichterscheinen", body: <>
      <p>Bitte informieren Sie uns möglichst frühzeitig, wenn Sie einen Termin absagen oder verschieben möchten. Absagen können telefonisch, per E-Mail oder persönlich erfolgen. Maßgeblich ist der Zugang der Absage bei uns, nicht allein der Zeitpunkt ihres Absendens.</p>
      <p>Eine Umbuchung setzt eine Vereinbarung über den neuen Termin voraus. Aus einer Anfrage zur Umbuchung folgt weder automatisch eine Bestätigung des neuen Termins noch eine Befreiung von gegebenenfalls gesetzlich bestehenden Ansprüchen aus dem bisherigen Termin.</p>
      <p>Für Absagen und Nichterscheinen wird keine prozentuale Ausfallpauschale vereinbart. Etwaige Ansprüche richten sich nach den gesetzlichen Voraussetzungen im konkreten Fall. Eine anderweitige Vergabe des Termins und ersparte Aufwendungen sind nach Maßgabe des Gesetzes zu berücksichtigen. Es besteht keine automatische, ausnahmslose Pflicht zur Zahlung des gesamten Massagepreises.</p>
      <p>Eine Ausfallforderung darf nicht zusätzlich durch vollständige Entwertung derselben vorausbezahlten Massage oder eines Gutscheins doppelt berechnet werden. Ein pauschales Recht, Ausfallforderungen ungeprüft von vorhandenem Guthaben abzuziehen, besteht nicht.</p>
    </> },
    { title: "5. Verspätung und Absage durch das Studio", body: <>
      <p>Bei verspätetem Erscheinen kann sich die Massage verkürzen, wenn andernfalls nachfolgende Termine beeinträchtigt würden. Daraus ergibt sich nicht automatisch eine pauschale finanzielle Folge; maßgeblich bleiben die konkrete Situation und die gesetzlichen Voraussetzungen.</p>
      <p>Sagen wir einen Termin ab, bieten wir nach Möglichkeit einen Ersatztermin an. Für eine von uns nicht erbrachte Massage wird keine Massage aus einer Mehrfachkarte abgezogen. Gesetzliche Erstattungsrechte bleiben unberührt.</p>
    </> },
    { title: "6. Bezahlte Wertgutscheine", body: <>
      <p>Bezahlte Wertgutscheine können bis zur Höhe ihres verfügbaren Guthabens eingelöst werden. Teileinlösungen sind möglich; verbleibendes Restguthaben bleibt bestehen.</p>
      <p>Eine freiwillige Barauszahlung des Gutscheinwertes oder des Restguthabens ist nicht vorgesehen. Gesetzliche Widerrufs-, Rücktritts- und sonstige Rückzahlungsansprüche bleiben ausdrücklich unberührt.</p>
      <p>Für Ansprüche aus normalen bezahlten Wertgutscheinen gelten grundsätzlich die gesetzlichen Verjährungsregeln. Die regelmäßige Verjährungsfrist beträgt drei Jahre. Sie beginnt grundsätzlich mit dem Schluss des Jahres, in dem der Anspruch entstanden ist und die weiteren Voraussetzungen des § 199 Absatz 1 BGB erfüllt sind. Entsteht der Anspruch beispielsweise 2026 und liegen die weiteren Voraussetzungen in diesem Jahr vor, läuft die regelmäßige Frist grundsätzlich bis zum Ende des 31. Dezember 2029. Gesetzliche Regelungen etwa zur Hemmung oder zum Neubeginn können den Ablauf beeinflussen.</p>
      <p>Die Verjährung ist kein automatisches Löschen des Guthabens: Nach Eintritt der Verjährung kann die Leistung nach Maßgabe des Gesetzes verweigert werden. Eine eigenständige verkürzte Verfallsfrist von zwölf Monaten wird nicht vereinbart.</p>
    </> },
    { title: "7. Vorausbezahlte 5er- und 10er-Mehrfachkarten", body: <>
      <p>Die Bezeichnungen „5er-Abo“ und „10er-Abo“ meinen vorausbezahlte Mehrfachkarten. Eine 5er-Karte umfasst fünf, eine 10er-Karte zehn Massagen der jeweils vereinbarten Art und Dauer. Es gibt keine automatische Verlängerung und keinen laufenden Zahlungsvertrag.</p>
      <p>Massageart und Dauer werden beim Kauf vereinbart. Eine Änderung bedarf einer vorherigen Vereinbarung; ein dabei entstehender Preisunterschied kann ebenfalls vereinbart werden. Paarmassagen sind nicht Bestandteil dieser Einzel-Mehrfachkarten.</p>
      <p>Jede tatsächlich erbrachte Massage wird vom verbleibenden Kontingent abgezogen. Nicht erbrachte Massagen werden nicht allein deshalb abgezogen, weil das Studio einen Termin absagt. Die Regelungen zu Absagen in Abschnitt 4 bleiben zu beachten; eine doppelte Berechnung ist ausgeschlossen.</p>
      <p>Mehrfachkarten sind nicht mit anderen Rabatten oder Sonderangeboten kombinierbar, sofern nicht ausdrücklich etwas anderes vereinbart wird. Ob über Mehrfachkarten bezahlte Besuche Treuepass-Stempel erhalten, ist damit noch nicht entschieden.</p>
      <p>Es werden keine verkürzte Einlösefrist und keine Nichtübertragbarkeit vereinbart. Ein automatischer ersatzloser Verfall vorausbezahlter Massagen findet nicht statt. Eine freiwillige Auszahlung verbleibender Massagen ist nicht vorgesehen; gesetzliche Beendigungs- und Rückzahlungsrechte bleiben unberührt.</p>
    </> },
    { title: "8. Zahlung, Postversand und Abholung von Gutscheinen und Mehrfachkarten", body: <>
      <p>Gutscheine und Mehrfachkarten werden ausschließlich innerhalb Deutschlands mit DHL versendet. Der Versand ist kostenfrei, ohne Mindestbestellmenge und ohne Mindestbestellwert. Nach Prüfung des vollständigen Zahlungseingangs geben wir Ihre Bestellung in der Regel innerhalb von drei Werktagen bei DHL ein oder stellen sie zur vereinbarten Abholung bereit. Werktage im Sinne dieser Bearbeitungsfrist sind Montag bis Freitag, ausgenommen gesetzliche Feiertage am Betriebsort.</p>
      <p>Die Postlaufzeit kommt hinzu. Eine Zustellung innerhalb von drei Tagen wird nicht zugesagt. Eine Abholung vor Ort wird vorher abgestimmt; die Definition der Bearbeitungsfrist bedeutet nicht, dass das Studio montags für eine Abholung geöffnet ist.</p>
      <p>Nach Übergabe an DHL ist ein Einlieferungsbeleg als Nachweis der Übergabe auf Anfrage erhältlich. Eine automatische Zusendung oder Sendungsverfolgung wird nicht zugesagt. Die gesetzlichen Rechte bei Verlust oder Beschädigung sowie Widerrufs- und Rückzahlungsrechte bleiben unberührt; für den kostenfreien Standardversand wurden keine Lieferkosten vom Kunden gezahlt.</p>
      <p>Die tatsächlich verfügbaren Zahlungswege werden vor Vertragsschluss vereinbart. Eine automatische digitale Zustellung, Onlinezahlung oder digitale Gutscheincode-Verwaltung wird derzeit nicht angeboten. Bestellanfragen werden erst durch unsere ausdrückliche manuelle Annahme angenommen.</p>
    </> },
    { title: "9. Royal Paarmassage und Premium-Upgrades", body: <>
      <p>Die klassische Royal Paarmassage ist das Standardangebot. Premium-Upgrades können freiwillig gegen Aufpreis vereinbart werden.</p>
      <p><strong>Jeder ausgewiesene Upgrade-Aufpreis gilt PRO PERSON zusätzlich zum Paarmassage-Grundpreis.</strong> Wenn beide Personen ein Upgrade wählen, werden die jeweiligen Aufpreise für beide Personen berechnet.</p>
      <p>Upgrade-Wünsche können telefonisch, per E-Mail oder persönlich vor Ort mitgeteilt werden. Ein Upgrade unmittelbar vor Beginn ist von der Verfügbarkeit abhängig. Massageart und Aufpreis werden vor Beginn vereinbart. Es gelten ausschließlich die tatsächlich vereinbarten Preise und Aufpreise.</p>
    </> },
    { title: "10. Royal Krabi Treuepass", body: <>
      <p>Für jeden Besuch mit einer tatsächlich in Anspruch genommenen Massage von mindestens 60 Minuten erhält der Kunde einen Stempel. Pro entsprechendem Besuch wird ein Stempel vergeben; eine längere Massage führt nicht zu mehreren Stempeln.</p>
      <p>Nach zehn qualifizierenden Besuchen erhält der Kunde einmalig 50 % Rabatt auf die nächste Massage. Die Massageart ist grundsätzlich frei wählbar. Bei Einlösung werden die zehn Stempel entwertet.</p>
      <p>Die freie Wahl der Massage umfasst grundsätzlich auch Premium- und Signature-Massagen.</p>
    </> },
    { title: "11. Widerruf und gesetzliche Verbraucherrechte", body: <>
      <p>Gesetzliche Widerrufsrechte sind von vertraglichen Terminabsagefristen zu unterscheiden. Bei Verträgen, die ausschließlich über Fernkommunikationsmittel oder außerhalb der Geschäftsräume geschlossen werden, kann Verbrauchern unter den jeweiligen gesetzlichen Voraussetzungen ein Widerrufsrecht zustehen. Nicht jede telefonische oder per E-Mail geführte Anfrage begründet für sich allein einen Fernabsatzvertrag.</p>
      <p>Eine pauschale Ausnahme vom Widerrufsrecht für sämtliche Massagen, Gutscheine oder Mehrfachkarten wird nicht vereinbart. Soweit gesetzlich erforderlich, sind vor Vertragsschluss eine zum tatsächlichen Verkaufsablauf passende Widerrufsbelehrung und ein Muster-Widerrufsformular gesondert bereitzustellen. Dieser Abschnitt ersetzt diese Dokumente nicht.</p>
      <p>Gesetzliche Gewährleistungs-, Haftungs-, Beendigungs- und Rückzahlungsrechte bleiben unberührt. Diese AGB enthalten keinen pauschalen Haftungsausschluss, keine besondere Gerichtsstandsvereinbarung für Verbraucher und keine automatische Ersetzung unwirksamer Klauseln durch wirtschaftlich ähnliche Regelungen.</p>
    </> },
  ]} />;
}
