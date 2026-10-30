import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Gift, Package, CreditCard } from "lucide-react";
import { ContactButtons, PageHero, PriceVatNotice } from "@/components/site";
import { Button } from "@/components/ui/button";
import { isCartable, useCart } from "@/lib/cart";
import { shopProducts, shippingNotice, validityNotice } from "@/lib/shop";
import { subscriptionConditions } from "@/lib/content";
import { shopProductPhoto } from "@/lib/massage-photos";
import oils from "@/assets/orchid-oils.jpg";
type Kind = "voucher" | "five" | "ten";
const sections = [ ["voucher", "Gutscheine", "FREUDE SCHENKEN"], ["five", "5er-Massage-Abos", "FÜNF MOMENTE DER RUHE"], ["ten", "10er-Massage-Abos", "ZEHN MOMENTE DER RUHE"] ] as const;
export function ShopProductsPage({ kinds, title, intro, lead }: { kinds: Kind[]; title: string; intro: string; lead: string }) {
  const { cart, add } = useCart();
  const [added, setAdded] = useState("");
  function addToCart(id: string, name: string) { add(id); setAdded(`„${name}“ wurde in den Warenkorb gelegt.`); }
  return <><PageHero title={title} intro={intro}/><main className="section container shop-page">
    <div className="shop-intro"><img src={oils} width={700} height={500} alt="Orchideen und Massageöle im Royal-Krabi-Ambiente"/><div><span className="eyebrow">FREUDE SCHENKEN · RUHE GENIESSEN</span><h2>Eine Auszeit, die bleibt</h2><p>{lead}</p><p className="shop-unavailable">Online-Zahlung wird derzeit eingerichtet. Bitte kontaktieren Sie uns.</p><ContactButtons short/></div></div><PriceVatNotice/>
    <section className="shop-flow" aria-label="Bestellablauf"><h2>Ihr Weg zur Auszeit</h2><ol>{["Produkte in den Warenkorb legen – Gutscheine und Abos gemeinsam", "Warenkorb prüfen und Menge anpassen", "Zur Kasse gehen", "Kontaktdaten und Lieferart angeben", "Gesamtsumme über SumUp bezahlen", "Wir prüfen den Zahlungseingang", "Versand mit DHL oder Abholung"].map(step => <li key={step}>{step}</li>)}</ol><p><CreditCard size={18}/> Zahlung über SumUp</p></section>
    <div className="shop-shipping"><Package size={24}/><div><p>{shippingNotice}</p><p>Werktage: Montag bis Freitag, ausgenommen gesetzliche Feiertage am Betriebsort. Alternativ: Abholung im Studio nach Vereinbarung.</p></div></div>
    {added && <p role="status" className="shop-form-status">{added}</p>}
    {sections.filter(([k]) => kinds.includes(k)).map(([kind, title, eyebrow]) => <section className="shop-product-section" key={kind}><div className="shop-section-heading"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{kind !== "voucher" && <p>Massagen derselben Art und Dauer · keine automatische Verlängerung</p>}</div><div className="shop-product-grid">{shopProducts.filter(p => p.kind === kind).map(p => <article className="shop-product" key={p.id}>{(() => { const photo = shopProductPhoto(p.name); return photo && <img className="shop-product-photo" src={photo.url} alt={photo.alt} loading="lazy"/>; })()}<span className="signature-badge">{p.badge}</span><h3>{p.name}</h3><p>{p.description}</p>{p.regular !== null && <p>Regulär <s>{p.regular} €</s></p>}<strong className="shop-price">{p.price === null ? "Frei wählbar" : `${p.price} €`}</strong>{p.regular !== null && p.price !== null && <p className="gold-text">Sie sparen {p.regular - p.price} €</p>}<p>{validityNotice}</p><p className="shop-product-delivery">DHL-Versand in Deutschland kostenfrei oder Abholung im Studio.</p><div className="shop-product-actions">{isCartable(p) ? <Button variant="outline" className="btn btn-outline" onClick={() => addToCart(p.id, p.name)}><Gift size={17}/> In den Warenkorb</Button> : <p className="shop-unavailable">Wunschbetrag nur nach persönlicher Absprache. Bitte kontaktieren Sie uns.</p>}</div></article>)}</div></section>)}
    <PriceVatNotice/>{kinds.includes("five") && <section className="shop-conditions"><h2>Bedingungen der Royal Abos</h2><ul>{subscriptionConditions.filter((_, index) => index !== 5).map(c => <li key={c}>{c}</li>)}</ul><p>{validityNotice}</p><div className="shop-legal-links"><Link to="/agb">AGB</Link><Link to="/datenschutz">Datenschutz</Link><Link to="/widerruf">Widerrufsbelehrung</Link><Link to="/impressum">Impressum</Link><Link to="/kontakt">Kontakt & Route</Link></div></section>}
  {!kinds.includes("five") && <p className="shop-legal-links"><Link to="/agb">AGB</Link><Link to="/datenschutz">Datenschutz</Link><Link to="/widerruf">Widerrufsbelehrung</Link><Link to="/impressum">Impressum</Link></p>}
  </main></>;
}