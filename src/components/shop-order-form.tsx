import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { contact, mailHref } from "@/lib/contact";
import { cartLines, cartTotal, type CartItem } from "@/lib/cart";
import { orderSchema, shippingNotice, validityNotice } from "@/lib/shop";

export function ShopOrderForm({ cart }: { cart: CartItem[] }) {
  const [delivery, setDelivery] = useState("pickup");
  const [error, setError] = useState("");
  const lines = cartLines(cart);
  function validate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lines.length) return setError("Ihr Warenkorb ist leer.");
    const form = new FormData(event.currentTarget);
    const result = orderSchema.safeParse({ ...Object.fromEntries(form), productId: lines[0]?.product.id, acceptTerms: form.get("acceptTerms") === "on", acknowledgePrivacy: form.get("acknowledgePrivacy") === "on" });
    setError(result.success ? "Ihre Angaben sind vollständig. Online-Zahlung wird derzeit eingerichtet; Ihre Bestellung wurde noch nicht übermittelt. Bitte kontaktieren Sie uns." : result.error.issues[0]?.message ?? "Bitte prüfen Sie Ihre Angaben.");
  }
  return <section className="shop-order" id="bestellformular" aria-labelledby="order-title"><div className="shop-section-heading"><span className="eyebrow">KASSE</span><h2 id="order-title">Bestellformular</h2><p>Ihre Bestellung wird von uns persönlich geprüft und angenommen. Die Formularabsendung allein ist keine Annahme Ihrer Bestellung.</p></div><form onSubmit={validate}>
    <div className="form-grid"><label className="field"><span>Vor- und Nachname *</span><input name="fullName" autoComplete="name" required maxLength={100}/></label><label className="field"><span>E-Mail-Adresse *</span><input name="email" type="email" autoComplete="email" required maxLength={255}/></label><label className="field"><span>Telefonnummer *</span><input name="phone" type="tel" autoComplete="tel" required maxLength={40}/></label></div><fieldset><legend>Lieferart *</legend><label className="check"><input type="radio" name="delivery" value="pickup" checked={delivery === "pickup"} onChange={() => setDelivery("pickup")}/><span>Abholung im Studio</span></label><label className="check"><input type="radio" name="delivery" value="post" checked={delivery === "post"} onChange={() => setDelivery("post")}/><span>Versand innerhalb Deutschlands (DHL, kostenfrei)</span></label></fieldset>
    <input type="hidden" name="country" value="DE"/>
    {delivery === "post" ? <><div className="form-grid"><label className="field"><span>Straße und Hausnummer *</span><input name="street" autoComplete="address-line1" required maxLength={150}/></label><label className="field"><span>Postleitzahl *</span><input name="postalCode" autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{5}" required maxLength={5}/></label><label className="field"><span>Ort *</span><input name="city" autoComplete="address-level2" required maxLength={100}/></label></div><p className="shop-delivery-note">{shippingNotice}</p></> : <><input type="hidden" name="street" value=""/><input type="hidden" name="postalCode" value=""/><input type="hidden" name="city" value=""/><p className="shop-delivery-note">Wir melden uns nach Prüfung des Zahlungseingangs, um einen Abholtermin abzustimmen.</p></>}
    <div className="form-grid"><label className="field"><span>Empfängername (optional)</span><input name="recipient" maxLength={100}/></label><label className="field"><span>Geschenktext (optional)</span><textarea name="giftText" rows={3} maxLength={500}/></label></div><label className="field"><span>Anmerkungen (optional)</span><textarea name="notes" rows={3} maxLength={1000}/></label>
    <div className="shop-order-summary" aria-label="Bestellübersicht"><strong>Bestellübersicht</strong>
      {lines.length ? <table className="order-table"><thead><tr><th>Produkt</th><th>Menge</th><th>Einzelpreis</th><th>Zwischensumme</th></tr></thead><tbody>{lines.map(l => <tr key={l.product.id}><td>{l.product.kind === "voucher" ? "Gutschein" : l.product.kind === "five" ? "5er-Abo" : "10er-Abo"}: {l.product.name}</td><td>{l.quantity}</td><td>{l.unitPrice} €</td><td>{l.subtotal} €</td></tr>)}</tbody><tfoot><tr><td colSpan={3}>Gesamtsumme</td><td><strong>{cartTotal(cart)} €</strong></td></tr></tfoot></table> : <p>Ihr Warenkorb ist leer. <Link to="/gutscheine">Zu den Gutscheinen</Link> · <Link to="/abos">Zu den Abos</Link></p>}
      <p>Versand innerhalb Deutschlands mit DHL, kostenfrei.</p><p>{validityNotice}</p><p><Link to="/warenkorb">Warenkorb bearbeiten</Link></p></div>
    <div className="shop-legal-links"><Link to="/agb">AGB</Link><Link to="/datenschutz">Datenschutzerklärung</Link><Link to="/widerruf">Widerrufsbelehrung & Widerrufsformular</Link></div>
    <label className="check"><input type="checkbox" name="acceptTerms" required/><span>Ich habe die <Link to="/agb">AGB</Link> gelesen und akzeptiere sie.</span></label><label className="check"><input type="checkbox" name="acknowledgePrivacy" required/><span>Ich habe die <Link to="/datenschutz">Datenschutzerklärung</Link> zur Kenntnis genommen.</span></label>
    <p className="shop-unavailable">Online-Zahlung wird derzeit eingerichtet. Bitte kontaktieren Sie uns.</p><Button type="submit" variant="outline" className="btn btn-outline">Angaben prüfen</Button>{error && <p role="status" className="shop-form-status">{error}</p>}<p><a href={contact.phoneHref}>{contact.phone}</a> · <a href={mailHref}>{contact.email}</a></p>
  </form></section>;
}
