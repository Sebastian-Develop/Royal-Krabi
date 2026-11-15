import { legalTextsFor, WEBSITE_LEGAL_VERSION } from './legal-texts';

/** Website-only service removal; stored order versions and PDFs stay immutable. */
export function websitePrivacySections() {
  return (legalTextsFor(WEBSITE_LEGAL_VERSION).datenschutz ?? []).map(section => ({
    ...section,
    paragraphs: section.paragraphs
      .filter(text => !text.startsWith('Live-Chat ('))
      .map(text => text.startsWith('Die Website speichert Ihre Auswahl in den Datenschutzeinstellungen')
        ? 'Die Website lädt keine optionalen Live-Chat-Dienste. Die bisherige Speicherung einer Chat-Einwilligung entfällt.'
        : text),
  }));
}