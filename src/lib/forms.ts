
/**
 * Bestätigung nach dem Absenden des Bewerbungsformulars.
 * Der Text bleibt wörtlich, weil er Besuchern erklärt, wie die Unterlagen ankommen.
 */
export const applicationConfirmation = {
  heading: "Vielen Dank für Ihre Bewerbung.",
  body: "Wir haben Ihre Unterlagen erhalten und melden uns schnellstmöglich bei Ihnen.",
  /** Erscheint nur, wenn die Bestätigungs-E-Mail nachweislich verschickt wurde. */
  emailNote: "Eine Bestätigung haben wir an Ihre E-Mail-Adresse geschickt.",
};

/**
 * Die frühere Bestellformular-Meldung („noch nicht übermittelt") ist entfallen:
 * Das Formular reicht die Bestellung jetzt serverseitig ein und leitet zur
 * SumUp-Zahlungsseite weiter (siehe src/lib/shop-checkout.functions.ts).
 */

export const APPLICATION_FIELD_LABELS = { name: "Name", tel: "Telefonnummer", email: "E-Mail-Adresse", age: "Altersangabe", msg: "Nachricht" } as const;
export type ApplicationValues = { name: string; tel: string; email: string; age: string; msg: string };

/** Altersgruppen im Bewerbungsformular – eine Auswahl ist Pflicht. */
export const APPLICATION_AGES = ["Unter 18", "18–24 Jahre", "25–34 Jahre", "35–44 Jahre", "45–54 Jahre", "55–64 Jahre", "65 Jahre oder älter"];

/** Pflichtfelder der Bewerbung – leere oder unvollständige Angaben werden namentlich zurückgemeldet. */
export const missingApplicationFields = ({ name, tel, email, age, msg }: ApplicationValues): string[] => {
  const missing: string[] = [];
  if (name.trim().length < 2) missing.push(APPLICATION_FIELD_LABELS.name);
  if (tel.trim().length < 5) missing.push(APPLICATION_FIELD_LABELS.tel);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) missing.push(APPLICATION_FIELD_LABELS.email);
  if (!age.trim()) missing.push(APPLICATION_FIELD_LABELS.age);
  if (msg.trim().length < 2) missing.push(APPLICATION_FIELD_LABELS.msg);
  return missing;
};

/** Verständliche Meldung, wenn Pflichtfelder noch fehlen. */
export const missingFieldsMessage = (fields: string[]) =>
  `Bitte füllen Sie noch diese Pflichtfelder aus: ${fields.join(", ")}.`;
