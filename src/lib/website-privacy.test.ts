import { expect, test } from 'bun:test';
import { legalTextsFor, WEBSITE_LEGAL_VERSION } from './legal-texts';
import { websitePrivacySections } from './website-privacy';

test('website service removal never alters stored order privacy versions', () => {
  const before = legalTextsFor(WEBSITE_LEGAL_VERSION);
  websitePrivacySections();
  expect(legalTextsFor(WEBSITE_LEGAL_VERSION)).toEqual(before);
  expect(before.datenschutz?.find(section => section.title.startsWith('7.'))?.paragraphs.length).toBe(3);
});