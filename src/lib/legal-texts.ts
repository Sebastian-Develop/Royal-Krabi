import previousDraft from './legal-20261102-review.json';
import { legalDraftAgb, legalDraftWithdrawal, legalDraftForm } from './legal-draft';
/**
 * Versionierte Rechtstexte für Bestellunterlagen (PDF-Anhänge).
 * Jede Bestellung speichert ihre Textfassung; spätere Änderungen an einer
 * neuen Version verändern ältere Bestellungen nicht rückwirkend.
 * Neue Fassung = neuer Eintrag in LEGAL_VERSIONS, aktuelle Version in CURRENT_LEGAL_VERSION.
 */

export interface LegalTextVersion {
  version: string;
  released: boolean;
  datenschutz?: { title: string; paragraphs: string[] }[];
  agb: { title: string; paragraphs: string[] }[];
  widerruf: { title: string; paragraphs: string[] }[];
  widerrufForm: string[];
}

const v20261021: LegalTextVersion = {
  version: "2026-10-21",
  released: true,
  agb: [
    { title: "1. Anbieter und Geltungsbereich", paragraphs: [
      `Anbieter ist Jirayut Rudklang, tätig unter Royal Krabi Serenity Thaimassage, Offenbacher Str. 32, 63075 Offenbach am Main, Deutschland.`,
      `Telefon: 069 60511884 – E-Mail: kontakt@royalkrabi-thaimassage.de`,
      "Diese allgemeinen Geschäftsbedingungen betreffen die vereinbarten Wellnessmassagen, bezahlte Gutscheine sowie vorausbezahlte 5er- und 10er-Mehrfachkarten, soweit sie wirksam in den jeweiligen Vertrag einbezogen wurden. Individuell getroffene Vereinbarungen haben Vorrang.",
      "Unsere Massagen dienen der Entspannung und dem allgemeinen Wohlbefinden. Sie sind keine medizinischen Leistungen und ersetzen keine ärztliche Untersuchung, Diagnose oder Therapie. Ein bestimmter gesundheitlicher Erfolg wird nicht zugesagt.",
    ] },
    { title: "2. Terminvereinbarung, Leistungsumfang und Preise", paragraphs: [
      "Massagen erfolgen nach vorheriger Terminvereinbarung. Terminanfragen sind telefonisch oder per E-Mail möglich. Eine Anfrage allein ist noch keine Terminbestätigung. Ein Termin ist verbindlich vereinbart, sobald wir ihn telefonisch oder schriftlich bestätigt haben.",
      "Für die Massage gelten die bei Vertragsschluss vereinbarten Preise, die vereinbarte Massageart und die vereinbarte Dauer. Für Gutscheine und Mehrfachkarten gelten der jeweils vereinbarte Umfang und Kaufpreis. Die konkret angebotene Zahlungsweise wird vor Vertragsschluss mitgeteilt.",
    ] },
    { title: "3. Gesundheitliche Hinweise und sichere Durchführung", paragraphs: [
      "Bitte informieren Sie uns vor Beginn über bekannte Umstände, die für eine sichere Durchführung der vereinbarten Massage relevant sein können. Dazu gehören insbesondere Schwangerschaft, akute Beschwerden, Verletzungen, kürzlich erfolgte Operationen sowie relevante Unverträglichkeiten gegenüber verwendeten Produkten. Eine pauschale Offenlegung sämtlicher Diagnosen wird nicht verlangt.",
      "Bei Unsicherheit über die gesundheitliche Eignung lassen Sie diese bitte vorab ärztlich abklären. Aus Sicherheitsgründen kann eine Massage nach Rücksprache angepasst, abgelehnt oder abgebrochen werden.",
      "Eine Anpassung, Ablehnung oder ein Abbruch begründet nicht automatisch eine Pflicht zur Zahlung des vollständigen Preises. Ob und in welcher Höhe Ansprüche bestehen, richtet sich nach der konkreten Situation und den gesetzlichen Voraussetzungen. Unsere eigene gesetzliche Haftung wird durch diese Hinweise nicht ausgeschlossen oder eingeschränkt.",
    ] },
    { title: "4. Terminabsagen, Umbuchungen und Nichterscheinen", paragraphs: [
      "Bitte informieren Sie uns möglichst frühzeitig, wenn Sie einen Termin absagen oder verschieben möchten. Absagen können telefonisch, per E-Mail oder persönlich erfolgen. Maßgeblich ist der Zugang der Absage bei uns, nicht allein der Zeitpunkt ihres Absendens.",
      "Eine Umbuchung setzt eine Vereinbarung über den neuen Termin voraus. Aus einer Anfrage zur Umbuchung folgt weder automatisch eine Bestätigung des neuen Termins noch eine Befreiung von gegebenenfalls gesetzlich bestehenden Ansprüchen aus dem bisherigen Termin.",
      "Für Absagen und Nichterscheinen wird keine prozentuale Ausfallpauschale vereinbart. Etwaige Ansprüche richten sich nach den gesetzlichen Voraussetzungen im konkreten Fall. Eine anderweitige Vergabe des Termins und ersparte Aufwendungen sind nach Maßgabe des Gesetzes zu berücksichtigen. Es besteht keine automatische, ausnahmslose Pflicht zur Zahlung des gesamten Massagepreises.",
      "Eine Ausfallforderung darf nicht zusätzlich durch vollständige Entwertung derselben vorausbezahlten Massage oder eines Gutscheins doppelt berechnet werden. Ein pauschales Recht, Ausfallforderungen ungeprüft von vorhandenem Guthaben abzuziehen, besteht nicht.",
    ] },
    { title: "5. Verspätung und Absage durch das Studio", paragraphs: [
      "Bei verspätetem Erscheinen kann sich die Massage verkürzen, wenn andernfalls nachfolgende Termine beeinträchtigt würden. Daraus ergibt sich nicht automatisch eine pauschale finanzielle Folge; maßgeblich bleiben die konkrete Situation und die gesetzlichen Voraussetzungen.",
      "Sagen wir einen Termin ab, bieten wir nach Möglichkeit einen Ersatztermin an. Für eine von uns nicht erbrachte Massage wird keine Massage aus einer Mehrfachkarte abgezogen. Gesetzliche Erstattungsrechte bleiben unberührt.",
    ] },
    { title: "6. Bezahlte Wertgutscheine", paragraphs: [
      "Bezahlte Wertgutscheine können bis zur Höhe ihres verfügbaren Guthabens eingelöst werden. Teileinlösungen sind möglich; verbleibendes Restguthaben bleibt bestehen.",
      "Eine freiwillige Barauszahlung des Gutscheinwertes oder des Restguthabens ist nicht vorgesehen. Gesetzliche Widerrufs-, Rücktritts- und sonstige Rückzahlungsansprüche bleiben ausdrücklich unberührt.",
      "Für Ansprüche aus normalen bezahlten Wertgutscheinen gelten grundsätzlich die gesetzlichen Verjährungsregeln. Die regelmäßige Verjährungsfrist beträgt drei Jahre. Sie beginnt grundsätzlich mit dem Schluss des Jahres, in dem der Anspruch entstanden ist und die weiteren Voraussetzungen des § 199 Absatz 1 BGB erfüllt sind.",
      "Die Verjährung ist kein automatisches Löschen des Guthabens: Nach Eintritt der Verjährung kann die Leistung nach Maßgabe des Gesetzes verweigert werden. Eine eigenständige verkürzte Verfallsfrist von zwölf Monaten wird nicht vereinbart.",
    ] },
    { title: "7. Vorausbezahlte 5er- und 10er-Mehrfachkarten", paragraphs: [
      "Die Bezeichnungen „5er-Abo“ und „10er-Abo“ meinen vorausbezahlte Mehrfachkarten. Eine 5er-Karte umfasst fünf, eine 10er-Karte zehn Massagen der jeweils vereinbarten Art und Dauer. Es gibt keine automatische Verlängerung und keinen laufenden Zahlungsvertrag.",
      "Massageart und Dauer werden beim Kauf vereinbart. Eine Änderung bedarf einer vorherigen Vereinbarung; ein dabei entstehender Preisunterschied kann ebenfalls vereinbart werden. Paarmassagen sind nicht Bestandteil dieser Einzel-Mehrfachkarten.",
      "Jede tatsächlich erbrachte Massage wird vom verbleibenden Kontingent abgezogen. Nicht erbrachte Massagen werden nicht allein deshalb abgezogen, weil das Studio einen Termin absagt. Die Regelungen zu Absagen in Abschnitt 4 bleiben zu beachten; eine doppelte Berechnung ist ausgeschlossen.",
      "Mehrfachkarten sind nicht mit anderen Rabatten oder Sonderangeboten kombinierbar, sofern nicht ausdrücklich etwas anderes vereinbart wird. Ob über Mehrfachkarten bezahlte Besuche Treuepass-Stempel erhalten, ist damit noch nicht entschieden.",
      "Es werden keine verkürzte Einlösefrist und keine Nichtübertragbarkeit vereinbart. Ein automatischer ersatzloser Verfall vorausbezahlter Massagen findet nicht statt. Eine freiwillige Auszahlung verbleibender Massagen ist nicht vorgesehen; gesetzliche Beendigungs- und Rückzahlungsrechte bleiben unberührt.",
    ] },
    { title: "8. Zahlung, Postversand und Abholung von Gutscheinen und Mehrfachkarten", paragraphs: [
      "Gutscheine und Mehrfachkarten werden ausschließlich innerhalb Deutschlands mit DHL versendet. Der Versand ist kostenfrei, ohne Mindestbestellmenge und ohne Mindestbestellwert. Nach Prüfung des vollständigen Zahlungseingangs geben wir Ihre Bestellung in der Regel innerhalb von drei Werktagen bei DHL ein oder stellen sie zur vereinbarten Abholung bereit. Werktage im Sinne dieser Bearbeitungsfrist sind Montag bis Freitag, ausgenommen gesetzliche Feiertage am Betriebsort.",
      "Die Postlaufzeit kommt hinzu. Eine Zustellung innerhalb von drei Tagen wird nicht zugesagt. Eine Abholung vor Ort wird vorher abgestimmt; die Definition der Bearbeitungsfrist bedeutet nicht, dass das Studio montags für eine Abholung geöffnet ist.",
      "Nach Übergabe an DHL ist ein Einlieferungsbeleg als Nachweis der Übergabe auf Anfrage erhältlich. Eine automatische Zusendung oder Sendungsverfolgung wird nicht zugesagt. Die gesetzlichen Rechte bei Verlust oder Beschädigung sowie Widerrufs- und Rückzahlungsrechte bleiben unberührt; für den kostenfreien Standardversand wurden keine Lieferkosten vom Kunden gezahlt.",
      "Die tatsächlich verfügbaren Zahlungswege werden vor Vertragsschluss vereinbart. Eine automatische digitale Zustellung oder digitale Gutscheincode-Verwaltung wird derzeit nicht angeboten. Bestellanfragen werden erst durch unsere ausdrückliche manuelle Annahme angenommen.",
    ] },
    { title: "9. Royal Paarmassage und Premium-Upgrades", paragraphs: [
      "Die klassische Royal Paarmassage ist das Standardangebot. Premium-Upgrades können freiwillig gegen Aufpreis vereinbart werden.",
      "Jeder ausgewiesene Upgrade-Aufpreis gilt PRO PERSON zusätzlich zum Paarmassage-Grundpreis. Wenn beide Personen ein Upgrade wählen, werden die jeweiligen Aufpreise für beide Personen berechnet.",
      "Upgrade-Wünsche können telefonisch, per E-Mail oder persönlich vor Ort mitgeteilt werden. Ein Upgrade unmittelbar vor Beginn ist von der Verfügbarkeit abhängig. Massageart und Aufpreis werden vor Beginn vereinbart. Es gelten ausschließlich die tatsächlich vereinbarten Preise und Aufpreise.",
    ] },
    { title: "10. Royal Krabi Treuepass", paragraphs: [
      "Für jeden Besuch mit einer tatsächlich in Anspruch genommenen Massage von mindestens 60 Minuten erhält der Kunde einen Stempel. Pro entsprechendem Besuch wird ein Stempel vergeben; eine längere Massage führt nicht zu mehreren Stempeln.",
      "Nach zehn qualifizierenden Besuchen erhält der Kunde einmalig 50 % Rabatt auf die nächste Massage. Die Massageart ist grundsätzlich frei wählbar. Bei Einlösung werden die zehn Stempel entwertet.",
      "Die freie Wahl der Massage umfasst grundsätzlich auch Premium- und Signature-Massagen.",
    ] },
    { title: "11. Widerruf und gesetzliche Verbraucherrechte", paragraphs: [
      "Gesetzliche Widerrufsrechte sind von vertraglichen Terminabsagefristen zu unterscheiden. Bei Verträgen, die ausschließlich über Fernkommunikationsmittel oder außerhalb der Geschäftsräume geschlossen werden, kann Verbrauchern unter den jeweiligen gesetzlichen Voraussetzungen ein Widerrufsrecht zustehen. Nicht jede telefonische oder per E-Mail geführte Anfrage begründet für sich allein einen Fernabsatzvertrag.",
      "Eine pauschale Ausnahme vom Widerrufsrecht für sämtliche Massagen, Gutscheine oder Mehrfachkarten wird nicht vereinbart. Soweit gesetzlich erforderlich, sind vor Vertragsschluss eine zum tatsächlichen Verkaufsablauf passende Widerrufsbelehrung und ein Muster-Widerrufsformular gesondert bereitzustellen. Dieser Abschnitt ersetzt diese Dokumente nicht.",
      "Gesetzliche Gewährleistungs-, Haftungs-, Beendigungs- und Rückzahlungsrechte bleiben unberührt. Diese AGB enthalten keinen pauschalen Haftungsausschluss, keine besondere Gerichtsstandsvereinbarung für Verbraucher und keine automatische Ersetzung unwirksamer Klauseln durch wirtschaftlich ähnliche Regelungen.",
    ] },
  ],
  widerruf: [
    { title: "Geltungsbereich", paragraphs: [
      "Die folgende Belehrung gilt für den Kauf von Gutscheinen sowie vorausbezahlten 5er- und 10er-Massagekarten durch Verbraucher über unsere Website, soweit der jeweilige Vertrag als Dienstleistungsvertrag einzuordnen ist und ein gesetzliches Widerrufsrecht besteht.",
      "Die als „Abos“ bezeichneten Mehrfachkarten umfassen die vereinbarte Anzahl von Massagen; sie verlängern sich nicht automatisch und begründen keinen laufenden Zahlungsvertrag.",
      "Diese Belehrung regelt nicht die Absage oder Umbuchung einzelner Massagetermine. Die hierzu vereinbarten Regelungen finden Sie in den AGB. Andere zwingende gesetzliche Widerrufsrechte werden durch diese Eingrenzung nicht ausgeschlossen oder eingeschränkt.",
    ] },
    { title: "Widerrufsrecht", paragraphs: [
      "Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.",
      "Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.",
      `Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (Jirayut Rudklang, Royal Krabi Serenity Thaimassage, Offenbacher Str. 32, 63075 Offenbach am Main, Deutschland, Telefonnummer: 069 60511884, E-Mail-Adresse: kontakt@royalkrabi-thaimassage.de) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.`,
      "Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.",
    ] },
    { title: "Folgen des Widerrufs", paragraphs: [
      "Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.",
    ] },
    { title: "Ergänzende Klarstellungen", paragraphs: [
      "Eine Begründung für den Widerruf ist nicht erforderlich. Für einen wirksamen gesetzlichen Widerruf werden keine Storno- oder Bearbeitungsgebühren erhoben. Eine Regelung zur nicht freiwillig angebotenen Barauszahlung von Restguthaben schränkt gesetzliche Rückzahlungsansprüche nicht ein.",
      "Die Zahlung, der Versand oder die Abholung des Gutscheins beziehungsweise der Mehrfachkarte führen nicht automatisch zum Verlust des Widerrufsrechts. Auch die bloße Ausstellung einer Karte ist nicht ohne weitere Prüfung als vollständige Erbringung der versprochenen Massageleistungen anzusehen.",
      "Vorzeitige Einlösung: Ob bei einer ausdrücklich gewünschten Einlösung innerhalb der Widerrufsfrist Wertersatz geschuldet wird oder das Widerrufsrecht nach vollständiger Leistung erlischt, richtet sich nach den gesetzlichen Voraussetzungen und der rechtlichen Einordnung des konkreten Vertrags. Ein automatischer Verfall allein durch eine Teileinlösung ist nicht vorgesehen.",
    ] },
  ],
  widerrufForm: [
    "(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)",
    `– An Jirayut Rudklang, Royal Krabi Serenity Thaimassage, Offenbacher Str. 32, 63075 Offenbach am Main, Deutschland, E-Mail-Adresse: kontakt@royalkrabi-thaimassage.de:`,
    "– Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*): ______________________________________________",
    "– Bestellt am (*)/erhalten am (*): ______________________________________________",
    "– Name des/der Verbraucher(s): ______________________________________________",
    "– Anschrift des/der Verbraucher(s): ______________________________________________",
    "– Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): ______________________________________________",
    "– Datum: ______________________________________________",
    "(*) Unzutreffendes streichen.",
    "Bezeichnen Sie den Gutschein oder die 5er-/10er-Karte möglichst genau, beispielsweise durch Wert, Massageart und Dauer. Eine Bestellnummer können Sie ergänzen, falls vorhanden; sie ist keine Voraussetzung. Für einen Widerruf per E-Mail ist keine Unterschrift erforderlich; eine eindeutige Erklärung ohne dieses Formular genügt.",
  ],
};

/** Imported existing website text. Pending explicit release for online order documents. */
const v20261101: LegalTextVersion = {
  version: '2026-11-01-review',
  released: false,
  agb: [
  {
    "title": "1. Anbieter und Geltungsbereich",
    "paragraphs": [
      "Anbieter ist Jirayut Rudklang, tätig unter Royal Krabi Serenity Thaimassage, Offenbacher Str. 32, 63075 Offenbach am Main, Deutschland.",
      "Telefon: 069 60511884 E-Mail: kontakt@royalkrabi-thaimassage.de",
      "Diese allgemeinen Geschäftsbedingungen betreffen die vereinbarten Wellnessmassagen, bezahlte Gutscheine sowie vorausbezahlte 5er- und 10er-Mehrfachkarten, soweit sie wirksam in den jeweiligen Vertrag einbezogen wurden. Individuell getroffene Vereinbarungen haben Vorrang.",
      "Unsere Massagen dienen der Entspannung und dem allgemeinen Wohlbefinden. Sie sind keine medizinischen Leistungen und ersetzen keine ärztliche Untersuchung, Diagnose oder Therapie. Ein bestimmter gesundheitlicher Erfolg wird nicht zugesagt."
    ]
  },
  {
    "title": "2. Terminvereinbarung, Leistungsumfang und Preise",
    "paragraphs": [
      "Massagen erfolgen nach vorheriger Terminvereinbarung. Terminanfragen sind telefonisch oder per E-Mail möglich. Eine Anfrage allein ist noch keine Terminbestätigung. Ein Termin ist verbindlich vereinbart, sobald wir ihn telefonisch oder schriftlich bestätigt haben.",
      "Die Website bietet keine automatische Onlinebuchung, keinen Onlinekauf und keine Onlinezahlung an. Die Kontaktbuttons öffnen einen Telefonanruf oder eine vorbereitete Nachricht im eigenen E-Mail-Programm; eine solche vorbereitete Nachricht wird nicht automatisch versendet.",
      "Für die Massage gelten die bei Vertragsschluss vereinbarten Preise, die vereinbarte Massageart und die vereinbarte Dauer. Für Gutscheine und Mehrfachkarten gelten der jeweils vereinbarte Umfang und Kaufpreis. Die konkret angebotene Zahlungsweise wird vor Vertragsschluss mitgeteilt."
    ]
  },
  {
    "title": "3. Gesundheitliche Hinweise und sichere Durchführung",
    "paragraphs": [
      "Bitte informieren Sie uns vor Beginn über bekannte Umstände, die für eine sichere Durchführung der vereinbarten Massage relevant sein können. Dazu gehören insbesondere Schwangerschaft, akute Beschwerden, Verletzungen, kürzlich erfolgte Operationen sowie relevante Unverträglichkeiten gegenüber verwendeten Produkten. Eine pauschale Offenlegung sämtlicher Diagnosen wird nicht verlangt.",
      "Bei Unsicherheit über die gesundheitliche Eignung lassen Sie diese bitte vorab ärztlich abklären. Aus Sicherheitsgründen kann eine Massage nach Rücksprache angepasst, abgelehnt oder abgebrochen werden.",
      "Eine Anpassung, Ablehnung oder ein Abbruch begründet nicht automatisch eine Pflicht zur Zahlung des vollständigen Preises. Ob und in welcher Höhe Ansprüche bestehen, richtet sich nach der konkreten Situation und den gesetzlichen Voraussetzungen. Unsere eigene gesetzliche Haftung wird durch diese Hinweise nicht ausgeschlossen oder eingeschränkt."
    ]
  },
  {
    "title": "4. Terminabsagen, Umbuchungen und Nichterscheinen",
    "paragraphs": [
      "Bitte informieren Sie uns möglichst frühzeitig, wenn Sie einen Termin absagen oder verschieben möchten. Absagen können telefonisch, per E-Mail oder persönlich erfolgen. Maßgeblich ist der Zugang der Absage bei uns, nicht allein der Zeitpunkt ihres Absendens.",
      "Eine Umbuchung setzt eine Vereinbarung über den neuen Termin voraus. Aus einer Anfrage zur Umbuchung folgt weder automatisch eine Bestätigung des neuen Termins noch eine Befreiung von gegebenenfalls gesetzlich bestehenden Ansprüchen aus dem bisherigen Termin.",
      "Für Absagen und Nichterscheinen wird keine prozentuale Ausfallpauschale vereinbart. Etwaige Ansprüche richten sich nach den gesetzlichen Voraussetzungen im konkreten Fall. Eine anderweitige Vergabe des Termins und ersparte Aufwendungen sind nach Maßgabe des Gesetzes zu berücksichtigen. Es besteht keine automatische, ausnahmslose Pflicht zur Zahlung des gesamten Massagepreises.",
      "Eine Ausfallforderung darf nicht zusätzlich durch vollständige Entwertung derselben vorausbezahlten Massage oder eines Gutscheins doppelt berechnet werden. Ein pauschales Recht, Ausfallforderungen ungeprüft von vorhandenem Guthaben abzuziehen, besteht nicht."
    ]
  },
  {
    "title": "5. Verspätung und Absage durch das Studio",
    "paragraphs": [
      "Bei verspätetem Erscheinen kann sich die Massage verkürzen, wenn andernfalls nachfolgende Termine beeinträchtigt würden. Daraus ergibt sich nicht automatisch eine pauschale finanzielle Folge; maßgeblich bleiben die konkrete Situation und die gesetzlichen Voraussetzungen.",
      "Sagen wir einen Termin ab, bieten wir nach Möglichkeit einen Ersatztermin an. Für eine von uns nicht erbrachte Massage wird keine Massage aus einer Mehrfachkarte abgezogen. Gesetzliche Erstattungsrechte bleiben unberührt."
    ]
  },
  {
    "title": "6. Bezahlte Wertgutscheine",
    "paragraphs": [
      "Bezahlte Wertgutscheine können bis zur Höhe ihres verfügbaren Guthabens eingelöst werden. Teileinlösungen sind möglich; verbleibendes Restguthaben bleibt bestehen.",
      "Eine freiwillige Barauszahlung des Gutscheinwertes oder des Restguthabens ist nicht vorgesehen. Gesetzliche Widerrufs-, Rücktritts- und sonstige Rückzahlungsansprüche bleiben ausdrücklich unberührt.",
      "Für Ansprüche aus normalen bezahlten Wertgutscheinen gelten grundsätzlich die gesetzlichen Verjährungsregeln. Die regelmäßige Verjährungsfrist beträgt drei Jahre. Sie beginnt grundsätzlich mit dem Schluss des Jahres, in dem der Anspruch entstanden ist und die weiteren Voraussetzungen des § 199 Absatz 1 BGB erfüllt sind. Entsteht der Anspruch beispielsweise 2026 und liegen die weiteren Voraussetzungen in diesem Jahr vor, läuft die regelmäßige Frist grundsätzlich bis zum Ende des 31. Dezember 2029. Gesetzliche Regelungen etwa zur Hemmung oder zum Neubeginn können den Ablauf beeinflussen.",
      "Die Verjährung ist kein automatisches Löschen des Guthabens: Nach Eintritt der Verjährung kann die Leistung nach Maßgabe des Gesetzes verweigert werden. Eine eigenständige verkürzte Verfallsfrist von zwölf Monaten wird nicht vereinbart."
    ]
  },
  {
    "title": "7. Vorausbezahlte 5er- und 10er-Mehrfachkarten",
    "paragraphs": [
      "Die Bezeichnungen „5er-Abo“ und „10er-Abo“ meinen vorausbezahlte Mehrfachkarten. Eine 5er-Karte umfasst fünf, eine 10er-Karte zehn Massagen der jeweils vereinbarten Art und Dauer. Es gibt keine automatische Verlängerung und keinen laufenden Zahlungsvertrag.",
      "Massageart und Dauer werden beim Kauf vereinbart. Eine Änderung bedarf einer vorherigen Vereinbarung; ein dabei entstehender Preisunterschied kann ebenfalls vereinbart werden. Paarmassagen sind nicht Bestandteil dieser Einzel-Mehrfachkarten.",
      "Jede tatsächlich erbrachte Massage wird vom verbleibenden Kontingent abgezogen. Nicht erbrachte Massagen werden nicht allein deshalb abgezogen, weil das Studio einen Termin absagt. Die Regelungen zu Absagen in Abschnitt 4 bleiben zu beachten; eine doppelte Berechnung ist ausgeschlossen.",
      "Mehrfachkarten sind nicht mit anderen Rabatten oder Sonderangeboten kombinierbar, sofern nicht ausdrücklich etwas anderes vereinbart wird. Ob über Mehrfachkarten bezahlte Besuche Treuepass-Stempel erhalten, ist damit noch nicht entschieden.",
      "Es werden keine verkürzte Einlösefrist und keine Nichtübertragbarkeit vereinbart. Ein automatischer ersatzloser Verfall vorausbezahlter Massagen findet nicht statt. Eine freiwillige Auszahlung verbleibender Massagen ist nicht vorgesehen; gesetzliche Beendigungs- und Rückzahlungsrechte bleiben unberührt."
    ]
  },
  {
    "title": "8. Zahlung, Postversand und Abholung von Gutscheinen und Mehrfachkarten",
    "paragraphs": [
      "Gutscheine und Mehrfachkarten werden ausschließlich innerhalb Deutschlands mit DHL versendet. Der Versand ist kostenfrei, ohne Mindestbestellmenge und ohne Mindestbestellwert. Nach Prüfung des vollständigen Zahlungseingangs geben wir Ihre Bestellung in der Regel innerhalb von drei Werktagen bei DHL ein oder stellen sie zur vereinbarten Abholung bereit. Werktage im Sinne dieser Bearbeitungsfrist sind Montag bis Freitag, ausgenommen gesetzliche Feiertage am Betriebsort.",
      "Die Postlaufzeit kommt hinzu. Eine Zustellung innerhalb von drei Tagen wird nicht zugesagt. Eine Abholung vor Ort wird vorher abgestimmt; die Definition der Bearbeitungsfrist bedeutet nicht, dass das Studio montags für eine Abholung geöffnet ist.",
      "Nach Übergabe an DHL ist ein Einlieferungsbeleg als Nachweis der Übergabe auf Anfrage erhältlich. Eine automatische Zusendung oder Sendungsverfolgung wird nicht zugesagt. Die gesetzlichen Rechte bei Verlust oder Beschädigung sowie Widerrufs- und Rückzahlungsrechte bleiben unberührt; für den kostenfreien Standardversand wurden keine Lieferkosten vom Kunden gezahlt.",
      "Die tatsächlich verfügbaren Zahlungswege werden vor Vertragsschluss vereinbart. Eine automatische digitale Zustellung, Onlinezahlung oder digitale Gutscheincode-Verwaltung wird derzeit nicht angeboten. Bestellanfragen werden erst durch unsere ausdrückliche manuelle Annahme angenommen."
    ]
  },
  {
    "title": "9. Royal Paarmassage und Premium-Upgrades",
    "paragraphs": [
      "Die klassische Royal Paarmassage ist das Standardangebot. Premium-Upgrades können freiwillig gegen Aufpreis vereinbart werden.",
      "Jeder ausgewiesene Upgrade-Aufpreis gilt PRO PERSON zusätzlich zum Paarmassage-Grundpreis. Wenn beide Personen ein Upgrade wählen, werden die jeweiligen Aufpreise für beide Personen berechnet.",
      "Upgrade-Wünsche können telefonisch, per E-Mail oder persönlich vor Ort mitgeteilt werden. Ein Upgrade unmittelbar vor Beginn ist von der Verfügbarkeit abhängig. Massageart und Aufpreis werden vor Beginn vereinbart. Es gelten ausschließlich die tatsächlich vereinbarten Preise und Aufpreise."
    ]
  },
  {
    "title": "10. Royal Krabi Treuepass",
    "paragraphs": [
      "Für jeden Besuch mit einer tatsächlich in Anspruch genommenen Massage von mindestens 60 Minuten erhält der Kunde einen Stempel. Pro entsprechendem Besuch wird ein Stempel vergeben; eine längere Massage führt nicht zu mehreren Stempeln.",
      "Nach zehn qualifizierenden Besuchen erhält der Kunde einmalig 50 % Rabatt auf die nächste Massage. Die Massageart ist grundsätzlich frei wählbar. Bei Einlösung werden die zehn Stempel entwertet.",
      "Die freie Wahl der Massage umfasst grundsätzlich auch Premium- und Signature-Massagen."
    ]
  },
  {
    "title": "11. Widerruf und gesetzliche Verbraucherrechte",
    "paragraphs": [
      "Gesetzliche Widerrufsrechte sind von vertraglichen Terminabsagefristen zu unterscheiden. Bei Verträgen, die ausschließlich über Fernkommunikationsmittel oder außerhalb der Geschäftsräume geschlossen werden, kann Verbrauchern unter den jeweiligen gesetzlichen Voraussetzungen ein Widerrufsrecht zustehen. Nicht jede telefonische oder per E-Mail geführte Anfrage begründet für sich allein einen Fernabsatzvertrag.",
      "Eine pauschale Ausnahme vom Widerrufsrecht für sämtliche Massagen, Gutscheine oder Mehrfachkarten wird nicht vereinbart. Soweit gesetzlich erforderlich, sind vor Vertragsschluss eine zum tatsächlichen Verkaufsablauf passende Widerrufsbelehrung und ein Muster-Widerrufsformular gesondert bereitzustellen. Dieser Abschnitt ersetzt diese Dokumente nicht.",
      "Gesetzliche Gewährleistungs-, Haftungs-, Beendigungs- und Rückzahlungsrechte bleiben unberührt. Diese AGB enthalten keinen pauschalen Haftungsausschluss, keine besondere Gerichtsstandsvereinbarung für Verbraucher und keine automatische Ersetzung unwirksamer Klauseln durch wirtschaftlich ähnliche Regelungen."
    ]
  }
],
  widerruf: [
    { title: 'Geltungsbereich', paragraphs: ["Über diese Website sind derzeit kein Onlinekauf und keine Onlinezahlung möglich. Gutscheine und Mehrfachkarten erhalten Sie nach telefonischer, schriftlicher oder persönlicher Absprache.", "Die folgende Belehrung ist für den Kauf von Gutscheinen sowie vorausbezahlten 5er- und 10er-Massagekarten durch Verbraucher über unsere Website vorgesehen, soweit der jeweilige Vertrag als Dienstleistungsvertrag einzuordnen ist und ein gesetzliches Widerrufsrecht besteht. Vor Einführung eines Onlineverkaufs wird sie auf den konkreten Verkaufsablauf und die jeweilige Gutschein- oder Kartenart abgestimmt.", "Die als „Abos“ bezeichneten Mehrfachkarten umfassen die vereinbarte Anzahl von Massagen; sie verlängern sich nicht automatisch und begründen keinen laufenden Zahlungsvertrag.", "Diese Seite regelt nicht die Absage oder Umbuchung einzelner Massagetermine. Die hierzu vereinbarten Regelungen finden Sie in den AGB. Andere zwingende gesetzliche Widerrufsrechte werden durch diese Eingrenzung nicht ausgeschlossen oder eingeschränkt."] },
    ...v20261021.widerruf.slice(1),
  ],
  widerrufForm: [...v20261021.widerrufForm],
  datenschutz: [
  {
    "title": "1. Verantwortliche Stelle",
    "paragraphs": [
      "Jirayut Rudklang Royal Krabi Serenity Thaimassage Offenbacher Str. 32 63075 Offenbach am Main Deutschland Telefon: 069 60511884 E-Mail: kontakt@royalkrabi-thaimassage.de"
    ]
  },
  {
    "title": "2. Hosting der Website",
    "paragraphs": [
      "Für die Bereitstellung dieser Website ist der Dienst Lovable vorgesehen. Beim Aufruf der Website werden technisch notwendige Daten (z. B. IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Browserinformationen) durch diesen Dienst verarbeitet, um die Website auszuliefern. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer sicheren und zuverlässigen Bereitstellung).",
      "Die Domain, die DNS-Verwaltung und unser E-Mail-Postfach werden über IONOS betrieben. Die Website selbst wird nicht bei IONOS gehostet. Lovable Cloud ist für die künftige Speicherung von Bestellanfragen eingerichtet. Das Bestellformular übermittelt derzeit keine Angaben; Kundenkonten werden nicht angeboten."
    ]
  },
  {
    "title": "3. Server-Logfiles",
    "paragraphs": [
      "Beim Besuch der Website können automatisch Informationen erfasst werden, die Ihr Browser übermittelt, z. B. IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene Seite, Referrer-URL, Browsertyp und Betriebssystem. Diese Daten dienen der Sicherstellung eines störungsfreien Betriebs."
    ]
  },
  {
    "title": "4. Kontaktaufnahme per Telefon und E-Mail",
    "paragraphs": [
      "Termine vereinbaren Sie telefonisch oder per E-Mail. Die Schaltflächen „Termin per E-Mail anfragen“ öffnen lediglich Ihr eigenes E-Mail-Programm; die Website selbst versendet oder speichert keine Formularanfragen. Ihre Angaben (z. B. Name, Telefonnummer, E-Mail-Adresse, Terminwunsch) verarbeiten wir zur Bearbeitung Ihrer Anfrage. E-Mails gehen in unserem bei IONOS betriebenen Postfach ein. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO bei vertragsbezogenen Anfragen bzw. lit. f DSGVO bei sonstigen Anfragen. Es gibt keinen Online-Buchungskalender, keine Kundenkonten und keine Online-Zahlung."
    ]
  },
  {
    "title": "5. Umgang mit Anfragen und Kundendaten",
    "paragraphs": [
      "Ihre Daten werden nur so lange gespeichert, wie es für die Bearbeitung Ihrer Anfrage und die Durchführung des Termins erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen."
    ]
  },
  {
    "title": "6. Cookies und lokale Speicherungen",
    "paragraphs": [
      "Die Website speichert Ihre Auswahl in den Datenschutzeinstellungen lokal in Ihrem Browser unter „rk-privacy-consent“. Dies ist für die Beachtung Ihrer Auswahl technisch erforderlich (§ 25 Abs. 2 TDDDG). Weitere Cookies oder Speicherungen setzt die Website selbst nicht. Erst wenn Sie dem Live-Chat zustimmen, kann Tidio eigene Cookies oder lokale Speicherungen anlegen. Ihre Auswahl können Sie jederzeit über „Datenschutzeinstellungen“ im Footer ändern."
    ]
  },
  {
    "title": "7. Externe Inhalte und eingebettete Dienste",
    "paragraphs": [
      "Live-Chat (Tidio): Der Chat von Tidio wird nur geladen, wenn Sie in den Datenschutzeinstellungen ausdrücklich zustimmen oder den Button „Tidio-Chat aktivieren“ verwenden. Vorher wird keine Verbindung zu Tidio hergestellt. Nach Ihrer Zustimmung können insbesondere IP-Adresse, Browser- und Geräteinformationen, Nutzungsdaten sowie Ihre Chat-Nachrichten und freiwillig eingegebenen Kontaktdaten an Tidio übermittelt werden. Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG). Sie können die Einwilligung jederzeit mit Wirkung für die Zukunft in den Datenschutzeinstellungen widerrufen; dabei werden die im Browser zugänglichen Tidio-Speicherungen entfernt und die Seite neu geladen. Bereits übermittelte Daten werden dadurch nicht automatisch bei Tidio gelöscht.",
      "Schriftarten: Die verwendeten Schriftarten werden lokal von dieser Website bereitgestellt. Es wird dafür keine Verbindung zu Google hergestellt.",
      "Google Maps: Der Link „Route planen“ führt erst nach Ihrem Klick zu Google Maps. Eine Karte ist nicht in diese Website eingebettet. Auf der Zielseite gelten die Datenschutzbestimmungen von Google."
    ]
  },
  {
    "title": "8. Rechte betroffener Personen",
    "paragraphs": [
      "Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) sowie Widerspruch gegen die Verarbeitung (Art. 21 DSGVO). Erteilte Einwilligungen können Sie jederzeit mit Wirkung für die Zukunft widerrufen."
    ]
  },
  {
    "title": "9. Beschwerderecht bei einer Aufsichtsbehörde",
    "paragraphs": [
      "Sie haben gemäß Art. 77 DSGVO das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren, insbesondere in dem Mitgliedstaat Ihres gewöhnlichen Aufenthaltsorts, Ihres Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes. In Hessen können Sie sich an den Hessischen Beauftragten für Datenschutz und Informationsfreiheit wenden."
    ]
  },
  {
    "title": "10. Kontakt zum Datenschutz",
    "paragraphs": [
      "Für Fragen zum Datenschutz erreichen Sie uns unter kontakt@royalkrabi-thaimassage.de."
    ]
  }
],
};

const v20261102: LegalTextVersion = previousDraft;
const v20261102Confirmed: LegalTextVersion = {
  version: '2026-11-02-confirmed-review', released: true,
  agb: legalDraftAgb, widerruf: legalDraftWithdrawal, widerrufForm: legalDraftForm,
  // Privacy review is separate; retaining its previous draft never constitutes a release.
  ...(v20261101.datenschutz ? { datenschutz: structuredClone(v20261101.datenschutz) } : {}),
};
const LEGAL_VERSIONS: Record<string, LegalTextVersion> = { [v20261021.version]: v20261021, [v20261101.version]: v20261101, [v20261102.version]: v20261102, [v20261102Confirmed.version]: v20261102Confirmed };
export const CURRENT_LEGAL_VERSION = v20261021.version;
export const WEBSITE_LEGAL_VERSION = v20261102Confirmed.version;
/** Released by the operator on 02.11.2026 (AGB, Widerruf, Musterformular, Datenschutz). */
export const CURRENT_ORDER_LEGAL_VERSION: string | null = v20261102Confirmed.version;
export function legalTextsFor(version: string | null | undefined): LegalTextVersion {
  const entry = version ? LEGAL_VERSIONS[version] : undefined;
  if (!entry) throw new Error('Die gespeicherte Rechtstextfassung ist nicht verfügbar. Kein Versand mit Ersatztexten.');
  return structuredClone(entry);
}
export function orderLegalReleaseError(): string | null {
  if (!CURRENT_ORDER_LEGAL_VERSION) return 'Der Onlineverkauf ist noch nicht freigegeben. Die aktuellen Bestell- und Datenschutzinformationen werden noch geprüft.';
  const legal = legalTextsFor(CURRENT_ORDER_LEGAL_VERSION);
  return legal.released && legal.datenschutz?.length ? null : 'Die Bestellinformationen sind noch nicht freigegeben.';
}
