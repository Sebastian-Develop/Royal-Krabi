import { contractAcceptanceNotice, openingPaymentNotice, openingEligibilityNotice, massageVoucherPartialNotice, massageVoucherChangeNotice, priceIncreaseNotice, noCashPayoutNotice } from './purchase-rules';
export type Massage = { name: string; desc: string; prices: [number, number][]; category: "classic" | "premium" | "signature"; note?: string };
export const categoryBadges = { classic: "KLASSISCH", premium: "PREMIUM", signature: "ROYAL KRABI SIGNATURE" } as const;
export const partialBadge = "FOKUS";
export const pairBadge = "KLASSISCH · PREMIUM-OPTION";
export const upgradeBadge = "PREMIUM-OPTION";
/** Price note shown beneath price lists for massages, Royalpässe and massage vouchers (confirmed 19 % VAT rate). */
export const vatNotice = "Alle Preise verstehen sich inklusive 19 % MwSt.";
/** Cautious wording for the shared footer and for carts containing value vouchers: their tax treatment (Einzweck-/Mehrzweckgutschein) is not yet bindingly determined. */
export const vatNoticeCautious = "Alle Preise sind Endpreise. Bei umsatzsteuerpflichtigen Leistungen ist die gesetzliche Umsatzsteuer enthalten.";
export const massages: Massage[] = [
  { name: "Royal Thai Massage – ohne Öl", desc: "Traditionelle Thai-Massage mit gezielten Drucktechniken und Dehnbewegungen.", category: "classic", prices: [[60,59],[90,85],[120,109]] },
  { name: "Royal Thai Massage", desc: "Traditionelle Massagetechniken, durchgeführt mit Öl – das Öl ist im Preis enthalten.", category: "classic", prices: [[60,65],[90,92],[120,119]] },
  { name: "Relax-Massage mit Öl", desc: "Sanfte, fließende Massagegriffe für Ruhe, Entspannung und Wohlbefinden.", category: "classic", prices: [[60,65],[90,92],[120,119]] },
  { name: "Aromaöl-Massage", desc: "Eine wohltuende Massage mit aromatischen Ölen für ein entspannendes Massageerlebnis.", category: "premium", prices: [[60,69],[90,96],[120,125]] },
  { name: "Hot-Stone-Massage", desc: "Warme Steine und sanfte Massagegriffe verbinden sich zu einem besonderen Entspannungserlebnis.", category: "premium", prices: [[60,79],[90,109],[120,139]] },
  { name: "Thai-Kräuterstempelmassage", desc: "Warme Kräuterstempel und traditionelle Massagetechniken sorgen für ein angenehm wohltuendes Erlebnis.", category: "premium", prices: [[60,85],[90,115],[120,145]] },
  { name: "Royal Sound Healing – Royal Krabi Signature", desc: "Harmonische Klänge und sanfte Schwingungen laden zum Innehalten und Entspannen ein.", category: "signature", prices: [[90,119],[120,149]] },
  { name: "Kosmetische Lymphdrainage – Ganzkörper", desc: "Sanfte, rhythmische Massagegriffe für ein angenehmes und entspannendes Körpergefühl.", category: "premium", prices: [[60,79],[90,109],[120,139]], note: "Diese Massage dient dem Wohlbefinden und ersetzt keine medizinische oder therapeutische Versorgung." },
];

export const partialMassages = [
  { name: "Rückenmassage mit Öl", desc: "Gezielte, wohltuende Massagegriffe für den Rücken.", prices: [[30,39],[60,59]] },
  { name: "Nacken- und Schultermassage", desc: "Sanfte bis gezielte Massagegriffe für den Nacken- und Schulterbereich.", prices: [[30,39],[60,59]] },
  { name: "Kopfmassage", desc: "Eine entspannende Massage von Kopf und Kopfhaut zum Abschalten und Wohlfühlen.", prices: [[30,39],[60,59]] },
  { name: "Thai-Fußreflexzonenmassage", desc: "Traditionelle Fußmassage mit sanften Drucktechniken, inklusive Fußreinigung.", prices: [[30,43],[60,63]] },
];
export const pairPrices = [[60,129],[90,179],[120,229]] as const;
export const pairUpgrades = [
  { name: "Aromaöl-Massage", prices: [[60,5],[90,10],[120,15]] },
  { name: "Hot-Stone-Massage", prices: [[60,15],[90,20],[120,25]] },
  { name: "Thai-Kräuterstempelmassage", prices: [[60,20],[90,25],[120,30]] },
] satisfies { name: string; prices: [number, number][] }[];

export const perPersonLabel = "pro Person";

/** Category badge of a listed massage name; null when the name has no badge. */
export const categoryBadgeFor = (name: string) => {
  const massage = massages.find(m => m.name === name);
  if (massage) return categoryBadges[massage.category];
  if (partialMassages.some(m => m.name === name)) return partialBadge;
  return null;
};

/** Pair-upgrade surcharges always apply per person, never for the pair together. */
export const upgradePriceRows = (prices: [number, number][]) =>
  prices.map(([minutes, price]) => ({
    minutes,
    amount: `+${price} €`,
    perPerson: perPersonLabel,
  }));


export const vouchers = [
  ...partialMassages.filter(m => m.name !== "Thai-Fußreflexzonenmassage").slice(0,1).map(m => ["30 Minuten Teilkörpermassage nach Wahl", `${m.prices[0]?.[1]} €`, "Rücken, Nacken und Schultern oder Kopf"]),
  ...partialMassages.filter(m => m.name === "Thai-Fußreflexzonenmassage").map(m => [`30 Minuten ${m.name}`, `${m.prices[0]?.[1]} €`, "Inklusive Fußreinigung"]),
  ...massages.flatMap(m => { const price = m.prices.find(([minutes]) => minutes === 60); return price ? [[`60 Minuten ${m.name}`, `${price[1]} €`, ""]] : []; }),
  ["Individueller Wunschbetrag", "Frei wählbar", ""],
];

export type Subscription = { count: 5 | 10; name: string; duration: number; regular: number; price: number };
// Literal offer prices from the current list; regular totals follow the shared individual prices.
const subscriptionOffers: { name: string; prices: [number, number, number][] }[] = [
  { name: "Royal Thai Massage – ohne Öl", prices: [[60,280,531],[90,404,765],[120,518,981]] },
  { name: "Royal Thai Massage", prices: [[60,309,585],[90,437,828],[120,565,1071]] },
  { name: "Relax-Massage mit Öl", prices: [[60,309,585],[90,437,828],[120,565,1071]] },
  { name: "Aromaöl-Massage", prices: [[60,328,621],[90,456,864],[120,594,1125]] },
  { name: "Hot-Stone-Massage", prices: [[60,375,711],[90,518,981],[120,660,1251]] },
  { name: "Thai-Kräuterstempelmassage", prices: [[60,404,765],[90,546,1035],[120,689,1305]] },
  { name: "Royal Sound Healing – Royal Krabi Signature", prices: [[90,565,1071],[120,708,1341]] },
  { name: "Kosmetische Lymphdrainage – Ganzkörper", prices: [[60,375,711],[90,518,981],[120,660,1251]] },
  { name: "Rückenmassage mit Öl", prices: [[30,185,351],[60,280,531]] },
  { name: "Nacken- und Schultermassage", prices: [[30,185,351],[60,280,531]] },
  { name: "Kopfmassage", prices: [[30,185,351],[60,280,531]] },
  { name: "Thai-Fußreflexzonenmassage", prices: [[30,204,387],[60,299,567]] },
];
export const subscriptions: Subscription[] = subscriptionOffers.flatMap(offer => offer.prices.flatMap(([duration,five,ten]) => {
  const massage = [...massages, ...partialMassages].find(m => m.name === offer.name);
  const individual = massage?.prices.find(([minutes]) => minutes === duration)?.[1];
  if (individual === undefined) throw new Error(`Missing individual price: ${offer.name}, ${duration}`);
  return ([5,10] as const).map(count => ({ count, name: offer.name, duration, regular: individual * count, price: count === 5 ? five : ten }));
}));
export const subscriptionRules = { counts: [5,10], sameTypeAndDuration: true, pairIncluded: false, combinableByDefault: false } as const;
export const subscriptionConditions = [
  "Jeder 5er Royalpass umfasst fünf, jeder 10er Royalpass zehn Massagen derselben Massageart und Dauer; einmalige Vorauszahlung ohne automatische Verlängerung.",
  "Massageart und Massage-Dauer sind beim Kauf festgelegt. Ein Wechsel ist nur nach vorheriger Vereinbarung möglich; ein Preisunterschied kann berechnet werden.",
  "Paarmassagen sind nicht Bestandteil der Einzel-Royalpässe.",
  "Der Eröffnungsrabatt gilt für berechtigte Royalpässe ab 60 Minuten je Massage; mehrere Rabattaktionen werden nicht kombiniert.",
  "Termine erfolgen nach Vereinbarung.",
  priceIncreaseNotice,
  openingPaymentNotice,
  "Persönliche, nicht übertragbare Nutzung und gewünschte 12-/24-Monatslaufzeiten sind im AGB-Entwurf dargestellt und vor Freigabe rechtlich zu prüfen.",
];

export const faqs = [
  ["Wann kommt der Kaufvertrag zustande?", contractAcceptanceNotice + " Die Rechtstextfassung bleibt ein ungeprüfter Entwurf; der Website-Verkauf ist gesperrt."],
  ["Welcher Zeitpunkt gilt für den Eröffnungsrabatt?", openingPaymentNotice + " " + openingEligibilityNotice],
  ["Kann ich einen Massagegutschein teilweise einlösen?", massageVoucherPartialNotice + " Beispiel: Ein 90-Minuten-Massagegutschein wird zunächst für eine 60-Minuten-Massage genutzt. Es verbleiben 30 Minuten Guthaben, die später für dieselbe oder eine andere Massageart verwendet werden können. Preisunterschiede werden ausgeglichen."],
  ["Kann ich mit meinem Massagegutschein die Massageart wechseln?", massageVoucherChangeNotice],
  ["Was gilt bei einer Preiserhöhung nach dem Kauf?", priceIncreaseNotice + " Diese Regel ist Bestandteil des rechtlich zu prüfenden AGB-Entwurfs."],
  ["Werden Gutscheine oder Royalpässe in Bargeld ausgezahlt?", noCashPayoutNotice],
  ["Muss ich einen Termin vereinbaren?", "Ja. Massagen erfolgen ausschließlich nach vorheriger Terminvereinbarung – telefonisch unter 069 60511884 oder per E-Mail an kontakt@royalkrabi-thaimassage.de."],
  ["Was soll ich zur Massage mitbringen?", "Sie müssen nichts Besonderes mitbringen. Bequeme Kleidung und ein paar Minuten Zeit zum Ankommen genügen."],
  ["Kann ich Gutscheine verschenken?", "Massagegutscheine und Wertgutscheine sind als Geschenke übertragbar. Royalpässe sind dagegen persönlich und nicht übertragbar. Die Bedingungen stehen im noch nicht freigegebenen AGB-Entwurf."],
  ["Welche Online-Kaufwege sind vorgesehen?", "Massagegutscheine und Royalpässe: Website-Warenkorb mit SumUp Hosted Checkout. Wertgutschein · Wunschbetrag: ausschließlich externer SumUp-Gutscheinshop. Externe Käufe werden nicht in unsere Bestellverwaltung übernommen. Website-Verkauf bleibt bis zur Freigabe gesperrt."],
  ["Ist eine Paarmassage möglich?", "Ja, eine Paarmassage kann je nach Verfügbarkeit telefonisch oder per E-Mail angefragt werden."],
  ["Sind Massagen bei Beschwerden geeignet?", "Unsere Massagen dienen dem Wohlbefinden und der Entspannung. Bei akuten Beschwerden, Erkrankungen, Verletzungen oder Unsicherheiten sprechen Sie bitte vorher mit einer Ärztin oder einem Arzt. Bitte teilen Sie relevante Einschränkungen, Schwangerschaft und Unverträglichkeiten vorab sowie Schmerzen während der Massage unmittelbar mit."],
  ["Wie kann ich einen Termin absagen oder verschieben?", "Bitte kontaktieren Sie uns telefonisch oder per E-Mail. Der rechtlich zu prüfende AGB-Entwurf sieht kostenlose Absage oder Verschiebung bis spätestens fünf Stunden vorher und danach beziehungsweise bei Nichterscheinen eine 50-%-Ausfallpauschale vor. Kein doppelter Abzug; Nachweis eines fehlenden oder wesentlich geringeren Schadens bleibt möglich. Diese Regel ist noch nicht freigegeben."],
  ["Wie lange gelten Gutscheine und Royalpässe?", "Gewünscht sind 24 Monate für Massage- und Wertgutscheine, zwölf Monate für den 5er Royalpass und 24 Monate für den 10er Royalpass ab Zahlungseingang, online nach unabhängiger Verifizierung. Befristungen und Ablauf werden rechtlich geprüft; kein automatischer ersatzloser Verlust wird zugesagt. Maßgeblich sind erst später freigegebene AGB."],
  ["Kann ich einen SumUp-Gutscheincode online einlösen?", "Eine automatische Einlösung in unserem Website-Checkout ist nicht eingerichtet. Diese Möglichkeit wird getrennt geprüft. Für Wertguthaben sind Teileinlösung, Restguthaben und Zuzahlung vorgesehen; die externen Shopbedingungen müssen noch abgeglichen werden."],
  ["Wie sammle ich Treuestempel?", "Der Treuepass wird manuell geführt: unter 60 Minuten kein Stempel, 60 Minuten ein, 90 Minuten 1,5 und 120 Minuten zwei Stempel pro Person für tatsächlich durchgeführte Massagen, auch mit Gutscheinen, Royalpässen oder Aktionen. Zehn Stempel bringen 50 % auf die nächste Massage; überzählige bleiben erhalten. Paar-Anteile werden je Person berücksichtigt. Kein Kaufstempel und keine Kombination des Prämienrabatts mit einer weiteren Aktion."],
];