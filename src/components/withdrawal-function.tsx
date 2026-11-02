import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { contact } from "@/lib/contact";
import { submitWithdrawal } from "@/lib/withdrawal-request.functions";
import { formatReceivedAt, withdrawalDeclaration, withdrawalReceiptNotice, withdrawalRequestSchema } from "@/lib/withdrawal-request";

type Receipt = { id: string; receivedAt: string; fullName: string; email: string; orderReference: string };

export function WithdrawalFunction() {
  const submit = useServerFn(submitWithdrawal);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", orderReference: "", remark: "", declarationConfirmed: false });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = withdrawalRequestSchema.safeParse(form);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Bitte Eingaben prüfen."); return; }
    setError(""); setBusy(true);
    try {
      const res = await submit({ data: parsed.data });
      if (res.ok) setReceipt(res); else setError(res.error);
    } catch { setError(`Der Widerruf konnte gerade nicht gesendet werden. Bitte per E-Mail an ${contact.email} widerrufen.`); }
    finally { setBusy(false); }
  }

  if (receipt) return <div className="withdrawal-receipt" role="status">
    <p><b>Eingangsbestätigung</b></p>
    <p>{withdrawalReceiptNotice}</p>
    <p>Eingegangen am: {formatReceivedAt(receipt.receivedAt)}<br/>Vorgangsnummer: {receipt.id}<br/>Name: {receipt.fullName}<br/>E-Mail: {receipt.email}<br/>Bestellkennung: {receipt.orderReference}<br/>Erklärung: „{withdrawalDeclaration}“</p>
  </div>;

  if (!open) return <Button className="btn btn-primary" onClick={() => setOpen(true)}>Vertrag widerrufen</Button>;

  return <form className="withdrawal-online-form" onSubmit={onSubmit} noValidate>
    <label>Vorname und Name *<input required value={form.fullName} onChange={set("fullName")} autoComplete="name" maxLength={120}/></label>
    <label>E-Mail-Adresse *<input required type="email" value={form.email} onChange={set("email")} autoComplete="email" maxLength={255}/></label>
    <label>Bestellnummer oder andere eindeutige Bestellkennung *<input required value={form.orderReference} onChange={set("orderReference")} maxLength={200} placeholder="z. B. Bestellnummer oder Kaufdatum und Produkt"/></label>
    <label className="withdrawal-declaration"><input type="checkbox" checked={form.declarationConfirmed} onChange={set("declarationConfirmed")}/> {withdrawalDeclaration} *</label>
    <label>Bemerkung (optional)<textarea value={form.remark} onChange={set("remark")} maxLength={2000} rows={3}/></label>
    <p className="withdrawal-hint">Eine Begründung ist nicht erforderlich.</p>
    {error && <p className="withdrawal-error" role="alert">{error}</p>}
    <Button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Wird gesendet …" : "Widerruf bestätigen"}</Button>
  </form>;
}
