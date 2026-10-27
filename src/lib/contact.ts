export const contact = {
  name: "Royal Krabi Serenity Thaimassage",
  owner: "Jirayut Rudklang",
  street: "Offenbacher Str. 32",
  city: "63075 Offenbach am Main",
  phone: "069 60511884",
  phoneHref: "tel:+496960511884",
  email: "kontakt@royalkrabi-thaimassage.de",
  website: "https://www.royalkrabi-thaimassage.de",
  hoursOpen: "Dienstag bis Samstag: 10:00–20:00 Uhr",
  hoursShort: "Di.–Sa.: 10:00–20:00 Uhr",
  hoursShortClosed: "So. & Mo.: geschlossen",
  hoursClosed: "Sonntag und Montag geschlossen",
  appointmentRule: "Massagen nur nach vorheriger Terminvereinbarung",
};

/** Single source for the studio route. Every displayed address links to this exact URL. */
export const mapsRouteUrl = "https://www.google.com/maps/dir/?api=1&destination=Offenbacher+Str.+32%2C+63075+Offenbach+am+Main";
/** Screen-reader and tooltip hint for address links. */
export const mapsRouteHint = "Route zu Royal Krabi Serenity Thaimassage in Google Maps öffnen";

export const emailSubject = "Anfrage Termin – Royal Krabi Serenity Thaimassage";

export const emailTemplate = `Guten Tag,

ich möchte gerne einen Termin für eine Thai-Massage vereinbaren.

Mein gewünschter Termin:
Datum:
Uhrzeit:

Gewünschte Massage:

Anzahl der Personen:

Mein Name:
Telefonnummer:

Bitte bestätigen Sie mir gerne, ob der Termin verfügbar ist.

Vielen Dank und freundliche Grüße
[Name]`;

export const mailHref = `mailto:${contact.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailTemplate)}`;
/** All email links open the prefilled template. */
export const mailHrefPlain = mailHref;

/** Withdrawal contact must not open the appointment request template. */
export const withdrawalMailHref = `mailto:${contact.email}?subject=${encodeURIComponent("Widerruf – Royal Krabi Serenity Thaimassage")}`;

/** Signature massage inquiry: standard appointment request with the massage prefilled. */
export const signatureMassageName = "Royal Sound Healing – Royal Krabi Signature";
export const signatureMailHref = `mailto:${contact.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailTemplate.replace("Gewünschte Massage:", `Gewünschte Massage: ${signatureMassageName}`))}`;
