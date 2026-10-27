/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { applicationConfirmation, missingApplicationFields, missingFieldsMessage, orderCheckConfirmation } from "./forms";
import { contact } from "./contact";

describe("Form submission confirmations", () => {
  test("application confirmation uses the approved wording verbatim", () => {
    expect(`${applicationConfirmation.heading} ${applicationConfirmation.body}`)
      .toBe("Vielen Dank für Ihre Bewerbung. Bitte senden Sie Ihre Unterlagen über das geöffnete E-Mail-Fenster an kontakt@royalkrabi-thaimassage.de. Wir melden uns schnellstmöglich bei Ihnen.");
  });
  test("application confirmation names the studio email address", () => expect(applicationConfirmation.body).toContain(contact.email));
  test("complete application reports no missing fields", () =>
    expect(missingApplicationFields({ name: "Sitichai Ayamuang", tel: "069 60511884", email: "sitichai@example.de", msg: "Ich interessiere mich für die Stelle." })).toEqual([]));
  test("empty application names every required field in order", () =>
    expect(missingApplicationFields({ name: "", tel: "", email: "", msg: "" })).toEqual(["Name", "Telefonnummer", "E-Mail-Adresse", "Nachricht"]));
  test("an invalid email address is reported as missing", () =>
    expect(missingApplicationFields({ name: "Anna Berg", tel: "06912345", email: "anna-at-example", msg: "Bewerbung" })).toEqual(["E-Mail-Adresse"]));
  test("missing field message lists the fields", () =>
    expect(missingFieldsMessage(["Name", "E-Mail-Adresse"])).toBe("Bitte füllen Sie noch diese Pflichtfelder aus: Name, E-Mail-Adresse."));
  test("order confirmation never claims the order arrived", () => {
    expect(orderCheckConfirmation.body).toContain("wurde noch nicht übermittelt");
    expect(orderCheckConfirmation.body).not.toContain("haben Ihre Bestellung erhalten");
    expect(orderCheckConfirmation.body).not.toContain("Zahlung erfolgreich");
  });
});
