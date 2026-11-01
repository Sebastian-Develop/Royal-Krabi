import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { PageHero, PriceVatNotice } from "@/components/site";
import { Button } from "@/components/ui/button";
import { cartLines, cartTotal, MAX_QUANTITY, useCart } from "@/lib/cart";
import { ShopProductImage } from "@/components/shop-product-image";
import { formatEuro } from "@/lib/money";
import { isValueVoucher, valueVoucherLabel } from "@/lib/value-voucher";
import { shippingNoticeShort } from "@/lib/shop";
import { pageHead } from "@/lib/meta";

export const Route = createFileRoute("/warenkorb")({ head: () => { const h = pageHead("Warenkorb | Royal Krabi Gutscheine & Massage-Abos", "Ihr Warenkorb mit Gutscheinen und vorausbezahlten 5er- und 10er-Massagekarten von Royal Krabi.", "https://royalkrabi-thaimassage.de/warenkorb"); return { ...h, meta: [...h.meta, { name: "robots", content: "noindex" }] }; }, component: Page });

function Page() {
  const { cart, setQty, remove } = useCart();
  const lines = cartLines(cart);
  return <><PageHero title="Warenkorb"/><main className="section container shop-page shop-cart">
    {lines.length === 0 ? <div className="shop-cart-empty"><p>Ihr Warenkorb ist leer.</p><Link className="btn btn-outline" to="/gutscheine">Zu den Gutscheinen</Link><Link className="btn btn-outline" to="/abos">Zu den Abos</Link></div> : <>
      <ul className="cart-lines">{lines.map(l => <li key={l.key} className="cart-line">
        <div className="cart-product-info"><ShopProductImage product={l.product} thumbnail/><div className="cart-line-name"><span className="signature-badge">{l.product.badge}</span><strong>{isValueVoucher(l.product) ? valueVoucherLabel : l.product.name}</strong>{isValueVoucher(l.product) && <span>Gutscheinwert: {formatEuro(l.unitPrice)}</span>}<span>{l.product.massageName}</span>{l.product.duration && <span>{l.product.massageCount ? `${l.product.massageCount} Massagen · je ` : ""}{l.product.duration} Minuten</span>}<span>Einzelpreis: {formatEuro(l.unitPrice)}</span></div></div>
        <div className="cart-qty" role="group" aria-label={`Menge ${l.product.name}`}>
          <Button variant="outline" size="icon" aria-label="Menge verringern" onClick={() => setQty(l.key, l.quantity - 1)}><Minus size={16}/></Button>
          <input type="number" min={1} max={MAX_QUANTITY} value={l.quantity} aria-label="Menge" onChange={e => setQty(l.key, Number(e.target.value) || 1)}/>
          <Button variant="outline" size="icon" aria-label="Menge erhöhen" disabled={l.quantity >= MAX_QUANTITY} onClick={() => setQty(l.key, l.quantity + 1)}><Plus size={16}/></Button>
        </div>
        <span className="cart-subtotal">Zwischensumme: <strong>{formatEuro(l.subtotal)}</strong></span>
        <Button variant="ghost" className="cart-remove" onClick={() => remove(l.key)}><Trash2 size={16}/> Entfernen</Button>
      </li>)}</ul>
      <div className="cart-total"><p>{shippingNoticeShort}</p><p className="cart-total-sum">Gesamtsumme: <strong>{formatEuro(cartTotal(cart))}</strong></p></div><PriceVatNotice cautious={lines.some(l => isValueVoucher(l.product))}/>
      <div className="cart-actions"><Link className="btn btn-outline" to="/gutscheine">Weitere Gutscheine</Link><Link className="btn btn-outline" to="/abos">Weitere Abos</Link><Link className="btn btn-gold" to="/checkout">Zur Kasse</Link></div>
    </>}
  </main></>;
}
