import { useMemo, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { contact, mailHref } from "@/lib/contact";
import { cartLines, type CartItem } from "@/lib/cart";
import { shippingNotice, shippingNoticeShort, validityNotice } from "@/lib/shop";
import { checkoutRequestSchema, orderTotalCents, type OrderLine } from "@/lib/shop-checkout";
import { discountForLines, openingDiscount } from "@/lib/discount";
import { createShopCheckout } from "@/lib/shop-checkout.functions";
import { Loader2 } from "lucide-react";
import { ShopProductImage } from "./shop-product-image";
import { isValueVoucher, valueVoucherLabel } from "@/lib/value-voucher";
import { formatCents as eur, formatEuro } from "@/lib/money";
import { contractAcceptanceNotice, openingPaymentNotice, openingEligibilityNotice, massageVoucherPartialNotice, massageVoucherChangeNotice, priceIncreaseNotice } from "@/lib/purchase-rules";
import { PriceVatNotice } from "@/components/site";



export function ShopOrderForm({ cart }: { cart: CartItem[] }) {
  const [delivery, setDelivery] = useState("pickup");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  // Wiederholungsschlüssel: bleibt über Wiederholungsversuche gleich, damit der
  // Server dieselbe Übermittlung erkennt und keine zweite Bestellung anlegt.
  const [submissionKey] = useState(() => crypto.randomUUID());
  const lines = cartLines(cart);
  const createCheckout = useServerFn(createShopCheckout);

  // Live-Vorschau des Rabatts mit derselben serverseitigen Regel; verbindlich ist die Serverprüfung.
  const preview = useMemo(() => {
    const orderLines: OrderLine[] = lines.map(l => ({ productId: l.product.id, name: l.product.name, kind: l.product.kind, quantity: l.quantity, unitPriceCents: l.unitPriceCents, subtotalCents: l.subtotalCents }));
    const subtotalCents = orderTotalCents(orderLines);
    if (!discountCode.trim()) return { subtotalCents, discountCents: 0, totalCents: subtotalCents, message: "" };
    const result = discountForLines(orderLines, discountCode, new Date());
    return result.ok
      ? { subtotalCents, discountCents: result.discountCents, totalCents: subtotalCents - result.discountCents, message: "" }
      : { subtotalCents, discountCents: 0, totalCents: subtotalCents, message: result.error };
  }, [lines, discountCode]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    if (!lines.length) { setError("Ihr Warenkorb ist leer."); return; }
    const form = new FormData(event.currentTarget);
    const parsed = checkoutRequestSchema.safeParse({
      ...Object.fromEntries(form),
      items: lines.map(l => ({ productId: l.product.id, quantity: l.quantity, ...(l.amountCents === undefined ? {} : { amountCents: l.amountCents }) })),
      discountCode,
      submissionKey,
      acceptTerms: form.get("acceptTerms") === "on",
      acknowledgePrivacy: form.get("acknowledgePrivacy") === "on",
    });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Bitte prüfen Sie Ihre Angaben."); return; }
    setSubmitting(true);
    setError("");
    try {
      const result = await createCheckout({ data: parsed.data });
      if (result.ok) { window.location.assign(result.hostedUrl); return; }
      setError(result.error);
    } catch {
      setError("Die Bestellung konnte nicht übermittelt werden. Bitte versuchen Sie es erneut oder kontaktieren Sie uns telefonisch oder per E-Mail.");
    }
    setSubmitting(false);
  }

  return <section className="shop-order" id="bestellformular" aria-labelledby="order-title"><div className="shop-section-heading"><span className="eyebrow">KASSE</span><h2 id="order-title">Bestellformular</h2><p>Entwurf – Onlineverkauf noch nicht freigegeben. Vorgesehen: direkte Zahlung über SumUp und unabhängige Zahlungsprüfung. {contractAcceptanceNotice}</p></div><form onSubmit={submit} noValidate>
    <div className="form-grid"><label className="field"><span>Vor- und Nachname *</span><input name="fullName" autoComplete="name" required maxLength={100}/></label><label className="field"><span>E-Mail-Adresse *</span><input name="email" type="email" autoComplete="email" required maxLength={255}/></label><label className="field"><span>Telefonnummer *</span><input name="phone" type="tel" autoComplete="tel" required maxLength={40}/></label></div>
    <fieldset><legend>Lieferart *</legend><label className="check"><input type="radio" name="delivery" value="pickup" checked={delivery === "pickup"} onChange={() => setDelivery("pickup")}/><span>Abholung im Studio</span></label><label className="check"><input type="radio" name="delivery" value="post" checked={delivery === "post"} onChange={() => setDelivery("post")}/><span>Versand innerhalb Deutschlands (DHL, kostenfrei)</span></label></fieldset>
    <input type="hidden" name="country" value="DE"/>
    {delivery === "post" ? <><div className="form-grid"><label className="field"><span>Straße und Hausnummer *</span><input name="street" autoComplete="address-line1" required maxLength={150}/></label><label className="field"><span>Postleitzahl *</span><input name="postalCode" autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{5}" required maxLength={5}/></label><label className="field"><span>Ort *</span><input name="city" autoComplete="address-level2" required maxLength={100}/></label></div><p className="shop-delivery-note">{shippingNotice}</p></> : <><input type="hidden" name="street" value=""/><input type="hidden" name="postalCode" value=""/><input type="hidden" name="city" value=""/><p className="shop-delivery-note">Wir melden uns nach Prüfung des Zahlungseingangs, um einen Abholtermin abzustimmen.</p></>}
    <div className="form-grid"><label className="field"><span>Empfängername (optional)</span><input name="recipient" maxLength={100}/></label><label className="field"><span>Geschenktext (optional)</span><textarea name="giftText" rows={3} maxLength={500}/></label></div>
    <label className="field"><span>Anmerkungen (optional)</span><textarea name="notes" rows={3} maxLength={1000}/></label>
    <label className="field"><span>Rabattcode (optional)</span><input name="discountCode" value={discountCode} onChange={e => setDiscountCode(e.target.value)} maxLength={40} autoComplete="off" placeholder={openingDiscount.code}/></label>
    <p>{openingEligibilityNotice}</p><p>{openingPaymentNotice}</p><p>Der Website-Verkauf bleibt gesperrt.</p>
    {preview.message && <p className="form-error" role="alert">{preview.message}</p>}
    <div className="shop-order-summary" aria-label="Bestellübersicht"><strong>Bestellübersicht</strong>
      {lines.length ? <table className="order-table"><thead><tr><th>Produkt</th><th>Menge</th><th>Einzelpreis</th><th>Zwischensumme</th></tr></thead><tbody>{lines.map(l => <tr key={l.key}><td><div className="checkout-product"><ShopProductImage product={l.product} thumbnail/><div>{isValueVoucher(l.product) ? valueVoucherLabel : l.product.name}{isValueVoucher(l.product) && <span>Gutscheinwert: {formatEuro(l.unitPrice)}</span>}</div></div></td><td data-label="Menge">{l.quantity}</td><td data-label="Einzelpreis">{formatEuro(l.unitPrice)}</td><td data-label="Zwischensumme">{formatEuro(l.subtotal)}</td></tr>)}</tbody><tfoot>
        <tr><td colSpan={3}>Zwischensumme</td><td>{eur(preview.subtotalCents)}</td></tr>
        {preview.discountCents > 0 && <tr><td colSpan={3}>Rabatt ({openingDiscount.code}, {openingDiscount.percent} %)</td><td>−{eur(preview.discountCents)}</td></tr>}
        <tr><td colSpan={3}>Gesamtsumme</td><td><strong>{eur(preview.totalCents)}</strong></td></tr>
      </tfoot></table> : <p>Ihr Warenkorb ist leer. <Link to="/gutscheine">Zu den Gutscheinen</Link> · <Link to="/abos">Zu den Abos</Link></p>}
      <PriceVatNotice cautious={lines.some(l => isValueVoucher(l.product))}/><p>{shippingNoticeShort}</p><p>{validityNotice} <Link to="/agb">AGB-Entwurf lesen</Link></p><p><Link to="/warenkorb">Warenkorb bearbeiten</Link></p></div>
    <p>{priceIncreaseNotice}</p>{lines.some(l => l.product.kind === "voucher" && !isValueVoucher(l.product)) && <><p>{massageVoucherPartialNotice}</p><p>{massageVoucherChangeNotice}</p></>}
    <div className="shop-legal-links"><Link to="/agb">AGB</Link><Link to="/datenschutz">Datenschutzerklärung</Link><Link to="/widerruf">Widerrufsbelehrung & Widerrufsformular</Link></div>
    <p>AGB und Widerrufsbelehrung sind ungeprüfte Entwürfe. Die elektronische Widerrufsfunktion fehlt noch. Diese Auswahl ersetzt keine gesonderte Erklärung zu einem vorzeitigen Massagebeginn.</p>
    <label className="check"><input type="checkbox" name="acceptTerms" required/><span>Ich habe den <Link to="/agb">AGB-Entwurf</Link> gelesen (keine Verkaufsfreigabe).</span></label><label className="check"><input type="checkbox" name="acknowledgePrivacy" required/><span>Ich habe die <Link to="/datenschutz">Datenschutzerklärung</Link> zur Kenntnis genommen.</span></label>
    <p>Nach dem Absenden werden Sie zur sicheren Zahlungsseite unseres Zahlungsdienstleisters SumUp weitergeleitet.</p>
    <Button type="submit" variant="outline" className="btn btn-outline" disabled={submitting}>{submitting ? <><Loader2 size={18} className="animate-spin" aria-hidden="true"/> Wird übermittelt …</> : "Zahlungspflichtig bestellen"}</Button>
    {error && <p className="form-error" role="alert">{error}</p>}<p><a href={contact.phoneHref}>{contact.phone}</a> · <a href={mailHref}>{contact.email}</a></p>
  </form></section>;
}
