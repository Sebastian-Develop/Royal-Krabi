import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site";
import { ShopOrderForm } from "@/components/shop-order-form";
import { useCart } from "@/lib/cart";
import { pageHead } from "@/lib/meta";

export const Route = createFileRoute("/checkout")({ head: () => { const h = pageHead("Kasse | Royal Krabi Gutscheine & Massage-Abos", "Bestellformular und Bestellübersicht für Gutscheine und vorausbezahlte Massagekarten von Royal Krabi.", "https://royalkrabi-thaimassage.de/checkout"); return { ...h, meta: [...h.meta, { name: "robots", content: "noindex" }] }; }, component: Page });

function Page() {
  const { cart } = useCart();
  return <><PageHero title="Kasse"/><main className="section container shop-page"><ShopOrderForm cart={cart}/></main></>;
}
