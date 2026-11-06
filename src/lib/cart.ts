import { useEffect, useState } from "react";
import { shopProducts, type ShopProduct } from "./shop";
import { isValueVoucher } from './value-voucher';
import { isPaymentPreview } from "./launch";
import { validCents } from './money';

export type CartItem = { productId: string; quantity: number; amountCents?: number | undefined };
export type CartLine = { key: string; product: ShopProduct; quantity: number; amountCents?: number | undefined; unitPriceCents: number; subtotalCents: number; unitPrice: number; subtotal: number };
export const MAX_QUANTITY = 20;
const KEY = "royal-krabi-cart";

export const isCartable = (p: ShopProduct) => p.price !== null || isValueVoucher(p);
export const cartItemKey = (item: CartItem) => item.amountCents === undefined ? item.productId : `${item.productId}:${item.amountCents}`;

export function normalizeCart(items: unknown): CartItem[] {
  if (!Array.isArray(items)) return [];
  const out: CartItem[] = [];
  for (const raw of items) {
    const id = (raw as CartItem)?.productId;
    const q = Math.floor(Number((raw as CartItem)?.quantity));
    const p = shopProducts.find(x => x.id === id);
    if (!p || !isCartable(p) || !Number.isFinite(q) || !(q >= 1)) continue;
    const amountCents = isValueVoucher(p) ? (raw as CartItem).amountCents : undefined;
    if (isValueVoucher(p) && !validCents(amountCents)) continue;
    const item: CartItem = { productId: id, quantity: Math.min(q, MAX_QUANTITY), ...(amountCents === undefined ? {} : { amountCents }) };
    const existing = out.find(i => cartItemKey(i) === cartItemKey(item));
    if (existing) existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + item.quantity);
    else out.push(item);
  }
  return out;
}
export const addItem = (cart: CartItem[], id: string, amountCents?: number) => normalizeCart([...cart, { productId: id, quantity: 1, ...(amountCents === undefined ? {} : { amountCents }) }]);
export const setQuantity = (cart: CartItem[], key: string, quantity: number) => normalizeCart(cart.map(i => cartItemKey(i) === key ? { ...i, quantity } : i));
export const removeItem = (cart: CartItem[], key: string) => cart.filter(i => cartItemKey(i) !== key);
export function cartLines(cart: CartItem[]): CartLine[] {
  return normalizeCart(cart).flatMap(i => { const product = shopProducts.find(p => p.id === i.productId); if (!product) return []; const unitPriceCents = isValueVoucher(product) ? i.amountCents : product.price === null ? undefined : Math.round(product.price * 100); if (!validCents(unitPriceCents)) return []; const subtotalCents = unitPriceCents * i.quantity; return [{ key: cartItemKey(i), product, quantity: i.quantity, amountCents: i.amountCents, unitPriceCents, subtotalCents, unitPrice: unitPriceCents / 100, subtotal: subtotalCents / 100 }]; });
}
export const cartTotal = (cart: CartItem[]) => cartLines(cart).reduce((s, l) => s + l.subtotalCents, 0) / 100;
export const cartCount = (cart: CartItem[]) => normalizeCart(cart).reduce((s, i) => s + i.quantity, 0);

const listeners = new Set<(c: CartItem[]) => void>();
function read(): CartItem[] { try { return normalizeCart(JSON.parse(sessionStorage.getItem(KEY) ?? "[]")); } catch { return []; } }
function write(c: CartItem[]) { try { sessionStorage.setItem(KEY, JSON.stringify(c)); } catch { /* ignore */ } listeners.forEach(l => l(c)); }

/** Session-scoped cart; read after hydration to avoid SSR mismatches. */
export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  useEffect(() => { const initial = read().filter(item => item.productId !== "preview-test-1-eur" || isPaymentPreview(window.location.hostname)); write(initial); setCart(initial); listeners.add(setCart); return () => { listeners.delete(setCart); }; }, []);
  return {
    cart,
    add: (id: string, cents?: number) => write(addItem(read(), id, cents)),
    setQty: (id: string, q: number) => write(setQuantity(read(), id, q)),
    remove: (id: string) => write(removeItem(read(), id)),
  };
}
