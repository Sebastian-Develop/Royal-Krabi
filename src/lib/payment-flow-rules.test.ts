import { expect, test } from 'bun:test';
import { confirmedPurchaseRules, contractAcceptanceNotice, noCashPayoutNotice, earlyStartDeclaration, earlyStartNotice } from './purchase-rules';
import { contact, withdrawalEmail, withdrawalMailHref } from './contact';
import { legalDraftAgb, legalDraftWithdrawal, legalDraftForm, legalDraftReview } from './legal-draft';
import { paymentConfirmedEmail, operatorEmail, type EmailOrder, type EmailLine } from './order-email';
import { faqs } from './content';

const flatten = (sections: { paragraphs: string[] }[]) => sections.flatMap(s => s.paragraphs).join('\n');

test('no customer communication before verified payment; single acceptance email after', () => {
  expect(confirmedPurchaseRules.contract.prePaymentCommunication).toBe(false);
  expect(confirmedPurchaseRules.contract.requiresVerifiedFullPayment).toBe(true);
  expect(confirmedPurchaseRules.contract.acceptanceChannel).toBe('payment_confirmation_email');
  expect(contractAcceptanceNotice).toContain('Vor der verifizierten Zahlung werden keine E-Mails');
  expect(contractAcceptanceNotice).toContain('ausdrücklich annimmt');
});

test('no cash payout rule is confirmed and consolidated in draft, FAQ and notices', () => {
  expect(confirmedPurchaseRules.noCashPayout.vouchers).toBe(true);
  expect(confirmedPurchaseRules.noCashPayout.royalPasses).toBe(true);
  expect(noCashPayoutNotice).toContain('nicht in Bargeld ausgezahlt');
  expect(noCashPayoutNotice).toContain('Restwert als Gutscheinwert');
  expect(noCashPayoutNotice).toContain('Auszahlung des Restwerts in Geld ist ausgeschlossen');
  expect(flatten(legalDraftAgb)).toContain('nicht in Bargeld ausgezahlt');
  expect(faqs.some(([q, a]) => q.includes('Bargeld') && a.includes('nicht in Bargeld ausgezahlt'))).toBe(true);
});

test('withdrawal email address is the contact address everywhere required', () => {
  expect(withdrawalEmail).toBe('kontakt@royalkrabi-thaimassage.de');
  expect(JSON.stringify([legalDraftWithdrawal, legalDraftForm])).not.toContain(['widerruf','@'].join(''));
  expect(withdrawalMailHref).toContain(`mailto:${withdrawalEmail}`);
  expect(flatten(legalDraftWithdrawal)).toContain(withdrawalEmail);
  expect(legalDraftForm.join('\n')).toContain(withdrawalEmail);
  // Formular bleibt freiwillig, Widerruf ohne Formular per E-Mail möglich:
  expect(flatten(legalDraftWithdrawal)).toContain('Muster-Widerrufsformulars ist freiwillig');
  expect(flatten(legalDraftWithdrawal)).toContain('auch ohne Formular per E-Mail');
});

test('early start declaration is confirmed and kept out of the online checkout', () => {
  expect(earlyStartDeclaration).toBe('Ich verlange ausdrücklich, dass die Massage vor Ablauf der Widerrufsfrist beginnt. Mir ist bekannt, dass ich bei vollständiger Erbringung der Leistung mein Widerrufsrecht verliere.');
  expect(earlyStartNotice).toContain('nicht Teil des Onlinekaufs');
  expect(earlyStartNotice).toContain('vor Beginn der Massage');
  expect(flatten(legalDraftWithdrawal)).toContain(earlyStartDeclaration);
});

const sampleOrder: EmailOrder = {
  id: '00000000-0000-4000-8000-000000000001', fullName: 'Max Mustermann', email: 'max@example.de', phone: '0123456789',
  delivery: 'post', street: 'Musterstr. 1', postalCode: '63075', city: 'Offenbach am Main', recipient: '', giftText: '', notes: '',
  totalCents: 8000, discountCode: 'ROYALKRABI20', discountCents: 2000,
  createdAt: '2026-11-10T10:00:00.000Z', paidAt: '2026-11-10T10:05:00.000Z', legalVersion: '2026-11-02-confirmed-review',
};
const sampleLines: EmailLine[] = [{ name: '60 Minuten Royal Thai Massage', kind: 'voucher', quantity: 1, unitPriceCents: 10000, subtotalCents: 10000, validityMonths: 24 }];

test('payment confirmation email contains acceptance, order number, products, withdrawal address and shipping info', () => {
  const mail = paymentConfirmedEmail(sampleOrder, sampleLines);
  expect(mail.html).toContain('ausdrücklich');
  expect(mail.html).toContain(sampleOrder.id);
  expect(mail.html).toContain('60 Minuten Royal Thai Massage');
  expect(mail.html).toContain(withdrawalEmail);
  expect(mail.html).toContain('DHL');
  expect(mail.text).toContain(withdrawalEmail);
  expect(mail.text).toContain('nicht vorgeschrieben');
});

test('operator email has no manual discount review marking', () => {
  const warn = operatorEmail({ ...sampleOrder, discountValid: false }, sampleLines);
  expect(warn.html).not.toContain('Rabattprüfung');
  const ok = operatorEmail({ ...sampleOrder, discountValid: true }, sampleLines);
  expect(ok.html).not.toContain('Rabattprüfung');
});

test('review notes keep the legal check points instead of silent release', () => {
  const review = flatten(legalDraftReview);
  expect(review).toContain('Eingangsbestätigungspflicht');
  expect(review).toContain(withdrawalEmail);
  expect(review).toContain('356a');
});

test('final discount window: 07.11.2026 00:00 to 21.11.2026 23:59 Berlin, normal price outside', async () => {
  const { verifyDiscountAtPayment } = await import('./discount');
  const { openingPaymentNotice } = await import('./purchase-rules');
  expect(verifyDiscountAtPayment('ROYALKRABI20', new Date('2026-11-06T22:59:59Z')).applies).toBe(false);
  expect(verifyDiscountAtPayment('ROYALKRABI20', new Date('2026-11-06T23:00:00Z')).applies).toBe(true);
  expect(verifyDiscountAtPayment('ROYALKRABI20', new Date('2026-11-21T22:59:59Z')).applies).toBe(true);
  expect(verifyDiscountAtPayment('ROYALKRABI20', new Date('2026-11-21T23:00:00Z')).applies).toBe(false);
  expect(openingPaymentNotice).toContain('21.11.2026, 23:59 Uhr (Europe/Berlin)');
  expect(openingPaymentNotice).not.toMatch(/manuell|Nachbelastung|Erstattung/);
});
