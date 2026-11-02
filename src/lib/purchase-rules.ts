/** Confirmed business decisions; not a legal release or a balance ledger. */
export const confirmedPurchaseRules = {
  contract: { requiresVerifiedFullPayment: true, requiresSubsequentAcceptance: true, receiptIsAcceptance: false, prePaymentCommunication: false, acceptanceChannel: 'payment_confirmation_email' },
  discount: { basis: 'verified_full_payment_receipt', code: 'ROYALKRABI20', percent: 20, minMinutes: 60, from: '2026-11-07', until: '2026-11-21', timezone: 'Europe/Berlin', valueVoucherEligible: false },
  massageVoucher: { partialDurations: [60, 90, 120], balanceBasis: 'unused_minutes', otherMassageAllowed: true, equalPriceSurcharge: 0, higherPriceDifferencePayable: true, lowerPriceBalanceRetained: true },
  priceIncrease: { appliesTo: ['fixed_massage_voucher', 'partial_massage_voucher_balance', 'five_royalpass', 'ten_royalpass'], currentPriceDifferencePayable: true },
  noCashPayout: { vouchers: true, royalPasses: true, statutoryRefundRightsUntouched: true },
} as const;
export const canAcceptPurchase = (verifiedFullPayment: boolean, subsequentlyAccepted: boolean) => verifiedFullPayment && subsequentlyAccepted;
export const canPartiallyRedeemMassageVoucher = (minutes: number) => confirmedPurchaseRules.massageVoucher.partialDurations.some(duration => duration === minutes);
export const priceIncreaseAppliesTo = (kind: string) => confirmedPurchaseRules.priceIncrease.appliesTo.some(product => product === kind);
/**
 * Bestätigt 02.11.2026: Vor der verifizierten Zahlung gibt es keinerlei Kundenkommunikation
 * (keine E-Mail bei Warenkorb, Bestellübermittlung, Abbruch oder Fehlschlag). Erst nach
 * unabhängig verifiziertem vollständigem Zahlungseingang geht automatisch eine einzige
 * Bestätigungs-E-Mail, die zugleich die ausdrückliche Annahme der Bestellung erklärt.
 */
export const contractAcceptanceNotice = 'Ein Kaufvertrag kommt zustande, sobald der vollständige Zahlungseingang unabhängig verifiziert wurde und Royal Krabi die Bestellung mit der anschließenden Bestätigungs-E-Mail ausdrücklich annimmt. Vor der verifizierten Zahlung werden keine E-Mails oder Bestätigungen versendet; Warenkorb, Bestellübermittlung sowie abgebrochene oder fehlgeschlagene Zahlungen lösen weder Kundenkommunikation noch einen Vertragsschluss aus.';
export const openingPaymentNotice = 'Der Rabattcode ROYALKRABI20 gilt ausschließlich für Bestellungen, deren verifizierter vollständiger Zahlungseingang vom 07.11.2026, 00:00 Uhr bis einschließlich 21.11.2026, 23:59 Uhr (Europe/Berlin) erfolgt. Vor dem 07.11.2026 und ab dem 22.11.2026 gilt der normale Preis. Der Rabatt wird im Warenkorb als vorläufige Vorkalkulation angezeigt und verbindlich erst bei verifiziertem Zahlungseingang geprüft.';
export const openingEligibilityNotice = 'ROYALKRABI20: 20 % auf berechtigte Massageangebote ab 60 Minuten, Massagegutscheine mit festgelegter Dauer ab 60 Minuten und 5er/10er Royalpässe ab 60 Minuten je Massage. Berechnungsbasis ist der ausgewiesene Verkaufs- beziehungsweise Paketpreis. Kein Eröffnungsrabatt auf Wertgutschein · Wunschbetrag.';
export const massageVoucherPartialNotice = 'Massagegutscheine mit einer Dauer von 60, 90 oder 120 Minuten können teilweise eingelöst werden. Der verbleibende Gutscheinwert entspricht der noch nicht in Anspruch genommenen Massagedauer und kann für eine weitere Massage derselben oder einer anderen Massageart verwendet werden.';
export const massageVoucherChangeNotice = 'Ein Wechsel zu einer anderen Massageart ist möglich. Bei gleicher Dauer und gleichem Preis erfolgt kein Aufschlag. Bei einem höheren Preis wird die Differenz zugezahlt. Bei einem geringeren Preis verbleibt der entsprechende Restwert auf dem Massagegutschein.';
export const priceIncreaseNotice = 'Bei einer Preiserhöhung nach Kauf wird bei Massagegutscheinen mit fester Dauer, Restguthaben aus teilweise eingelösten Massagegutscheinen sowie 5er und 10er Royalpässen die Differenz zum aktuell geltenden Preis zugezahlt.';
/** Bestätigt 02.11.2026: Restwerte werden grundsätzlich nicht in Bargeld ausgezahlt. */
export const noCashPayoutNotice = 'Massagegutscheine und Royalpässe werden nicht in Bargeld ausgezahlt. Bei teilweise eingelösten Massagegutscheinen verbleibt der Restwert als Gutscheinwert. Bei nicht vollständig genutzten Royalpässen verbleibt die Restbehandlung beziehungsweise das Restguthaben als Anspruch auf die vereinbarte Leistung. Eine Auszahlung des Restwerts in Geld ist ausgeschlossen. Gesetzliche Rückzahlungsansprüche bleiben unberührt.';
/**
 * Bestätigte Erklärung zum vorzeitigen Massagebeginn. Sie gehört NICHT in den Onlinekauf,
 * sondern wird beim konkreten Massage-Termin beziehungsweise vor Beginn der Massage
 * eingeholt und dokumentiert – für Massagegutscheine und Royalpässe, wenn die Massage
 * tatsächlich beginnt. Bei vollständiger Erbringung besteht kein Widerrufsrecht mehr.
 */
export const earlyStartDeclaration = 'Ich verlange ausdrücklich, dass die Massage vor Ablauf der Widerrufsfrist beginnt. Mir ist bekannt, dass ich bei vollständiger Erbringung der Leistung mein Widerrufsrecht verliere.';
export const earlyStartNotice = 'Die Erklärung zum vorzeitigen Massagebeginn ist nicht Teil des Onlinekaufs. Sie wird beim konkreten Massage-Termin beziehungsweise vor Beginn der Massage eingeholt und dokumentiert und gilt für Massagegutscheine und Royalpässe, sobald die Massage tatsächlich beginnt. Bei vollständiger Erbringung der Massage besteht kein Widerrufsrecht mehr.';
