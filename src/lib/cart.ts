import { useEffect, useState } from "react";
import { shopProducts, type ShopProduct } from "./shop";

export type CartItem = { productId: string; quantity: number };
export type CartLine = { product: ShopProduct; quantity: number; unitPrice: number; subtotal: number };
export const MAX_QUANTITY = 20;
const KEY = "royal-krabi-cart";

/** Only fixed-price products can go into the cart; variable vouchers stay "nach Absprache". */
export const isCartable = (p: ShopProduct) => p.price !== null;

export function normalizeCart(items: unknown): CartItem[] {
  if (!Array.isArray(items)) return [];
  const out: CartItem[] = [];
  for (const raw of items) {
    const id = (raw as CartItem)?.productId;
    const q = Math.floor(Number((raw as CartItem)?.quantity));
    const p = shopProducts.find(x => x.id === id);
    if (!p || !isCartable(p) || !(q >= 1) || out.some(i => i.productId === id)) continue;
    out.push({ productId: id, quantity: Math.min(q, MAX_QUANTITY) });
  }
  return out;
}
export const addItem = (cart: CartItem[], id: string) => cart.some(i => i.productId === id)
  ? normalizeCart(cart.map(i => i.productId === id ? { ...i, quantity: i.quantity + 1 } : i))
  : normalizeCart([...cart, { productId: id, quantity: 1 }]);
export const setQuantity = (cart: CartItem[], id: string, quantity: number) => normalizeCart(cart.map(i => i.productId === id ? { ...i, quantity } : i));
export const removeItem = (cart: CartItem[], id: string) => cart.filter(i => i.productId !== id);
export function cartLines(cart: CartItem[]): CartLine[] {
  return normalizeCart(cart).map(i => { const product = shopProducts.find(p => p.id === i.productId)!; const unitPrice = product.price!; return { product, quantity: i.quantity, unitPrice, subtotal: unitPrice * i.quantity }; });
}
export const cartTotal = (cart: CartItem[]) => cartLines(cart).reduce((s, l) => s + l.subtotal, 0);
export const cartCount = (cart: CartItem[]) => normalizeCart(cart).reduce((s, i) => s + i.quantity, 0);

const listeners = new Set<(c: CartItem[]) => void>();
function read(): CartItem[] { try { return normalizeCart(JSON.parse(sessionStorage.getItem(KEY) ?? "[]")); } catch { return []; } }
function write(c: CartItem[]) { try { sessionStorage.setItem(KEY, JSON.stringify(c)); } catch { /* ignore */ } listeners.forEach(l => l(c)); }

/** Session-scoped cart; read after hydration to avoid SSR mismatches. */
export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  useEffect(() => { setCart(read()); listeners.add(setCart); return () => { listeners.delete(setCart); }; }, []);
  return {
    cart,
    add: (id: string) => write(addItem(read(), id)),
    setQty: (id: string, q: number) => write(setQuantity(read(), id, q)),
    remove: (id: string) => write(removeItem(read(), id)),
  };
}
