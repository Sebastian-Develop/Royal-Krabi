/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { APPLICATION_AGES, applicationConfirmation, missingApplicationFields, missingFieldsMessage, orderCheckConfirmation } from "./forms";

const complete = { name: "Sitichai Ayamuang", tel: "069 60511884", email: "sitichai@example.de", age: "25–34 Jahre", msg: "Ich interessiere mich für die Stelle." };

describe("Form submission confirmations", () => {
  test("application confirmation uses the approved wording verbatim", () => {
    expect(`${applicationConfirmation.heading} ${applicationConfirmation.body}`)
      .toBe("Vielen Dank für Ihre Bewerbung. Wir haben Ihre Unterlagen erhalten und melden uns schnellstmöglich bei Ihnen.");
  });
  test("complete application reports no missing fields", () =>
    expect(missingApplicationFields(complete)).toEqual([]));
  test("empty application names every required field in order", () =>
    expect(missingApplicationFields({ name: "", tel: "", email: "", age: "", msg: "" }))
      .toEqual(["Name", "Telefonnummer", "E-Mail-Adresse", "Altersangabe", "Nachricht"]));
  test("an invalid email address is reported as missing", () =>
    expect(missingApplicationFields({ ...complete, email: "anna-at-example" })).toEqual(["E-Mail-Adresse"]));
  test("age selection is required", () =>
    expect(missingApplicationFields({ ...complete, age: "" })).toEqual(["Altersangabe"]));
  test("age choices cover every age group and none is blank", () => {
    expect(APPLICATION_AGES).toEqual(["Unter 18", "18–24 Jahre", "25–34 Jahre", "35–44 Jahre", "45–54 Jahre", "55–64 Jahre", "65 Jahre oder älter"]);
    expect(APPLICATION_AGES.every((a) => a.trim().length > 0)).toBe(true);
  });
  test("missing field message lists the fields", () =>
    expect(missingFieldsMessage(["Name", "E-Mail-Adresse"])).toBe("Bitte füllen Sie noch diese Pflichtfelder aus: Name, E-Mail-Adresse."));
  test("order confirmation never claims the order arrived", () => {
    expect(orderCheckConfirmation.body).toContain("wurde noch nicht übermittelt");
    expect(orderCheckConfirmation.body).not.toContain("haben Ihre Bestellung erhalten");
    expect(orderCheckConfirmation.body).not.toContain("Zahlung erfolgreich");
  });
});
