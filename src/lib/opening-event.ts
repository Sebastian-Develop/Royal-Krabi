import { openingPaymentNotice } from "./purchase-rules";
import { contact } from "./contact";

/** Studio opening event copy. Event time stays null until the owner confirms it; never reuse business hours. */
export const openingEvent = {
  tagline: "Wo thailändische Tradition auf königliche Ruhe trifft",
  heading: "Thaimassage Offenbach",
  subheading: "Ein Stück Thailand kommt nach Offenbach-Bürgel",
  date: "07.11.2026",
  time: "07.11.2026 · 11:00 Uhr",
  invitation: "Wir eröffnen am 07.11.2026 um 11:00 Uhr! Ihr seid alle herzlich eingeladen. Wir freuen uns darauf, euch bei Royal Krabi Serenity Thaimassage in Offenbach-Bürgel willkommen zu heißen!",
  freeEntry: "Eintritt frei – bringen Sie gerne Familie und Freunde mit!",
  location: "Offenbacher Straße 32 · 63075 Offenbach am Main – Bürgel",
  programHeading: "Das erwartet Sie am Eröffnungstag",
  program: [
    { icon: "snacks", title: "Thailändische Snacks", text: "Genießen Sie kleine thailändische Snacks und Spezialitäten." },
    { icon: "dance", title: "Traditioneller Thai-Tanz", text: "Erleben Sie ein Stück thailändischer Kultur." },
    { icon: "studio", title: "Unser Studio entdecken", text: "Werfen Sie einen Blick in unsere neuen Räume und lernen Sie die Atmosphäre von Royal Krabi kennen." },
    { icon: "advice", title: "Persönlich beraten lassen", text: "Entdecken Sie unser Massageangebot und reservieren Sie Ihren Wunschtermin direkt vor Ort." },
  ] as const,
  offer: {
    heading: "20 % Neueröffnungsrabatt",
    percent: 20,
    minMinutes: 60,
    code: "ROYALKRABI20",
    text: "Auf berechtigte Massageangebote und Massagegutscheine mit festgelegter Dauer ab 60 Minuten sowie 5er/10er Royalpässe. Berechnungsbasis ist der ausgewiesene Verkaufs- beziehungsweise Paketpreis.",
    aboNote: "Code ROYALKRABI20. Bei Royalpässen gilt die Mindestdauer von 60 Minuten je Massage. Kein Eröffnungsrabatt auf Wertgutschein · Wunschbetrag.",
    validFrom: "2026-11-07",
    validUntil: "2026-11-21",
    validity: openingPaymentNotice,
    invite: "Lernen Sie uns am Eröffnungstag persönlich kennen und reservieren Sie Ihren nächsten Wohlfühltermin direkt vor Ort.",
  },
  hoursHeading: "Unsere regulären Öffnungszeiten ab der Eröffnung",
  hoursOpen: contact.hoursOpen,
  hoursClosed: "Sonntag und Montag: geschlossen",
  appointmentNote: "Massagen nur nach vorheriger Terminvereinbarung – telefonisch oder per WhatsApp.",
  shareText: "Lust, mitzukommen? Royal Krabi Serenity Thaimassage feiert am 07.11.2026 Neueröffnung in Offenbach-Bürgel! Mit kleinen Thai-Snacks, traditionellem Thai-Tanz und Einblicken ins neue Studio. Eintritt frei – alle sind herzlich willkommen. Offenbacher Straße 32, 63075 Offenbach am Main. Flyer ansehen: https://royalkrabi-thaimassage.de/flyer — Alle Infos: https://royalkrabi-thaimassage.de",
};

export const whatsappContactHref = "https://wa.me/496960511884";
/** Opens WhatsApp's own share/contact picker; nothing is sent automatically. */
export const whatsappShareHref = `https://wa.me/?text=${encodeURIComponent(openingEvent.shareText)}`;
