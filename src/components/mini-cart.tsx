import * as Dialog from '@radix-ui/react-dialog';
import { Link } from '@tanstack/react-router';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShopProductImage } from './shop-product-image';
import { cartLines, cartTotal, type CartItem } from '@/lib/cart';
import { formatEuro } from '@/lib/money';
import { isValueVoucher, valueVoucherLabel } from '@/lib/value-voucher';
import { PriceVatNotice } from './site';
import { shippingNoticeShort } from '@/lib/shop';

export function MiniCart({ cart, addedId, onClose }: { cart: CartItem[]; addedId: string; onClose: () => void }) {
  const lines = cartLines(cart);
  const sorted = [...lines].sort((a, b) => Number(b.key === addedId) - Number(a.key === addedId));
  return <Dialog.Root open={Boolean(addedId)} onOpenChange={open => { if (!open) onClose(); }}><Dialog.Portal><Dialog.Overlay className="mini-cart-overlay"/><Dialog.Content className="mini-cart-panel"><div className="mini-cart-heading"><div><Dialog.Title>Ihr Warenkorb</Dialog.Title><Dialog.Description>Hinzugefügt · {lines.reduce((total, line) => total + line.quantity, 0)} Artikel</Dialog.Description></div><Button size="icon" variant="ghost" aria-label="Warenkorbvorschau schließen" onClick={onClose}><X size={20}/></Button></div><ul className="mini-cart-list">{sorted.map(line => <li key={line.key} className={`mini-cart-line${line.key === addedId ? ' mini-cart-added' : ''}`}><ShopProductImage product={line.product} thumbnail/><div>{line.key === addedId && <span className="mini-cart-added-label"><Check size={14}/> Gerade hinzugefügt</span>}<strong>{isValueVoucher(line.product) ? valueVoucherLabel : line.product.name}</strong>{line.product.duration && <span>{line.product.massageCount ? `${line.product.massageCount} Massagen · je ` : ''}{line.product.duration} Minuten</span>}{isValueVoucher(line.product) && <span>Gutscheinwert: {formatEuro(line.unitPrice)}</span>}<dl className="numeric-details"><div><dt>Menge</dt><dd>{line.quantity}</dd></div><div><dt>Einzelpreis</dt><dd>{formatEuro(line.unitPrice)}</dd></div><div><dt>Positionssumme</dt><dd><strong>{formatEuro(line.subtotal)}</strong></dd></div></dl></div></li>)}</ul><div className="mini-cart-summary"><p>Gesamtsumme <strong>{formatEuro(cartTotal(cart))}</strong></p><span>{lines.length > 0 && lines.every(l => l.product.kind === "test") ? "Keine Lieferung · keine Versandkosten" : shippingNoticeShort}</span><PriceVatNotice cautious={lines.some(l => isValueVoucher(l.product))}/><div className="mini-cart-actions"><Link to="/warenkorb" className="btn btn-gold" onClick={onClose}>Zum Warenkorb</Link><Link to="/checkout" className="btn btn-outline" onClick={onClose}>Zur Kasse</Link><Button variant="ghost" onClick={onClose}>Weiter auswählen</Button></div></div></Dialog.Content></Dialog.Portal></Dialog.Root>;
}