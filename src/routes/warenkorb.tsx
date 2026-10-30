import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { PageHero, PriceVatNotice } from "@/components/site";
import { Button } from "@/components/ui/button";
import { cartLines, cartTotal, MAX_QUANTITY, useCart } from "@/lib/cart";
import { pageHead } from "@/lib/meta";

export const Route = createFileRoute("/warenkorb")({ head: () => { const h = pageHead("Warenkorb | Royal Krabi Gutscheine & Massage-Abos", "Ihr Warenkorb mit Gutscheinen und vorausbezahlten 5er- und 10er-Massagekarten von Royal Krabi.", "https://royalkrabi-thaimassage.de/warenkorb"); return { ...h, meta: [...h.meta, { name: "robots", content: "noindex" }] }; }, component: Page });

function Page() {
  const { cart, setQty, remove } = useCart();
  const lines = cartLines(cart);
  return <><PageHero title="Warenkorb"/><main className="section container shop-page shop-cart">
    {lines.length === 0 ? <div className="shop-cart-empty"><p>Ihr Warenkorb ist leer.</p><Link className="btn btn-outline" to="/gutscheine">Zu den Gutscheinen</Link><Link className="btn btn-outline" to="/abos">Zu den Abos</Link></div> : <>
      <ul className="cart-lines">{lines.map(l => <li key={l.product.id} className="cart-line">
        <div className="cart-line-name"><span className="signature-badge">{l.product.badge}</span><strong>{l.product.name}</strong><span>Einzelpreis: {l.unitPrice} €</span></div>
        <div className="cart-qty" role="group" aria-label={`Menge ${l.product.name}`}>
          <Button variant="outline" size="icon" aria-label="Menge verringern" onClick={() => setQty(l.product.id, l.quantity - 1)}><Minus size={16}/></Button>
          <input type="number" min={1} max={MAX_QUANTITY} value={l.quantity} aria-label="Menge" onChange={e => setQty(l.product.id, Number(e.target.value) || 1)}/>
          <Button variant="outline" size="icon" aria-label="Menge erhöhen" disabled={l.quantity >= MAX_QUANTITY} onClick={() => setQty(l.product.id, l.quantity + 1)}><Plus size={16}/></Button>
        </div>
        <span className="cart-subtotal">Zwischensumme: <strong>{l.subtotal} €</strong></span>
        <Button variant="ghost" className="cart-remove" onClick={() => remove(l.product.id)}><Trash2 size={16}/> Entfernen</Button>
      </li>)}</ul>
      <div className="cart-total"><p>Versand innerhalb Deutschlands mit DHL, kostenfrei.</p><p className="cart-total-sum">Gesamtsumme: <strong>{cartTotal(cart)} €</strong></p></div><PriceVatNotice/>
      <div className="cart-actions"><Link className="btn btn-outline" to="/gutscheine">Weitere Gutscheine</Link><Link className="btn btn-outline" to="/abos">Weitere Abos</Link><Link className="btn btn-gold" to="/checkout">Zur Kasse</Link></div>
    </>}
  </main></>;
}
