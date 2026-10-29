import { createFileRoute } from "@tanstack/react-router";
import { contact } from "@/lib/contact";
import { missingApplicationFields } from "@/lib/forms";
import { applicationConfirmationEmail } from "@/lib/application-email";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = /\.(pdf|docx?)$/i;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const json = (status: number, body: object) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

function toBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

export const Route = createFileRoute("/api/public/bewerbung")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["RESEND_API_KEY"];
        if (!key) return json(500, { error: "Der Versand ist derzeit nicht eingerichtet." });
        let f: FormData;
        try { f = await request.formData(); } catch { return json(400, { error: "Ungültige Anfrage." }); }
        if (String(f.get("website") ?? "")) return json(200, { ok: true }); // Honeypot
        const v = (k: string, max = 200) => String(f.get(k) ?? "").trim().slice(0, max);
        const values = { name: v("name"), tel: v("tel", 50), email: v("email"), age: v("age", 60), msg: v("msg", 5000) };
        if (missingApplicationFields(values).length) return json(400, { error: "Bitte füllen Sie alle Pflichtfelder aus." });
        const area = v("area"), type = v("type");
        const attachments: { filename: string; content: string }[] = [];
        const file = f.get("cv");
        if (file && typeof file !== "string" && file.size > 0) {
          if (!ALLOWED.test(file.name)) return json(400, { error: "Bitte laden Sie den Lebenslauf als PDF, DOC oder DOCX hoch." });
          if (file.size > MAX_BYTES) return json(400, { error: "Der Lebenslauf darf höchstens 5 MB groß sein." });
          attachments.push({ filename: file.name.replace(/[^\w.\- ]/g, "_"), content: toBase64(await file.arrayBuffer()) });
        }
        const rows: [string, string][] = [["Name", values.name], ["Telefon", values.tel], ["E-Mail", values.email], ["Altersangabe", values.age || "-"], ["Gewünschte Stelle", area || "-"], ["Beschäftigungsart", type || "-"]];
        const html = `<h2>Neue Bewerbung</h2><table>${rows.map(([k, x]) => `<tr><td><b>${k}:</b></td><td>${esc(x)}</td></tr>`).join("")}</table><p><b>Nachricht:</b><br>${esc(values.msg).replace(/\n/g, "<br>")}</p><p>${attachments.length ? "Lebenslauf im Anhang." : "Kein Lebenslauf angehängt."}</p>`;
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: process.env["RESEND_FROM"] || "Royal Krabi Bewerbungen <bewerbung@royalkrabi-thaimassage.de>",
            to: [contact.email],
            reply_to: values.email,
            subject: `Bewerbung – ${values.name}`,
            html,
            attachments,
          }),
        });
        if (!res.ok) {
          console.error(`Resend failed [${res.status}]: ${await res.text()}`);
          return json(200, { ok: false,  error: `Die Bewerbung konnte nicht gesendet werden. Bitte versuchen Sie es später erneut oder schreiben Sie an ${contact.email}.` });
        }
        // Automatische Eingangsbestätigung an die Bewerberadresse. Ein Fehler hier entwertet die Bewerbung nicht.
        const confirmation = applicationConfirmationEmail({ name: values.name, tel: values.tel, email: values.email, area, type, hasCv: attachments.length > 0 });
        const conf = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: process.env["RESEND_FROM"] || "Royal Krabi Bewerbungen <bewerbung@royalkrabi-thaimassage.de>",
            to: [values.email],
            reply_to: contact.email,
            subject: confirmation.subject,
            html: confirmation.html,
            text: confirmation.text,
          }),
        });
        if (!conf.ok) console.error(`Confirmation failed [${conf.status}]: ${await conf.text()}`);
        return json(200, { ok: true, confirmationSent: conf.ok });
      },
    },
  },
});
