import { expect, test } from 'bun:test';
import { addItem, cartLines, cartItemKey, normalizeCart, setQuantity } from './cart';
import { parseEuroCents, MAX_STORED_CENTS } from './money';
import { shopProducts } from './shop';
import { buildOrderLines, centsToAmount, orderTotalCents } from './shop-checkout';
import { discountForLines } from './discount';
const value = shopProducts.find(p => p.name === 'Individueller Wunschbetrag');
const fixed = shopProducts.find(p => p.name === '60 Minuten Royal Thai Massage – ohne Öl');
if (!value || !fixed) throw new Error('test catalog products missing');
const valueId = value.id;
const fixedId = fixed.id;
test('Dezimalkomma und maximal zwei Nachkommastellen', () => {
  expect(parseEuroCents('125,50')).toBe(12550);
  expect(parseEuroCents('125.5')).toBe(12550);
  expect(parseEuroCents('0,01')).toBe(1);
  expect(parseEuroCents('125')).toBe(12500);
  expect(parseEuroCents('1,234')).toBeNull();
});
test('leere, nichtnumerische, negative und Nullbeträge abgelehnt', () => {
  for (const input of ['', 'abc', '-1', '0', '0,00', '1e3', '1,2,3', 'NaN', 'Infinity']) expect(parseEuroCents(input)).toBeNull();
});
test('technische Speichergrenze, keine erfundene Geschäftsgrenze', () => {
  expect(parseEuroCents('21474836,47')).toBe(MAX_STORED_CENTS);
  expect(parseEuroCents('21474836,48')).toBeNull();
  expect(buildOrderLines([{ productId: valueId, quantity: 2, amountCents: MAX_STORED_CENTS }])).toHaveProperty('error');
});
test('unterschiedliche Beträge getrennt, gleiche mit Mengenlogik', () => {
  let cart = addItem([], valueId, 12550);
  cart = addItem(cart, valueId, 8000);
  cart = addItem(cart, valueId, 12550);
  expect(cart).toEqual([{ productId: valueId, quantity: 2, amountCents: 12550 }, { productId: valueId, quantity: 1, amountCents: 8000 }]);
  expect(setQuantity(cart, cartItemKey(cart[1] ?? { productId: '', quantity: 0 }), 3)[0]?.quantity).toBe(2);
  expect(normalizeCart(JSON.parse(JSON.stringify(cart)))).toEqual(cart);
});
test('Browser, gespeicherte Positionen und SumUp-Betrag verwenden dieselben Cent', () => {
  const cart = addItem(addItem([], valueId, 12550), valueId, 8000);
  const built = buildOrderLines(cart);
  if ('error' in built) throw new Error(built.error);
  expect(built.lines.map(l => l.unitPriceCents)).toEqual(cartLines(cart).map(l => l.unitPriceCents));
  expect(built.lines.map(l => l.subtotalCents)).toEqual([12550,8000]);
  expect(centsToAmount(orderTotalCents(built.lines))).toBe(205.5);
});
test('ungültige Serverbeträge und manipulierte Festpreise abgelehnt', () => {
  for (const amountCents of [undefined,0,-1,1.2,NaN,Infinity,MAX_STORED_CENTS+1]) expect(buildOrderLines([{ productId: valueId, quantity: 1, amountCents }])).toHaveProperty('error');
  expect(buildOrderLines([{ productId: fixedId, quantity: 1, amountCents: 1 }])).toHaveProperty('error');
  expect(buildOrderLines([{ productId: fixedId, quantity: 1.5 }])).toHaveProperty('error');
});
test('ROYALKRABI20 reduziert im gemischten Warenkorb niemals Wunschbeträge', () => {
  const built = buildOrderLines([{ productId: valueId, quantity: 1, amountCents: 12550 }, { productId: valueId, quantity: 1, amountCents: 8000 }, { productId: fixedId, quantity: 1 }]);
  if ('error' in built) throw new Error(built.error);
  const result = discountForLines(built.lines,'ROYALKRABI20',new Date('2026-11-08T12:00:00+01:00'));
  expect(result).toEqual({ ok: true, eligibleCents: 5900, discountCents: 1180 });
  expect(orderTotalCents(built.lines)-1180).toBe(25270);
});