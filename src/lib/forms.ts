import { contact } from "./contact";

/**
 * Bestätigung nach dem Absenden des Bewerbungsformulars.
 * Der Text bleibt wörtlich, weil er Besuchern erklärt, wie die Unterlagen ankommen.
 */
export const applicationConfirmation = {
  heading: "Vielen Dank für Ihre Bewerbung.",
  body: `Bitte senden Sie Ihre Unterlagen über das geöffnete E-Mail-Fenster an ${contact.email}. Wir melden uns schnellstmöglich bei Ihnen.`,
};

/**
 * Bestätigung nach der Prüfung des Bestellformulars.
 * Sie darf nicht behaupten, die Bestellung sei eingegangen – gezahlt wird noch nicht online.
 */
export const orderCheckConfirmation = {
  heading: "Vielen Dank für Ihre Angaben.",
  body: "Ihre Bestellung wurde noch nicht übermittelt, da die Online-Zahlung derzeit eingerichtet wird. Bitte kontaktieren Sie uns telefonisch oder per E-Mail – wir helfen Ihnen gerne weiter.",
};

export const APPLICATION_FIELD_LABELS = { name: "Name", tel: "Telefonnummer", email: "E-Mail-Adresse", msg: "Nachricht" } as const;
export type ApplicationValues = { name: string; tel: string; email: string; msg: string };

/** Pflichtfelder der Bewerbung – leere oder unvollständige Angaben werden namentlich zurückgemeldet. */
export const missingApplicationFields = ({ name, tel, email, msg }: ApplicationValues): string[] => {
  const missing: string[] = [];
  if (name.trim().length < 2) missing.push(APPLICATION_FIELD_LABELS.name);
  if (tel.trim().length < 5) missing.push(APPLICATION_FIELD_LABELS.tel);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) missing.push(APPLICATION_FIELD_LABELS.email);
  if (msg.trim().length < 2) missing.push(APPLICATION_FIELD_LABELS.msg);
  return missing;
};

/** Verständliche Meldung, wenn Pflichtfelder noch fehlen. */
export const missingFieldsMessage = (fields: string[]) =>
  `Bitte füllen Sie noch diese Pflichtfelder aus: ${fields.join(", ")}.`;
