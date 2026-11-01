import { expect, test } from 'bun:test';
import { shopProducts } from './shop';
import { brandFallbackPhoto, massagePhotos } from './massage-photos';
import { cartLines, normalizeCart } from './cart';

test('Mixed vouchers and 5/10 cards resolve exact catalog images after stored ID reload', () => {
  const names = ['60 Minuten Royal Thai Massage – ohne Öl', '5er-Abo · Hot-Stone-Massage', '10er-Abo · Aromaöl-Massage'];
  const products = names.map(name => shopProducts.find(p => p.name === name));
  if (products.some(p => !p)) throw new Error('Missing test catalog products');
  const stored = JSON.stringify(products.flatMap(p => p ? [{ productId: p.id, quantity: 2 }] : []));
  const lines = cartLines(normalizeCart(JSON.parse(stored)));
  expect(lines.map(l => l.product.photo.url)).toEqual([
    massagePhotos['Royal Thai Massage – ohne Öl'].url,
    massagePhotos['Hot-Stone-Massage'].url,
    massagePhotos['Aromaöl-Massage'].url,
  ]);
  expect(lines.map(l => l.quantity)).toEqual([2, 2, 2]);
  expect(lines[1]?.product.massageCount).toBe(5);
  expect(lines[2]?.product.massageCount).toBe(10);
});
test('Unknown or unmapped photo uses original brand motif, not an invented voucher picture', () => {
  const variable = shopProducts.find(p => p.name === 'Individueller Wunschbetrag');
  expect(variable?.photo).toEqual(brandFallbackPhoto);
  expect(variable?.photo.fit).toBe('contain');
});