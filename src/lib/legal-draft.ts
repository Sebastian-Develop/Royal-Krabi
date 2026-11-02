import { contact, withdrawalEmail } from './contact';
import { sumupGiftCardUrl } from './value-voucher';
import { contractAcceptanceNotice, openingPaymentNotice, massageVoucherPartialNotice, massageVoucherChangeNotice, priceIncreaseNotice, noCashPayoutNotice, earlyStartDeclaration, earlyStartNotice } from './purchase-rules';

/** Business wishes for the unreleased 2 November draft, not live sales settings. */
export const draftBusinessRules = {
  voucherMonths: 24, fiveMonths: 12, tenMonths: 24,
  cancellationHours: 5, cancellationPercent: 50,
  rewardStamps: 10, rewardPercent: 50,
  stamps: { 60: 1, 90: 1.5, 120: 2 } as Record<number, number>,
  passesTransferable: false, vouchersTransferable: true,
} as const;
export const stampsForPerformedMassage = (minutes: number) => draftBusinessRules.stamps[minutes] ?? 0;
export function draftCancellationCents(priceCents: number, hoursBefore: number, noShow = false) {
  return !noShow && hoursBefore >= draftBusinessRules.cancellationHours ? 0 : Math.round(priceCents * draftBusinessRules.cancellationPercent / 100);
}
export function loyaltyReward(priceShareCents: number, stamps: number, minutes: number) {
  const eligible = stamps >= draftBusinessRules.rewardStamps;
  return { discountCents: eligible ? Math.round(priceShareCents * draftBusinessRules.rewardPercent / 100) : 0,
    remainingStamps: stamps - (eligible ? draftBusinessRules.rewardStamps : 0) + stampsForPerformedMassage(minutes) };
}
export const legalDraftNotice = 'ENTWURF · Fassung 02.11.2026. Nicht rechtlich freigegeben. Die folgenden Regelungen beschreiben den vorgesehenen Onlinevertrieb, nicht dessen Freischaltung. Onlineverkauf und Veröffentlichung bleiben gesperrt. Prüfpunkte sind ausdrücklich gekennzeichnet.';
export const draftIdentity = `${contact.owner}, tätig unter ${contact.name}, ${contact.street}, ${contact.city}, Deutschland. Telefon: ${contact.phone} – E-Mail: ${contact.email}.`;
export const legalDraftAgb = [
  { title: '1. Vertragspartner und Geltungsbereich', paragraphs: [
    `Vertragspartner für die von Royal Krabi angebotenen Massageleistungen und Produkte ist ${draftIdentity}`,
    'Diese AGB gelten, soweit wirksam vereinbart, für Wellnessmassagen im Studio, Massagegutscheine, Wertgutscheine und einmalig vorausbezahlte 5er und 10er Royalpässe. Onlinekauf und Kauf im Studio werden unterschieden. Individuelle Vereinbarungen haben Vorrang. Royalpässe sind keine automatisch verlängernden Abonnements.',
  ] },
  { title: '2. Onlinekauf, Zahlung und Vertragsschluss', paragraphs: [
    'Der vorgesehene Onlinevertrieb unterscheidet zwei Kaufwege: Massagegutscheine und Royalpässe werden über unseren Website-Warenkorb und SumUp Hosted Checkout gekauft. Die Bestellung wird übermittelt; danach erfolgt die direkte Onlinezahlung ohne manuelle Vorabfreigabe. Der Zahlungseingang wird unabhängig serverseitig geprüft. Die bloße Rückkehr von SumUp ist keine Zahlungsbestätigung.',
    `„Wertgutschein · Wunschbetrag“ wird ausschließlich über den externen Gutscheinshop ${sumupGiftCardUrl} angeboten. Betrag und Zahlung werden dort gewählt. Externe Käufe werden nicht automatisch in unsere Bestellverwaltung übernommen und lösen keine Bestell-E-Mails oder PDF-Anhänge unserer Website aus. Die konkreten Verkäufer-, Vertrags-, Zustellungs- und Einlösungsinformationen dieses Shops müssen vor einer Freigabe mit unseren Bedingungen abgeglichen werden; SumUp wird nicht allein wegen der Zahlungsabwicklung als Verkäufer der Massageleistung bezeichnet.`,
    contractAcceptanceNotice,
    'Bestätigte Regel (02.11.2026): Vor der verifizierten Zahlung wird keine E-Mail und keine Kundenbestätigung versendet – weder beim Ablegen im Warenkorb, noch beim Absenden des Bestellformulars, bei Abbruch oder Fehlschlag der Zahlung. Erst nach unabhängig verifiziertem vollständigem Zahlungseingang geht automatisch eine einzige Bestätigungs-E-Mail. Sie enthält die Bestätigung des Zahlungseingangs, die ausdrückliche Annahme der Bestellung durch Royal Krabi, Bestellnummer und gekaufte Produkte, den Hinweis auf AGB und Widerrufsbelehrung sowie Informationen zu Versand oder Abholung. Rechtlich zu prüfen: Ob diese einzige Nachricht nach verifizierter Zahlung die gesetzliche Pflicht zur unverzüglichen elektronischen Bestätigung des Bestelleingangs erfüllt.',
    'Ein Kauf im Studio kommt durch die dort getroffene Vereinbarung zustande. Terminanfragen sind kein Produktkauf. Termine werden telefonisch oder per E-Mail vereinbart und erst durch unsere Bestätigung verbindlich; eine automatische Online-Terminbuchung gibt es nicht.',
  ] },
  { title: '3. Leistungen, Gesundheit und Mitwirkung', paragraphs: [
    'Unsere Wellness- und Entspannungsmassagen dienen dem Wohlbefinden. Sie sind keine medizinische Diagnose oder Heilversorgung und ersetzen keine ärztliche Untersuchung oder Therapie. Ein bestimmter gesundheitlicher Erfolg wird nicht garantiert.',
    'Bitte teilen Sie vor Beginn bekannte, für eine sichere Massage relevante Einschränkungen, Verletzungen, Schwangerschaften und Unverträglichkeiten mit. Eine pauschale Offenlegung sämtlicher Diagnosen wird nicht verlangt. Bei gesundheitlichen Zweifeln empfehlen wir eine vorherige ärztliche Abklärung. Schmerzen oder Beschwerden während der Massage teilen Sie bitte unmittelbar mit.',
    'Bei ungeklärten Risiken kann eine Massage nach Rücksprache angepasst, abgelehnt oder abgebrochen werden. Hierdurch entsteht nicht automatisch eine Pflicht zur Zahlung des vollständigen Preises. Gesetzliche Ansprüche und unsere Verantwortung bleiben unberührt; sämtliche Risiken werden nicht auf den Kunden übertragen.',
  ] },
  { title: '4. Preise und Zahlung', paragraphs: [
    'Es gelten die bei Vertragsschluss ausgewiesenen und vereinbarten Bruttopreise sowie die ausgewählte Massageart und Dauer. Für Royalpässe gilt der ausgewiesene Paketpreis. Es werden keine zusätzlichen Gebühren oder Mindestbestellwerte vereinbart. Die im jeweiligen Kaufweg tatsächlich verfügbaren Zahlungsarten werden vor Abschluss angezeigt; die Website-Zahlung erfolgt über SumUp Hosted Checkout, die externe Wertgutscheinzahlung über den SumUp-Gutscheinshop.',
    'Für Massageleistungen, Massagegutscheine und Royalpässe lautet der bestätigte Preishinweis: Alle Preise verstehen sich inklusive 19 % MwSt. Die steuerliche Einordnung individueller Wertgutscheine ist noch zu klären. Hier gilt die vorsichtige Information: Alle Preise sind Endpreise. Bei umsatzsteuerpflichtigen Leistungen ist die gesetzliche Umsatzsteuer enthalten. Eine ungesicherte 19-%-Berechnung für Wertgutscheine wird nicht zugesagt.',
    'Eine Website-Bestellung gilt erst nach unabhängig verifiziertem vollständigem Zahlungseingang als bezahlt. Dies ist von der Vertragsannahme gemäß Abschnitt 2 zu unterscheiden. Bei Käufen im Studio ist die dort vereinbarte Zahlung maßgeblich.',
  ] },
  { title: '5. Lieferung und Abholung', paragraphs: [
    'Für Massagegutscheine und Royalpässe aus unserem Website-Warenkorb gilt: kostenfreier DHL-Versand innerhalb Deutschlands ohne Mindestbestellwert. Die Übergabe an DHL erfolgt in der Regel innerhalb von drei Werktagen nach bestätigt verifiziertem vollständigem Zahlungseingang. Werktage sind Montag bis Freitag, ausgenommen gesetzliche Feiertage am Betriebsort. Die zusätzliche DHL-Laufzeit kommt hinzu; eine feste Zustellzeit wird nicht garantiert.',
    'Abholung erfolgt nach Vereinbarung. Ein Einlieferungsbeleg ist auf Anfrage erhältlich. Eine automatische Sendungsverfolgung, digitale Gutscheinausgabe oder Versandnachricht wird nicht zugesagt. Gesetzliche Rechte bei Verlust oder Beschädigung bleiben unberührt.',
    'Diese Postversandregel wird nicht auf externe SumUp-Wertgutscheinkäufe übertragen. Für diese sind die tatsächlich vor dem externen Kauf angegebenen Zustellungsinformationen maßgeblich. Die konkrete Zustellung konnte nicht bestätigt werden; der Abgleich ist vor Freigabe erforderlich.',
  ] },
  { title: '6. Massagegutscheine und Wertgutscheine', paragraphs: [
    'Massagegutscheine beziehen sich auf die beim Kauf bezeichnete Massage und Dauer. Wertgutscheine beziehen sich auf einen Geldbetrag und können für jede angebotene Massage verwendet werden. Übersteigt der Massagepreis das verfügbare Guthaben, ist die Differenz zu zahlen; bei einem niedrigeren Massagepreis bleibt das Restguthaben erhalten. Eine automatische Online-Einlösung von SumUp-Gutscheincodes in unserem Website-Checkout wird nicht angeboten.',
    'Massagegutscheine und Wertgutscheine können als Geschenke übertragen werden. Die Übertragung oder der bloße Kauf begründen keinen zusätzlichen Rabatt, keine Treuestempel und keine weitere Vergünstigung. Stempel werden nur für tatsächlich durchgeführte Massagen gemäß Abschnitt 10 vergeben.',
    'Gewünschte Gültigkeitsregel – rechtlich zu prüfen, noch nicht freigegeben: Massagegutscheine und Wertgutscheine sollen 24 Monate ab verifiziertem Zahlungseingang gelten. Für externe Wertgutscheine müssen diese Informationen vor Kauf auch im SumUp-Shop übereinstimmend angegeben sein. Die Befristung, Ausnahmen und Folgen des Ablaufs sind rechtlich zu prüfen. Es wird kein automatischer ersatzloser Guthabenverlust vereinbart. Gesetzliche Verjährungs-, Erstattungs- und sonstige Ansprüche bleiben unberührt.',
    massageVoucherPartialNotice,
    massageVoucherChangeNotice,
    priceIncreaseNotice,
    noCashPayoutNotice,
  ] },
  { title: '7. 5er Royalpass und 10er Royalpass', paragraphs: [
    priceIncreaseNotice,
    'Der 5er Royalpass umfasst fünf, der 10er Royalpass zehn Massagen der beim Kauf ausgewählten Art und Dauer gegen einmalige Vorauszahlung. Es gibt keine automatische Verlängerung und keinen laufenden Zahlungsvertrag. Ein Wechsel von Massageart oder Dauer erfordert eine vorherige Vereinbarung; ein dabei entstehender Preisunterschied kann vereinbart werden. Paarmassagen sind nicht Bestandteil dieser Einzel-Royalpässe.',
    'Royalpässe sind persönlich und nicht übertragbar. Sie dürfen ausschließlich von der Person verwendet werden, auf deren Namen sie ausgestellt sind. Verkauf, Weitergabe oder Übertragung sind ausgeschlossen. Die rechtliche Angemessenheit dieser Beschränkung ist vor Freigabe zu prüfen.',
    'Gewünschte Gültigkeitsregeln – rechtlich zu prüfen, noch nicht freigegeben: 5er Royalpass zwölf Monate, 10er Royalpass 24 Monate ab Zahlungseingang; bei Website-Zahlung ist dessen unabhängige Verifizierung maßgeblich. Die Befristungen und Folgen des Ablaufs einschließlich angemessener Ausnahmen bedürfen der rechtlichen Prüfung. Ein automatischer vollständiger Guthabenverlust wird nicht vereinbart.',
    'Nur tatsächlich erbrachte Massagen werden vom Kontingent abgezogen. Eine Absage durch das Studio verbraucht keine Massage. Bei Kundenabsagen gilt Abschnitt 9 ohne doppelte Belastung und ohne pauschalen vollständigen Kontingentabzug. Gesetzliche Widerrufs-, Beendigungs- und Erstattungsrechte bleiben erhalten.',
    noCashPayoutNotice,
  ] },
  { title: '8. Neueröffnungsaktion und Rabatte', paragraphs: [
    'Code ROYALKRABI20: vom 07.11. bis einschließlich 21.11.2026, Zeitzone Europe/Berlin, 20 % auf berechtigte Massageangebote ab 60 Minuten, Massagegutscheine mit festgelegter Dauer ab 60 Minuten und 5er/10er Royalpässe ab 60 Minuten je Massage. Berechnungsbasis ist der ausgewiesene Verkaufs- beziehungsweise Paketpreis. Der Rabattcode ROYALKRABI20 gilt ausschließlich für Bestellungen, deren verifizierter vollständiger Zahlungseingang vom 07.11.2026, 00:00 Uhr bis einschließlich 21.11.2026, 23:59 Uhr (Europe/Berlin) erfolgt. Vor dem 07.11.2026 und ab dem 22.11.2026 gilt der normale Preis. Der im Warenkorb angezeigte Rabatt ist eine vorläufige Vorkalkulation und wird erst bei verifiziertem Zahlungseingang verbindlich geprüft.',
    'Nicht berechtigt sind Angebote unter 60 Minuten und Wertgutscheine mit individuellem Wunschbetrag ohne festgelegte Dauer. Keine Kombination mehrerer Rabattaktionen oder mit dem 50-%-Treuepassrabatt auf dieselbe Massage. Wertguthaben ist ein Zahlungsmittel und nicht selbst ein zusätzlicher Rabatt; es kann den nach einem zulässigen Rabatt verbleibenden Betrag begleichen.',
    openingPaymentNotice,
  ] },
  { title: '9. Termine, Absagen und Nichterscheinen – rechtlich zu prüfender Entwurf', paragraphs: [
    'Termine können bis spätestens fünf Stunden vor dem vereinbarten Termin kostenlos abgesagt oder verschoben werden. Die Absage oder Verschiebung muss rechtzeitig über die angegebenen Kontaktmöglichkeiten bei Royal Krabi eingehen. Telefon und E-Mail finden Sie in Abschnitt 1; ein neuer Termin bedarf unserer Bestätigung.',
    'Bei Absage oder Terminverschiebung innerhalb von fünf Stunden vor dem vereinbarten Termin sowie bei Nichterscheinen ohne rechtzeitige Absage ist eine Ausfallpauschale von 50 % des vereinbarten Preises der gebuchten Massage vorgesehen. Diese Regel ist vor Anwendung rechtlich zu prüfen, insbesondere anhand des typischen tatsächlichen Ausfalls.',
    'Die Pauschale wird nicht zusätzlich zu einer bereits erbrachten Massage erhoben. Bereits bezahlte Beträge werden, soweit gesetzlich zulässig, angerechnet. Eine doppelte Belastung durch zusätzliche Entwertung eines Gutscheins, Abzug einer ganzen Royalpass-Massage oder erneute Berechnung derselben Leistung ist ausgeschlossen. Kein ungeprüfter automatischer Guthabenabzug wird vereinbart.',
    'Die Ausfallpauschale entfällt, wenn der Kunde nachweist, dass kein oder ein wesentlich geringerer Schaden entstanden ist. Ersparte Aufwendungen und eine anderweitige Vergabe sind nach den gesetzlichen Vorgaben zu berücksichtigen. Gesetzlicher Widerruf und Terminabsage sind voneinander zu unterscheiden.',
    'Bei Verspätung kann sich die Massage verkürzen, wenn sonst nachfolgende Termine beeinträchtigt würden; daraus folgt nicht automatisch eine pauschale finanzielle Konsequenz. Bei Studioabsage bieten wir nach Möglichkeit einen Ersatztermin an; gesetzliche Erstattungsrechte bleiben unberührt.',
  ] },
  { title: '10. Royal Krabi Treuepass – manuell geführt', paragraphs: [
    'Treuepässe werden manuell geführt. Für tatsächlich durchgeführte Massagen erhält jede Person: unter 60 Minuten keinen Stempel, bei 60 Minuten einen Stempel, bei 90 Minuten 1,5 Stempel und bei 120 Minuten zwei Stempel. Bei Paarmassagen wird diese Vergabe je Person getrennt auf dem persönlichen Treuepass vorgenommen.',
    'Stempel gibt es auch für tatsächlich durchgeführte Massagen aus Royalpässen, mit Gutscheinen und während Rabattaktionen. Der bloße Kauf erzeugt keine Stempel. Bitte legen Sie Ihren Treuepass zur Eintragung beziehungsweise vor Abrechnung zur Einlösung vor.',
    'Nach zehn Stempeln gibt es 50 % Rabatt auf die nächste Massage, unabhängig von Massageart und Dauer. Für eine Einzelmassage wird der reguläre Einzelpreis zugrunde gelegt. Für eine Paarmassage erhält jede berechtigte Person 50 % Rabatt auf den auf sie entfallenden Anteil. Bei Einlösung werden zehn Stempel abgezogen; überzählige Stempel bleiben erhalten. Auch die rabattierte Massage sammelt entsprechend ihrer Dauer Stempel, sofern sie mindestens 60 Minuten dauert.',
    'Bei einer Paarmassage können beide Personen ihren jeweils mit zehn Stempeln gefüllten Treuepass für dieselbe Paarmassage einlösen; dann wird jeder persönliche Anteil um 50 % reduziert. Hat nur eine Person zehn Stempel, erhält nur diese den Treuepassrabatt. Alternativ kann jede berechtigte Person ihren Pass für eine separat gebuchte Einzelmassage mit 50 % Rabatt auf deren regulären Einzelpreis einlösen.',
    'Der Prämienrabatt wird nicht mit einer anderen Rabattaktion auf dieselbe Massage kombiniert. Der Restbetrag kann mit Wertguthaben bezahlt werden. Es gibt keine SumUp- oder digitale Treueverwaltung.',
  ] },
  { title: '11. Royal Paarmassage und Premium-Upgrades', paragraphs: [
    'Die klassische Royal Paarmassage ist das Standardangebot. Premium-Upgrades können freiwillig gegen Aufpreis vereinbart werden. Jeder ausgewiesene Upgrade-Aufpreis gilt pro Person zusätzlich zum Paarmassage-Grundpreis. Wählen beide ein Upgrade, werden die jeweiligen Aufpreise für beide Personen berechnet.',
    'Upgrade-Wünsche können telefonisch, per E-Mail oder persönlich mitgeteilt werden. Ein Upgrade unmittelbar vor Beginn hängt von der Verfügbarkeit ab. Art und Aufpreis werden vor Beginn vereinbart; es gelten die bestätigten Preise.',
  ] },
  { title: '12. Gesetzliches Widerrufsrecht', paragraphs: [
    'Verbraucherinnen und Verbrauchern steht bei Vorliegen der gesetzlichen Voraussetzungen ein Widerrufsrecht zu. Einzelheiten, Fristbeginn, Rechtsfolgen und Hinweise zur vorzeitigen Inanspruchnahme enthält die separate Widerrufsbelehrung. Das Muster-Widerrufsformular kann verwendet werden, ist aber nicht zwingend. Beide Dokumente sind auf der Seite „Widerruf“ vor Abschluss einer Website-Bestellung zugänglich. Terminabsagen sind hiervon zu unterscheiden. Ein allgemeines gesetzliches 14-Tage-Widerrufsrecht für sämtliche Studiokäufe wird nicht zugesagt.',
  ] },
  { title: '13. Beschwerden und Haftung', paragraphs: [
    'Bitte teilen Sie Beschwerden während einer Massage möglichst sofort mit. Bei späteren Beschwerden bitten wir um möglichst zeitnahe Kontaktaufnahme. Diese Bitte begrenzt keine gesetzlichen Rechte. Vorhandene ärztliche Unterlagen können bei der Klärung helfen, sind aber keine pauschale Voraussetzung für Ansprüche.',
    'Es gelten die gesetzlichen Haftungsregeln. Insbesondere wird die zwingende Haftung für Verletzungen von Leben, Körper oder Gesundheit sowie für Vorsatz und grobe Fahrlässigkeit nicht ausgeschlossen. Es gibt keinen pauschalen Haftungsausschluss, keine vollständige Verlagerung auf eigenes Risiko und keine Verschiebung gesetzlicher Beweislastregeln zulasten der Kunden. Beschwerden und Haftung sind vom gesetzlichen Widerruf getrennt.',
  ] },
  { title: '14. Verbraucherstreitbeilegung und gesetzliche Rechte', paragraphs: [
    'Wir sind weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
    'Zwingende Verbraucher-, Gewährleistungs-, Widerrufs-, Beendigungs- und Rückzahlungsrechte bleiben unberührt.',
  ] },
];
export const legalDraftWithdrawal = [
  { title: 'Geltungsbereich und Einordnung – Entwurf', paragraphs: [
    'Diese separate Belehrung ist für Verbraucher beim Fernabsatzkauf von Massagegutscheinen, Wertgutscheinen und vorausbezahlten Royalpässen vorgesehen, soweit ein gesetzliches Widerrufsrecht besteht. Für den nachfolgenden Dienstleistungsentwurf wird ein Anspruch auf Massageleistungen beziehungsweise deren Einlösung zugrunde gelegt. Die endgültige produktbezogene Einordnung – insbesondere des externen Wertgutscheins – muss vor Freigabe rechtlich bestätigt werden.',
    'Bei Dienstleistungsverträgen beginnt die Frist mit Vertragsschluss, nicht automatisch mit Zahlung, Versand oder Erhalt einer Papierkarte. Falls ein konkretes Produkt rechtlich als Warenkauf einzuordnen ist, ist stattdessen die gesetzliche Warenbelehrung mit Fristbeginn beim Erhalt durch den Verbraucher oder einen benannten, nicht als Beförderer tätigen Dritten erforderlich. Dieser Einordnungsprüfpunkt ist noch offen; es werden keine widersprüchlichen Fristbeginne als endgültig behauptet.',
    'Die nachfolgenden Erklärungen richten sich an Royal Krabi für dessen Verträge. Verkäuferidentität, anwendbare Belehrung und Ausübungsmöglichkeiten im externen SumUp-Gutscheinshop sind vor Freigabe abzugleichen. Für reine Studiokäufe besteht nicht allgemein ein gesetzliches 14-Tage-Widerrufsrecht. Bei konkret terminierten Massagen sind mögliche gesetzliche Ausnahmen gesondert zu prüfen; sie werden nicht auf sämtliche Gutscheine oder Royalpässe übertragen.',
  ] },
  { title: 'Widerrufsrecht – Dienstleistungsentwurf', paragraphs: [
    'Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.',
    'Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses, soweit die gesetzlich erforderliche Belehrung ordnungsgemäß erteilt wurde. Bei fehlender oder fehlerhafter Belehrung gelten die gesetzlichen Regeln zum verlängerten Widerrufsrecht.',
    `Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (${contact.owner}, tätig unter ${contact.name}, ${contact.street}, ${contact.city}, Deutschland. Telefon: ${contact.phone} – E-Mail: ${withdrawalEmail}) mittels einer eindeutigen Erklärung, beispielsweise durch einen mit der Post versandten Brief oder eine E-Mail an ${withdrawalEmail}, über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das nachfolgende Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist. Ein Widerruf ist auch ohne Formular per E-Mail an ${withdrawalEmail} möglich.`,
    'Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.',
  ] },
  { title: 'Folgen des Widerrufs', paragraphs: [
    'Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme zusätzlicher Kosten für eine von Ihnen gewählte andere Lieferung als die von uns angebotene günstigste Standardlieferung), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf bei uns eingegangen ist. Für die Rückzahlung verwenden wir dasselbe Zahlungsmittel wie bei der ursprünglichen Transaktion, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart. In keinem Fall werden wegen dieser Rückzahlung Entgelte berechnet.',
    'Soweit Sie ausdrücklich verlangt haben, dass Dienstleistungen während der Widerrufsfrist beginnen, ist unter den gesetzlichen Voraussetzungen ein angemessener Betrag zu zahlen, der dem Anteil der bis zu Ihrer Widerrufsmitteilung bereits erbrachten Dienstleistungen im Vergleich zum Gesamtumfang entspricht. Dies setzt insbesondere die erforderliche vorherige Information und das ausdrückliche Verlangen voraus; bei außerhalb von Geschäftsräumen geschlossenen Verträgen ist das Verlangen auf einem dauerhaften Datenträger erforderlich. Ohne die gesetzlichen Voraussetzungen wird kein Wertersatz verlangt.',
  ] },
  { title: 'Vorzeitige Einlösung und ergänzende Klarstellungen', paragraphs: [
    'Ein Widerruf wird nicht pauschal auf unbenutzte Gutscheine oder Royalpässe begrenzt. Eine erste Teilmassage eines Royalpasses ist keine vollständige Vertragserfüllung. Das Zusenden einer Karte oder eines Gutscheincodes ist nicht automatisch die vollständige Erbringung der versprochenen Massageleistung.',
    'Bei entgeltlichen Dienstleistungen erlischt das Widerrufsrecht erst bei vollständiger Leistung und nur, wenn sämtliche gesetzlichen Voraussetzungen erfüllt sind, insbesondere die ausdrückliche Zustimmung zum Beginn vor Ablauf der Frist und die bestätigte Kenntnis vom Verlust des Widerrufsrechts bei vollständiger Vertragserfüllung. Die allgemeine AGB-Checkbox ersetzt diese Erklärungen nicht.',
    `Bestätigte Erklärung zum vorzeitigen Massagebeginn (02.11.2026): „${earlyStartDeclaration}“ ${earlyStartNotice} Die Dokumentation am Termin ist vor Freigabe noch einzurichten.`,
    'Es werden keine Widerrufs-, Storno- oder Bearbeitungsgebühren erhoben. Regeln über eine nicht freiwillig angebotene Barauszahlung begrenzen keine gesetzlichen Erstattungsrechte. Die Terminabsage gemäß AGB ist vom gesetzlichen Widerruf getrennt.',
  ] },
];
export const legalDraftForm = [
  '(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)',
  `An ${contact.owner}, tätig unter ${contact.name}, ${contact.street}, ${contact.city}, Deutschland. Telefon: ${contact.phone} – E-Mail: ${withdrawalEmail}.`,
  'Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*): ______________________________________________',
  'Bestellt am (*)/erhalten am (*): ______________________________________________',
  'Name des/der Verbraucher(s): ______________________________________________',
  'Anschrift des/der Verbraucher(s): ______________________________________________',
  'Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): ______________________________________________',
  'Datum: ______________________________________________',
  '(*) Unzutreffendes streichen.',
  'Bitte bezeichnen Sie das Produkt möglichst genau. Eine Bestellnummer ist hilfreich, aber keine Voraussetzung. Für einen Widerruf per E-Mail sind weder dieses Formular noch eine Unterschrift erforderlich.',
];
export const legalDraftReview = [
  { title: 'Noch zu bestätigende Geschäftsentscheidungen', paragraphs: [
    'Persönlichen Preisanteil bei unterschiedlichen Paar-Upgrades für die Treueprämie eindeutig zuordnen. Die bestätigten Regeln zu Vertragsannahme, Zahlungseingang für den Eröffnungsrabatt, Teileinlösung, Massageartwechsel und Preisänderungen sind keine offenen Geschäftsentscheidungen mehr.',
  ] },
  { title: 'Rechtliche Prüfpunkte vor Freigabe', paragraphs: [
    'Bestätigte Vertragsannahme nach verifiziertem vollständigem Zahlungseingang und anschließender Annahme; transparente Restdauer-/Restwertberechnung bei Teileinlösung und Massageartwechsel sowie Zuzahlung bei späteren Preiserhöhungen, auch für Royalpässe. Diese Geschäftsentscheidungen bleiben bestehen, ihre rechtliche Wirksamkeit und konkrete Einbeziehung sind zu prüfen.',
    '12-/24-Monatsbefristungen, angemessene Ausnahmen und Ablauf-/Restwertfolgen gegenüber gesetzlichen Verjährungs- und Erstattungsrechten; persönliche Nichtübertragbarkeit der Royalpässe; fünfstündige Absagegrenze und 50-%-Pauschale anhand typischer Schäden, Anrechnung und Ersatzbelegung.',
    'Produktbezogene Einordnung für Widerrufsfristbeginn und gegebenenfalls gesonderte Warenbelehrung; konkret terminierte Massagen und mögliche Ausnahmen; ausdrücklicher vorzeitiger Leistungsbeginn, gesetzlicher Wertersatz und Erlöschen bei vollständiger Leistung; steuerliche Einordnung der Wertgutscheine.',
    'Externer SumUp-Shop: angezeigter Verkäufer, anwendbare Vertragsinformationen, tatsächliche Zustellung, 24-Monatswunsch und Restguthaben-/Einlösungsregeln konnten für diesen Shop nicht bestätigt werden. Vor Freigabe anhand der tatsächlichen Kaufansicht abgleichen; keine deutschen Bedingungen aus ausländischen SumUp-Texten ableiten.',
  ] },
  { title: 'Technisch noch offen – keine Freischaltung', paragraphs: [
    'Bestätigt und umgesetzt (02.11.2026): Vor der verifizierten Zahlung gibt es keine Kundenkommunikation; die einzige Bestätigungs-E-Mail nach unabhängig verifiziertem vollständigem Zahlungseingang enthält die ausdrückliche Vertragsannahme. Rechtlich zu prüfen bleibt, ob diese einzige Nachricht die gesetzliche Eingangsbestätigungspflicht erfüllt. Namensbindung der persönlichen Royalpässe vor Kauf eindeutig erfassen und bei Einlösung sicherstellen.',
    'Bestätigt und umgesetzt (02.11.2026): Die verbindliche Rabattprüfung verwendet den serverseitigen Verifizierungszeitpunkt des vollständigen Zahlungseingangs, nicht den Bestellzeitpunkt. Warenkorb und Kasse zeigen eine vorläufige Vorkalkulation. Bei einem nach dem 21.11.2026, 23:59 Uhr verifizierten Zahlungseingang gilt der normale Preis. Rabattierte Zahlungsseiten verfallen spätestens mit Aktionsende; nach Aktionsende wird ausschließlich der normale Preis zur Zahlung angeboten. Kein Anspruch auf einen zuvor angezeigten rabattierten Betrag, keine Nachbelastung, keine Erstattung, keine manuelle Sonderprüfung.',
    `Elektronischer Widerruf per E-Mail an ${withdrawalEmail} ist bestätigt und in Belehrung, Musterformular und Bestätigungs-E-Mail hinterlegt; das PDF-Formular bleibt freiwillig. Offener Blocker: Der E-Mail-Empfang unter ${withdrawalEmail} ist in der aktuellen Umgebung nicht eingerichtet – das Postfach beziehungsweise eine Weiterleitung muss beim E-Mail-Anbieter der Domain geschaffen werden, sonst gehen Widerrufe ins Leere. Die Versandfunktion der Website kann keine eingehenden E-Mails empfangen.`,
    'Gesonderte Erklärungen für einen gewünschten vorzeitigen Leistungsbeginn fehlen. Seit 19.06.2026 verlangt § 356a BGB für über eine Online-Benutzeroberfläche geschlossene Fernabsatzverträge mit gesetzlichem Widerrufsrecht eine gut sichtbare, während der Widerrufsfrist durchgehend verfügbare Funktion „Vertrag widerrufen“ mit abschließendem „Widerruf bestätigen“. Sie muss Name, Vertrag oder Vertragsteil und elektronische Kontaktadresse erfassen und unverzüglich eine Bestätigung auf dauerhaftem Datenträger mit Inhalt, Eingangsdatum und Uhrzeit übermitteln. Diese Funktion fehlt hier und ist ein konkreter Blocker vor Verkaufsfreigabe; Druckformular und E-Mail-Link ersetzen sie nicht. Anschließend ist die Belehrung um Existenz und Ort der Funktion zu ergänzen.',
    'Offizielle Quellen (Stand 02.11.2026): § 356a BGB, https://www.gesetze-im-internet.de/bgb/__356a.html; Gesetz vom 03.02.2026, BGBl. 2026 I Nr. 28, Artikel 1 Nr. 8 und Artikel 10 Absatz 1, https://www.recht.bund.de/bgbl/1/2026/28/regelungstext.pdf; §§ 355, 356 und 357a BGB zu Fristbeginn, Erlöschen und Wertersatz, https://www.gesetze-im-internet.de/bgb/. Die Umsetzung im externen SumUp-Shop muss gesondert bestätigt werden.',
    'Automatische Online-Einlösung von SumUp-Gutscheincodes bleibt gesondert zu prüfen. Externe Käufe werden nicht importiert. Bestell-/Zahlungs-PDFs verweisen auf die AGB, deren eigene Fassung die gewünschten Laufzeiten vollständig enthält. Historische Bestellungen und Dokumentfassungen bleiben unverändert. Keine neue Bestellung und kein Dokumentversand mit dieser ungeprüften Fassung.',
  ] },
];