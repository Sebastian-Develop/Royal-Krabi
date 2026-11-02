import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Gift, Package, CreditCard, ChevronDown, ChevronUp } from "lucide-react";
import { ContactButtons, PageHero, PriceVatNotice } from "@/components/site";
import { Button } from "@/components/ui/button";
import { isCartable, useCart } from "@/lib/cart";
import { shopProducts, shippingNotice, shippingNoticeShort } from "@/lib/shop";
import { subscriptionConditions } from "@/lib/content";
import { ShopProductImage } from "./shop-product-image";
import { MiniCart } from "./mini-cart";
import { cartItemKey } from '@/lib/cart';
import { isValueVoucher, valueVoucherLabel, sumupGiftCardUrl, sumupGiftCardButtonLabel, sumupGiftCardHint } from '@/lib/value-voucher';
import { formatEuro } from '@/lib/money';
import oils from "@/assets/orchid-oils.jpg";
import { contractAcceptanceNotice, openingPaymentNotice, openingEligibilityNotice, massageVoucherPartialNotice, massageVoucherChangeNotice, priceIncreaseNotice } from "@/lib/purchase-rules";
type Kind = "voucher" | "five" | "ten";
const sections = [ ["voucher", "Gutscheine", "FREUDE SCHENKEN"], ["five", "5er Royalpässe", "FÜNF MOMENTE DER RUHE"], ["ten", "10er Royalpässe", "ZEHN MOMENTE DER RUHE"] ] as const;
export function ShopProductsPage({ kinds, title, intro, lead }: { kinds: Kind[]; title: string; intro: string; lead: string }) {
  const { cart, add } = useCart();
  const [added, setAdded] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  function addToCart(id: string, amountCents?: number) { add(id, amountCents); setAdded(cartItemKey({ productId: id, quantity: 1, amountCents })); }
  const toggleSection = (kind: Kind) => setOpenSections(state => ({ ...state, [kind]: !state[kind] }));
  return <><PageHero title={title} intro={intro}/><main className="section container shop-page">
    <div className="shop-intro"><img src={oils} width={700} height={500} alt="Orchideen und Massageöle im Royal-Krabi-Ambiente"/><div><span className="eyebrow">FREUDE SCHENKEN · RUHE GENIESSEN</span><h2>Eine Auszeit, die bleibt</h2><p>{lead}</p><p className="shop-unavailable">Entwurf: Website-Onlineverkauf noch nicht freigegeben. AGB und Widerrufsbelehrung werden geprüft.</p><ContactButtons short/></div></div>
    <section className="shop-flow" aria-label="Bestellablauf"><h2>Ihr Weg zur Auszeit</h2><ol>{["Massagegutscheine und Royalpässe in den Warenkorb legen", "Warenkorb prüfen und Menge anpassen", "Zur Kasse gehen", "Kontaktdaten und Lieferart angeben", "Gesamtsumme über SumUp bezahlen", "Unabhängige Prüfung des Zahlungseingangs", "Anschließende Annahme durch Royal Krabi", "Versand mit DHL oder Abholung"].map(step => <li key={step}>{step}</li>)}</ol><p><CreditCard size={18}/> Zahlung über SumUp</p><p>Dieser Ablauf gilt für unseren Website-Warenkorb. Wertgutschein · Wunschbetrag wird ausschließlich im externen SumUp-Shop gekauft. Dessen Vertrags- und Zustellungsinformationen sind noch abzugleichen; externe Käufe werden nicht importiert. {contractAcceptanceNotice} Die Rechtstextfassung bleibt ein <Link to="/agb">AGB-Entwurf</Link>.</p></section>
    <section className="shop-conditions"><h2>Eröffnungsrabatt</h2><p>{openingEligibilityNotice}</p><p>{openingPaymentNotice}</p></section>
    <div className="shop-shipping"><Package size={24}/><div><p>{shippingNotice}</p><p>Werktage: Montag bis Freitag, ausgenommen gesetzliche Feiertage am Betriebsort. Alternativ: Abholung im Studio nach Vereinbarung.</p></div></div>
    <MiniCart cart={cart} addedId={added} onClose={() => setAdded("")}/>
    {sections.filter(([k]) => kinds.includes(k)).map(([kind, sectionTitle, eyebrow]) => {
      const products = shopProducts.filter(p => p.kind === kind);
      const collapsible = kind !== "voucher";
      const open = !collapsible || !!openSections[kind];
      return <section className="shop-product-section" key={kind} id={`shop-section-${kind}`}><div className="shop-section-heading"><span className="eyebrow">{eyebrow}</span><div className="shop-section-title-row"><h2>{sectionTitle}</h2>{collapsible && <Button type="button" variant="outline" className="btn btn-outline shop-section-toggle" aria-expanded={open} aria-controls={`shop-products-${kind}`} onClick={() => toggleSection(kind)}>{open ? <>Ausblenden <ChevronUp size={16}/></> : <>Anzeigen ({products.length}) <ChevronDown size={16}/></>}</Button>}</div>{kind !== "voucher" && <p>Massagen derselben Art und Dauer · keine automatische Verlängerung</p>}</div>{open && <div className="shop-product-grid" id={`shop-products-${kind}`}>{products.map(p => <article className="shop-product" key={p.id}><ShopProductImage product={p}/><span className="signature-badge">{p.badge}</span><h3>{isValueVoucher(p) ? valueVoucherLabel : p.name}</h3><p>{p.description}</p>{!isValueVoucher(p) && <><p>{priceIncreaseNotice}</p>{p.kind === "voucher" && <>{p.duration !== null && p.duration >= 60 && <p>{massageVoucherPartialNotice}</p>}<p>{massageVoucherChangeNotice}</p></>}</>}{p.regular !== null && <p>Regulär <s>{formatEuro(p.regular)}</s></p>}<strong className="shop-price">{p.price === null ? "Frei wählbar" : formatEuro(p.price)}</strong>{p.price !== null && <PriceVatNotice/>}{p.regular !== null && p.price !== null && <p className="gold-text">Sie sparen {formatEuro(p.regular - p.price)}</p>}<p className="shop-validity">Gültigkeit und Nutzungsbedingungen im <Link to="/agb">AGB-Entwurf</Link>; noch nicht freigegeben.</p><p className="shop-product-delivery">{isValueVoucher(p) ? "Externer SumUp-Shop: Zustellung, Vertrags- und Gültigkeitsangaben vor Freigabe abzugleichen; unser DHL-Versand gilt hier nicht." : shippingNoticeShort}</p><div className="shop-product-actions">{isValueVoucher(p) ? <div className="sumup-giftcard-action"><a className="btn btn-outline" href={sumupGiftCardUrl} target="_blank" rel="noopener noreferrer"><Gift size={17}/> {sumupGiftCardButtonLabel}</a><p className="sumup-giftcard-hint">{sumupGiftCardHint}</p></div> : isCartable(p) ? <Button variant="outline" className="btn btn-outline" onClick={() => addToCart(p.id)}><Gift size={17}/> In den Warenkorb</Button> : <p className="shop-unavailable">Wunschbetrag nur nach persönlicher Absprache. Bitte kontaktieren Sie uns.</p>}</div></article>)}</div>}</section>;
    })}
    {kinds.includes("five") && <section className="shop-conditions"><h2>Bedingungen der Royalpässe</h2><ul>{subscriptionConditions.map(c => <li key={c}>{c}</li>)}</ul><p className="shop-validity">Gültigkeit und Nutzungsbedingungen im <Link to="/agb">AGB-Entwurf</Link>; noch nicht freigegeben.</p></section>}
  </main></>;
}
