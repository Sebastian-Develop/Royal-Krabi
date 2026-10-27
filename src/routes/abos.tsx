import { createFileRoute } from "@tanstack/react-router";
import { ShopProductsPage } from "@/components/shop-products";
import { pageHead } from "@/lib/meta";
export const Route = createFileRoute("/abos")({ head: () => pageHead("5er- & 10er-Massage-Abos | Royal Krabi Offenbach", "Vorausbezahlte 5er- und 10er-Massagekarten von Royal Krabi in Offenbach-Bürgel mit Preisvorteil, ohne automatische Verlängerung.", "https://royalkrabi-thaimassage.de/abos"), component: () => <ShopProductsPage kinds={["five", "ten"]} title="Abos" intro="Regelmäßige Erholung mit Preisvorteil – für Ihre persönliche Auszeit." lead="Vorausbezahlte Mehrfachkarten ohne automatische Verlängerung."/> });
