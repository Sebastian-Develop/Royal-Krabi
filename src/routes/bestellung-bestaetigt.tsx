import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { PageHero, ContactButtons } from "@/components/site";
import { pageHead } from "@/lib/meta";
import { getShopOrderStatus, type ShopOrderStatusResult } from "@/lib/shop-checkout.functions";

export const Route = createFileRoute("/bestellung-bestaetigt")({
  validateSearch: (search: Record<string, unknown>) => ({
    bestellung: typeof search["bestellung"] === "string" ? (search["bestellung"] as string) : "",
    schluessel: typeof search["schluessel"] === "string" ? (search["schluessel"] as string) : "",
  }),
  head: () => { const h = pageHead("Bestellstatus | Royal Krabi Serenity Thaimassage", "Status Ihrer Gutschein- oder Massagekartenbestellung bei Royal Krabi.", "https://royalkrabi-thaimassage.de/bestellung-bestaetigt"); return { ...h, meta: [...h.meta, { name: "robots", content: "noindex" }] }; },
  component: Page,
});

const berlinDateTime = (iso: string) =>
  new Date(iso).toLocaleString("de-DE", { timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) + " Uhr";

const STATUS_TEXT: Record<ShopOrderStatusResult["status"], { heading: string; body: string }> = {
  paid: {
    heading: "Ihre Bestellung und Zahlung sind bestätigt.",
    body: "Vielen Dank! Ihre Zahlung wurde von unserem Zahlungsdienstleister bestätigt. Sie erhalten eine E-Mail mit Ihrer Bestellzusammenfassung und allen Unterlagen als PDF-Anhang. Ihre Bestellung wird nun von uns persönlich geprüft und angenommen. Versandbestellungen geben wir in der Regel innerhalb von 3 Werktagen bei DHL ein; eine Abholung stimmen wir persönlich mit Ihnen ab. Gültigkeit und Nutzungsbedingungen richten sich nach unseren AGB.",
  },
  pending: {
    heading: "Ihre Bestellung ist eingegangen – Zahlung ausstehend.",
    body: "Wir haben Ihre Bestellung gespeichert. Die Zahlung ist bei unserem Zahlungsdienstleister noch nicht als abgeschlossen gemeldet. Bitte laden Sie diese Seite in einigen Minuten erneut. Sollte der Betrag abgebucht worden sein, prüfen wir den Vorgang und melden uns bei Ihnen.",
  },
  failed: {
    heading: "Die Zahlung ist leider fehlgeschlagen.",
    body: "Die Zahlung konnte nicht abgeschlossen werden. Es wurde kein Betrag bestätigt. Bitte versuchen Sie die Bestellung erneut oder kontaktieren Sie uns – wir helfen Ihnen gerne weiter.",
  },
  not_found: {
    heading: "Bestellung nicht gefunden.",
    body: "Zu diesem Link konnten wir keine Bestellung finden. Bitte prüfen Sie den Link oder kontaktieren Sie uns.",
  },
};

function Page() {
  const { bestellung, schluessel } = Route.useSearch();
  const checkStatus = useServerFn(getShopOrderStatus);
  const [result, setResult] = useState<ShopOrderStatusResult | "loading" | "none">(bestellung && schluessel ? "loading" : "none");

  useEffect(() => {
    if (!bestellung || !schluessel) return;
    let cancelled = false;
    checkStatus({ data: { orderId: bestellung, token: schluessel } })
      .then(r => { if (!cancelled) setResult(r); })
      .catch(() => { if (!cancelled) setResult({ status: "pending" }); });
    return () => { cancelled = true; };
  }, [bestellung, schluessel, checkStatus]);

  const status = typeof result === "string" ? result : result.status;
  const orderedAt = typeof result === "object" ? result.orderedAt : undefined;
  const paidAt = typeof result === "object" ? result.paidAt : undefined;

  return <><PageHero title="Ihre Bestellung"/><main className="section narrow shop-thanks">
    {status === "none" && <>
      <h2>Persönlich für Sie da</h2>
      <p>Diese Seite zeigt den Status einer Online-Bestellung. Ohne Bestelllink können wir hier keinen Status anzeigen.</p>
      <p>Bei Fragen erreichen Sie uns über unsere <Link to="/kontakt">Kontaktseite</Link>.</p>
    </>}
    {status === "loading" && <><h2>Zahlungsstatus wird geprüft …</h2><p>Einen Moment bitte – wir fragen den Status Ihrer Zahlung bei unserem Zahlungsdienstleister ab.</p></>}
    {status !== "none" && status !== "loading" && <>
      <h2>{STATUS_TEXT[status].heading}</h2>
      <p>{STATUS_TEXT[status].body}</p>
      {orderedAt && <p><small>Bestellung eingegangen am {berlinDateTime(orderedAt)}{paidAt ? ` · Zahlung bestätigt am ${berlinDateTime(paidAt)}` : ""}</small></p>}
    </>}
    <ContactButtons/>
    <p><Link to="/gutscheine">Zu den Gutscheinen</Link> · <Link to="/abos">Zu den Abos</Link></p>
  </main></>;
}
