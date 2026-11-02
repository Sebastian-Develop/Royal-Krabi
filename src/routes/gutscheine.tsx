import { createFileRoute } from "@tanstack/react-router";
import { ShopProductsPage } from "@/components/shop-products";
import { pageHead } from "@/lib/meta";
export const Route = createFileRoute("/gutscheine")({ head: () => pageHead("Massagegutschein Offenbach | Royal Krabi", "Massagegutscheine für Thai-Massagen bei Royal Krabi in Offenbach-Bürgel. Kostenfreier DHL-Versand innerhalb Deutschlands oder Abholung im Studio.", "https://royalkrabi-thaimassage.de/gutscheine"), component: () => <ShopProductsPage kinds={["voucher"]} title="Massagegutschein Offenbach" intro="Schenken Sie Zeit, Ruhe und Wohlbefinden – für besondere Menschen." lead="Gutscheine für ausgewählte Massagen – ein Geschenk, das in Erinnerung bleibt."/> });
