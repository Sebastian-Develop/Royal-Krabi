import { createFileRoute } from "@tanstack/react-router"; import { LegalPage } from "@/components/legal-page"; import { AddressLink } from "@/components/site"; import { pageHead } from "@/lib/meta"; import { contact, mailHrefPlain } from "@/lib/contact";
export const Route=createFileRoute("/impressum")({head:()=>pageHead("Impressum | Royal Krabi Serenity Thaimassage","Impressum von Royal Krabi Serenity Thaimassage, Offenbacher Str. 32, 63075 Offenbach am Main.","/impressum"),component:Page});
function Page(){return <LegalPage title="Impressum" sections={[
{title:"Angaben gemäß § 5 DDG",body:<p>{contact.name}<br/>Betreiber: {contact.owner}<br/><AddressLink block>{contact.street}<br/>{contact.city}</AddressLink><br/>Deutschland<br/>[Rechtsform, falls vorhanden]</p>},
{title:"Kontakt",body:<p>Telefon: <a href={contact.phoneHref}>{contact.phone}</a><br/>E-Mail: <a href={mailHrefPlain}>{contact.email}</a><br/>Website: <a href={contact.website}>{contact.website}</a></p>},
{title:"Umsatzsteuer-ID",body:<p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: [Umsatzsteuer-ID, falls vorhanden]</p>},
{title:"Aufsichtsbehörde / Register",body:<p>[Aufsichtsbehörde, falls erforderlich]<br/>[Registergericht und Registernummer, falls vorhanden]</p>},
{title:"Verantwortlich für den Inhalt",body:<p>{contact.owner}<br/><AddressLink block>{contact.street}<br/>{contact.city}</AddressLink><br/>Deutschland</p>},
{title:"Urheberrechte",body:<p>Die Inhalte dieser Website unterliegen dem deutschen Urheberrecht. Eine Nutzung außerhalb der gesetzlichen Erlaubnisse bedarf der Zustimmung des jeweiligen Rechteinhabers. Rechte Dritter sind zu beachten.</p>},
{title:"Externe Links",body:<p>Für Inhalte verlinkter Websites sind deren jeweilige Betreiber verantwortlich. Wenn uns konkrete Rechtsverletzungen bekannt werden, prüfen wir den betreffenden Link und entfernen ihn gegebenenfalls.</p>},
{title:"Verbraucherstreitbeilegung",body:<p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen. [Vor Veröffentlichung prüfen]</p>},
]}/>}
