import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Gift, Package, CreditCard, ChevronDown, ChevronUp, ArrowDown } from "lucide-react";
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
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  function addToCart(id: string, name: string) { add(id); setAdded(`„${name}“ wurde in den Warenkorb gelegt.`); }
  const toggleSection = (kind: Kind) => setOpenSections(state => ({ ...state, [kind]: !state[kind] }));
  const openTenSection = () => {
    setOpenSections(state => ({ ...state, ten: true }));
    requestAnimationFrame(() => document.getElementById("shop-section-ten")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const hasTen = kinds.includes("ten");
  return <><PageHero title={title} intro={intro}/><main className="section container shop-page">
    <div className="shop-intro"><img src={oils} width={700} height={500} alt="Orchideen und Massageöle im Royal-Krabi-Ambiente"/><div><span className="eyebrow">FREUDE SCHENKEN · RUHE GENIESSEN</span><h2>Eine Auszeit, die bleibt</h2><p>{lead}</p><p className="shop-unavailable">Online-Zahlung wird derzeit eingerichtet. Bitte kontaktieren Sie uns.</p><ContactButtons short/></div></div><PriceVatNotice/>
    {hasTen && kinds.includes("five") && <div className="shop-jump-links"><button type="button" className="shop-jump-link" onClick={openTenSection}>Direkt zu den 10er-Abos <ArrowDown size={16}/></button></div>}
    <section className="shop-flow" aria-label="Bestellablauf"><h2>Ihr Weg zur Auszeit</h2><ol>{["Produkte in den Warenkorb legen – Gutscheine und Abos gemeinsam", "Warenkorb prüfen und Menge anpassen", "Zur Kasse gehen", "Kontaktdaten und Lieferart angeben", "Gesamtsumme über SumUp bezahlen", "Wir prüfen den Zahlungseingang", "Versand mit DHL oder Abholung"].map(step => <li key={step}>{step}</li>)}</ol><p><CreditCard size={18}/> Zahlung über SumUp</p></section>
    <div className="shop-shipping"><Package size={24}/><div><p>{shippingNotice}</p><p>Werktage: Montag bis Freitag, ausgenommen gesetzliche Feiertage am Betriebsort. Alternativ: Abholung im Studio nach Vereinbarung.</p></div></div>
    {added && <p role="status" className="shop-form-status">{added}</p>}
    {sections.filter(([k]) => kinds.includes(k)).map(([kind, sectionTitle, eyebrow]) => {
      const products = shopProducts.filter(p => p.kind === kind);
      const collapsible = kind !== "voucher";
      const open = !collapsible || !!openSections[kind];
      return <section className="shop-product-section" key={kind} id={`shop-section-${kind}`}><div className="shop-section-heading"><span className="eyebrow">{eyebrow}</span><div className="shop-section-title-row"><h2>{sectionTitle}</h2>{collapsible && <Button type="button" variant="outline" className="btn btn-outline shop-section-toggle" aria-expanded={open} aria-controls={`shop-products-${kind}`} onClick={() => toggleSection(kind)}>{open ? <>Ausblenden <ChevronUp size={16}/></> : <>Anzeigen ({products.length}) <ChevronDown size={16}/></>}</Button>}</div>{kind !== "voucher" && <p>Massagen derselben Art und Dauer · keine automatische Verlängerung</p>}</div>{open && <div className="shop-product-grid" id={`shop-products-${kind}`}>{products.map(p => <article className="shop-product" key={p.id}>{(() => { const photo = shopProductPhoto(p.name); return photo && <img className="shop-product-photo" src={photo.url} alt={photo.alt} loading="lazy"/>; })()}<span className="signature-badge">{p.badge}</span><h3>{p.name}</h3><p>{p.description}</p>{p.regular !== null && <p>Regulär <s>{p.regular} €</s></p>}<strong className="shop-price">{p.price === null ? "Frei wählbar" : `${p.price} €`}</strong>{p.regular !== null && p.price !== null && <p className="gold-text">Sie sparen {p.regular - p.price} €</p>}<p>{validityNotice}</p><p className="shop-product-delivery">DHL-Versand in Deutschland kostenfrei oder Abholung im Studio.</p><div className="shop-product-actions">{isCartable(p) ? <Button variant="outline" className="btn btn-outline" onClick={() => addToCart(p.id, p.name)}><Gift size={17}/> In den Warenkorb</Button> : <p className="shop-unavailable">Wunschbetrag nur nach persönlicher Absprache. Bitte kontaktieren Sie uns.</p>}</div></article>)}</div>}</section>;
    })}
    <PriceVatNotice/>{kinds.includes("five") && <section className="shop-conditions"><h2>Bedingungen der Royal Abos</h2><ul>{subscriptionConditions.filter((_, index) => index !== 5).map(c => <li key={c}>{c}</li>)}</ul><p>{validityNotice}</p><div className="shop-legal-links"><Link to="/agb">AGB</Link><Link to="/datenschutz">Datenschutz</Link><Link to="/widerruf">Widerrufsbelehrung</Link><Link to="/impressum">Impressum</Link><Link to="/kontakt">Kontakt & Route</Link></div></section>}
  {!kinds.includes("five") && <p className="shop-legal-links"><Link to="/agb">AGB</Link><Link to="/datenschutz">Datenschutz</Link><Link to="/widerruf">Widerrufsbelehrung</Link><Link to="/impressum">Impressum</Link></p>}
  </main></>;
}
