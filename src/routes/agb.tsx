import { createFileRoute } from '@tanstack/react-router';
import { LegalPage } from '@/components/legal-page';
import { LegalText } from '@/components/legal-text';
import { legalTextsFor, WEBSITE_LEGAL_VERSION } from '@/lib/legal-texts';
import { pageHead } from '@/lib/meta';
export const Route = createFileRoute('/agb')({ head: () => pageHead('Allgemeine Geschäftsbedingungen | Royal Krabi Serenity Thaimassage', 'Allgemeine Geschäftsbedingungen von Royal Krabi Serenity Thaimassage in Offenbach.', '/agb'), component: Page });
function Page() {
 const sections = legalTextsFor(WEBSITE_LEGAL_VERSION).agb ?? [];
 return <LegalPage title="Allgemeine Geschäftsbedingungen" sections={sections.map(section => ({ title: section.title, body: <>{section.paragraphs.map((text,i) => <p key={i}><LegalText text={text}/></p>)}</> }))}/>;
}
