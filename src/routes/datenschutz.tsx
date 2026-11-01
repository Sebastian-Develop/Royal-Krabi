import { createFileRoute } from '@tanstack/react-router';
import { LegalPage } from '@/components/legal-page';
import { LegalText } from '@/components/legal-text';
import { legalTextsFor, WEBSITE_LEGAL_VERSION } from '@/lib/legal-texts';
import { pageHead } from '@/lib/meta';
export const Route = createFileRoute('/datenschutz')({ head: () => pageHead('Datenschutzerklärung | Royal Krabi Serenity Thaimassage', 'Informationen zum Datenschutz bei Royal Krabi Serenity Thaimassage in Offenbach.', '/datenschutz'), component: Page });
function Page() {
 const sections = legalTextsFor(WEBSITE_LEGAL_VERSION).datenschutz ?? [];
 return <LegalPage title="Datenschutzerklärung" sections={sections.map(section => ({ title: section.title, body: <>{section.paragraphs.map((text,i) => <p key={i}><LegalText text={text}/></p>)}</> }))}/>;
}
