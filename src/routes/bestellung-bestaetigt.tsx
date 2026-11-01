import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { PageHero, ContactButtons } from "@/components/site";
import { pageHead } from "@/lib/meta";
import { getShopOrderStatus, type ShopOrderStatus } from "@/lib/shop-checkout.functions";

export const Route = createFileRoute("/bestellung-bestaetigt")({
  validateSearch: (search: Record<string, unknown>) => ({
    bestellung: typeof search["bestellung"] === "string" ? (search["bestellung"] as string) : "",
    schluessel: typeof search["schluessel"] === "string" ? (search["schluessel"] as string) : "",
  }),
  head: () => { const h = pageHead("Bestellstatus | Royal Krabi Serenity Thaimassage", "Status Ihrer Gutschein- oder Massagekartenbestellung bei Royal Krabi.", "https://royalkrabi-thaimassage.de/bestellung-bestaetigt"); return { ...h, meta: [...h.meta, { name: "robots", content: "noindex" }] }; },
  component: Page,
});

const STATUS_TEXT: Record<ShopOrderStatus, { heading: string; body: string }> = {
  paid: {
    heading: "Ihre Zahlung ist bestätigt.",
    body: "Vielen Dank! Ihre Zahlung wurde von unserem Zahlungsdienstleister bestätigt. Ihre Bestellung wird nun von uns persönlich geprüft und angenommen. Versandbestellungen geben wir in der Regel innerhalb von 3 Werktagen bei DHL ein; eine Abholung stimmen wir persönlich mit Ihnen ab.",
  },
  pending: {
    heading: "Ihre Zahlung wird noch geprüft.",
    body: "Die Zahlung ist bei unserem Zahlungsdienstleister noch nicht als abgeschlossen gemeldet. Bitte laden Sie diese Seite in einigen Minuten erneut. Sollte der Betrag abgebucht worden sein, prüfen wir den Vorgang und melden uns bei Ihnen.",
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
  const [status, setStatus] = useState<ShopOrderStatus | "loading" | "none">(bestellung && schluessel ? "loading" : "none");

  useEffect(() => {
    if (!bestellung || !schluessel) return;
    let cancelled = false;
    checkStatus({ data: { orderId: bestellung, token: schluessel } })
      .then(result => { if (!cancelled) setStatus(result.status); })
      .catch(() => { if (!cancelled) setStatus("pending"); });
    return () => { cancelled = true; };
  }, [bestellung, schluessel, checkStatus]);

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
    </>}
    <ContactButtons/>
    <p><Link to="/gutscheine">Zu den Gutscheinen</Link> · <Link to="/abos">Zu den Abos</Link></p>
  </main></>;
}
