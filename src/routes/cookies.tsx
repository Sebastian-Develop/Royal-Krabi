import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site";
import { pageHead } from "@/lib/meta";

export const Route = createFileRoute("/cookies")({ head: () => pageHead("Datenschutzeinstellungen | Royal Krabi", "Informationen zu technisch notwendigen Speicherungen bei Royal Krabi Serenity Thaimassage.", "/cookies"), component: Page });

function Page() {
  return <><PageHero title="Datenschutzeinstellungen"/><main className="section narrow"><p>Es werden keine optionalen Dienste geladen, für die eine Einwilligung erforderlich ist.</p><p>Weitere Informationen finden Sie in der <Link to="/datenschutz">Datenschutzerklärung</Link>.</p></main></>;
}
