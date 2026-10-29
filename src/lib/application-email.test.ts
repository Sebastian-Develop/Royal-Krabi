import { describe, expect, test } from "bun:test";
import { applicationConfirmationEmail, applicationConfirmationSubject } from "./application-email";
import { applicationConfirmation } from "./forms";

const data = {
  name: "Anna Beispiel",
  tel: "0151 1234567",
  email: "anna@example.com",
  area: "Thai-Masseur/in",
  type: "Teilzeit",
  hasCv: true,
};

describe("Eingangsbestätigung für Bewerbungen", () => {
  test("Betreff nennt den Eingang der Bewerbung", () => {
    expect(applicationConfirmationSubject).toBe("Bewerbungseingang – Royal Krabi Serenity Thaimassage");
  });

  test("Bestätigung nennt Kontaktdaten und die gemachten Angaben", () => {
    const { html, text } = applicationConfirmationEmail(data);
    expect(html).toContain("Vielen Dank für Ihre Bewerbung.");
    expect(html).toContain("Thai-Masseur/in");
    expect(html).toContain("Teilzeit");
    expect(html).toContain("Lebenslauf liegt bei");
    expect(html).toContain("kontakt@royalkrabi-thaimassage.de");
    expect(html).toContain("Offenbacher Str. 32");
    expect(text).toContain("0151 1234567");
  });

  test("Eigene Angaben werden vor HTML-Einschleusung geschützt", () => {
    const { html } = applicationConfirmationEmail({ ...data, name: '<script src="x"></script>' });
    expect(html).not.toContain("<script");
    expect(html).toContain("&lt;script");
  });

  test("Ohne Lebenslauf sagt die Bestätigung das ehrlich", () => {
    const { html, text } = applicationConfirmationEmail({ ...data, hasCv: false });
    expect(html).toContain("Kein Lebenslauf beigefügt");
    expect(text).toContain("Kein Lebenslauf beigefügt");
  });

  test("Bestätigung enthält keine Abmelde- oder Werbungelemente", () => {
    const { html } = applicationConfirmationEmail(data);
    expect(html.toLowerCase()).not.toContain("unsubscribe");
    expect(html).not.toContain("abmelden");
    expect(html).not.toContain("Gutschein");
  });

  test("Kundenbestätigung im Formular bleibt wörtlich erhalten", () => {
    expect(applicationConfirmation.heading).toBe("Vielen Dank für Ihre Bewerbung.");
    expect(applicationConfirmation.body).toBe("Wir haben Ihre Unterlagen erhalten und melden uns schnellstmöglich bei Ihnen.");
    expect(applicationConfirmation.emailNote).toContain("Bestätigung");
  });
});
