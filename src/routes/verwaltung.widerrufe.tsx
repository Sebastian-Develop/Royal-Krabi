import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RefreshCw, LogOut, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { listWithdrawals, updateWithdrawalHandling, previewWithdrawalEmailRetry, retryWithdrawalEmail } from "@/lib/withdrawal-admin.functions";
import { formatReceivedAt } from "@/lib/withdrawal-request";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { EmailHistory } from "@/lib/order-dispatch";
import { OrderDispatchAdmin } from "@/components/order-dispatch-admin";

export const Route = createFileRoute("/verwaltung/widerrufe")({
  validateSearch: (s: Record<string, unknown>) => ({ order: typeof s["order"] === "string" && /^[a-f0-9-]{36}$/i.test(s["order"]) ? s["order"] : undefined, withdrawal: typeof s["withdrawal"] === "string" && /^[a-f0-9-]{36}$/i.test(s["withdrawal"]) ? s["withdrawal"] : undefined }),
  head: () => ({ meta: [
    { title: "Betreiberverwaltung | Royal Krabi" },
    { name: "description", content: "Geschützte Betreiberverwaltung der Bestellungen und elektronischen Widerrufe von Royal Krabi Serenity Thaimassage." },
    { property: "og:title", content: "Betreiberverwaltung | Royal Krabi" },
    { property: "og:description", content: "Geschützter Betreiberbereich für Bestellungen und Widerrufe." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  const [resetMode, setResetMode] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<string | null>(search.withdrawal ?? null);
  const [status, setStatus] = useState<"open" | "processed">("open");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"withdrawals" | "orders">(search.order ? "orders" : "withdrawals");
  const list = useServerFn(listWithdrawals);
  const previewRetry = useServerFn(previewWithdrawalEmailRetry);
  const retryMail = useServerFn(retryWithdrawalEmail);
  const [retryPreview, setRetryPreview] = useState<Awaited<ReturnType<typeof previewWithdrawalEmailRetry>> | null>(null);
  const update = useServerFn(updateWithdrawalHandling);
  const query = useQuery({ queryKey: ["operator-withdrawals"], queryFn: () => list(), enabled: signedIn, retry: false });
  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => { setSignedIn(Boolean(data.user)); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => { setSignedIn(Boolean(session)); });
    return () => data.subscription.unsubscribe();
  }, []);
  const row = query.data?.find(r => r.id === selected);
  useEffect(() => { if (row) { setStatus(row.handling_status === "processed" ? "processed" : "open"); setNotes(row.internal_notes); } }, [row?.id]);
  async function login(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setPassword(""); setBusy(false);
    if (error) setError(error.message === "Invalid login credentials" ? "E-Mail oder Passwort nicht korrekt. Bitte den bestätigten Betreiberzugang verwenden oder Passwort zurücksetzen." : error.message);
  }
  async function logout() {
    await queryClient.cancelQueries();
    queryClient.clear();
    queryClient.removeQueries({ queryKey: ["operator-withdrawals"] });
    queryClient.removeQueries({ queryKey: ["operator-orders"] });
    setSelected(null); setSignedIn(false);
    await supabase.auth.signOut();
    await router.navigate({ to: "/verwaltung/widerrufe", search: { order: undefined, withdrawal: undefined }, replace: true });
  }
  async function save(e: React.FormEvent) {
    e.preventDefault(); if (!row) return;
    setBusy(true); setError(""); setSaved(false);
    try { await update({ data: { id: row.id, status, notes } }); await query.refetch(); setSaved(true); }
    catch { setError("Änderungen konnten nicht gespeichert werden."); }
    finally { setBusy(false); }
  }
  return <main className="container pb-14 pt-36 md:pt-44">
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl text-primary">Betreiberverwaltung</h1>
      {signedIn && <div className="flex gap-2"><Button variant="outline" aria-label="Aktualisieren" onClick={() => { void query.refetch(); void queryClient.invalidateQueries({ queryKey: ["operator-orders"] }); }}><RefreshCw size={18}/></Button><Button variant="outline" onClick={() => void logout()}><LogOut size={18}/> Abmelden</Button></div>}
    </div>
    {signedIn && <nav className="mb-6 flex gap-3" aria-label="Betreiberverwaltung"><Button variant={tab === "withdrawals" ? "default" : "outline"} onClick={() => { setTab("withdrawals"); void query.refetch(); }}>Widerrufe</Button><Button variant={tab === "orders" ? "default" : "outline"} onClick={() => setTab("orders")}>Bestellungen</Button></nav>}
    {signedIn && tab === "orders" ? <OrderDispatchAdmin selectedOrder={search.order}/> : !ready ? <p>Wird geladen …</p> : !signedIn ? <form className="grid max-w-sm gap-4" onSubmit={resetMode ? async e => { e.preventDefault(); setBusy(true); setError(""); const result = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` }); setBusy(false); setError(result.error ? result.error.message : "Falls ein Konto für diese Adresse besteht, erhalten Sie einen sicheren Wiederherstellungslink."); } : login}>
      <h2 className="text-xl">Betreiberanmeldung</h2>
      <label className="grid gap-2">E-Mail<input className="rounded-md border border-input bg-background p-3" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required/></label>
      {!resetMode && <label className="grid gap-2">Passwort<input className="rounded-md border border-input bg-background p-3" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required/></label>}
      <Button disabled={busy} type="submit">{resetMode ? "Wiederherstellungslink anfordern" : "Anmelden"}</Button><Button variant="ghost" type="button" onClick={() => { setResetMode(!resetMode); setError(""); }}>{resetMode ? "Zur Anmeldung" : "Passwort vergessen?"}</Button>
    </form> : query.isPending ? <p>Widerrufe werden geladen …</p> : query.isError ? <p role="alert">{query.error instanceof Error ? query.error.message : "Widerrufsverwaltung konnte nicht geladen werden."}</p> : row ? <section>
      <Button variant="ghost" onClick={() => setSelected(null)}><ArrowLeft size={18}/> Alle Widerrufe</Button>
      <dl className="my-6 grid gap-4 break-words sm:grid-cols-2">
        {[["Eingangszeit", formatReceivedAt(row.received_at)], ["Referenznummer", row.id], ["Name", row.full_name], ["E-Mail", row.email], ["Bestellreferenz", row.order_reference], ["Verknüpfte Bestellung", row.matched_order_id ?? "Keine Verknüpfung"], ["Widerrufserklärung", row.declaration], ["Bemerkung", row.remark || "Keine"], ["Bearbeitet am", row.processed_at ? formatReceivedAt(row.processed_at) : "Noch offen"]].map(([label, value]) => <div key={label}><dt className="text-sm text-muted-foreground">{label}</dt><dd className="whitespace-pre-wrap">{value}</dd></div>)}
      </dl>
      <h2 className="font-semibold">Bestätigungs- und Versandnachweise</h2><p>{row.order_evidence?.paid_email_sent_at ? `Bestell-/Zahlungsnachricht vom Anbieter angenommen: ${formatReceivedAt(row.order_evidence.paid_email_sent_at)}` : "Keine gespeicherte Bestell-/Zahlungsbestätigung"}</p><p>{row.order_evidence?.dispatch ? "Lieferstatus gespeichert; Details unter Bestellungen." : "Kein gespeicherter Liefernachweis"}</p>
      {(row.email_history as unknown as EmailHistory[]).map((h,n) => <p className="my-2 break-all text-sm" key={n}>{formatReceivedAt(h.at)} · {h.kind === "withdrawal_confirmation" ? "Widerrufsbestätigung (Kunde)" : "Widerrufshinweis (Betreiber)"} · {h.status === "accepted" ? "Vom Anbieter angenommen (kein Zustellnachweis)" : h.status}{h.providerId ? ` · Anbieter-ID: ${h.providerId}` : ""}{h.error ? ` · ${h.error}` : ""}</p>)}
      {["withdrawal_confirmation", "withdrawal_operator"].filter(kind => (row.email_history as unknown as EmailHistory[]).filter(h => h.kind === kind).at(-1)?.status === "failed").map(kind => <Button key={kind} variant="outline" disabled={busy} onClick={async () => { setBusy(true); try { setRetryPreview(await previewRetry({ data: { id: row.id, kind } })); } catch (e) { setError(e instanceof Error ? e.message : "Nicht verfügbar."); } finally { setBusy(false); } }}>Abgelehnte {kind === "withdrawal_confirmation" ? "Kundenbestätigung" : "Betreibernachricht"} erneut prüfen</Button>)}
      <form className="grid max-w-xl gap-4" onSubmit={save}>
        <label className="grid gap-2">Bearbeitungsstatus<select className="rounded-md border border-input bg-background p-3" value={status} onChange={e => setStatus(e.target.value === "processed" ? "processed" : "open")}><option value="open">Offen</option><option value="processed">Bearbeitet</option></select></label>
        <label className="grid gap-2">Interne Notizen<textarea className="rounded-md border border-input bg-background p-3" value={notes} onChange={e => setNotes(e.target.value)} maxLength={10000} rows={5}/></label>
        <Button type="submit" disabled={busy}><Save size={18}/> Speichern</Button>
        {saved && <p role="status">Änderungen gespeichert.</p>}
      </form>
    </section> : <div className="divide-y divide-border">{query.data?.length ? query.data.map(item => <Button key={item.id} variant="ghost" className="h-auto w-full justify-start rounded-none py-4 text-left whitespace-normal" onClick={() => { setSelected(item.id); setStatus(item.handling_status === "processed" ? "processed" : "open"); setNotes(item.internal_notes); setSaved(false); setError(""); }}><span className="grid w-full gap-2 sm:grid-cols-3"><span>{item.full_name}<br/><small>{item.order_reference}</small></span><span>{formatReceivedAt(item.received_at)}<br/><small className="break-all">{item.id}</small></span><span>{item.handling_status === "processed" ? "Bearbeitet" : "Offen"}</span></span></Button>) : <p>Keine Widerrufe vorhanden.</p>}</div>}
    <Dialog open={Boolean(retryPreview)} onOpenChange={open => { if (!open && !busy) setRetryPreview(null); }}><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogTitle>Nachricht erneut senden</DialogTitle><DialogDescription>Widerruf {retryPreview?.id}</DialogDescription><p className="break-all">Empfänger: {retryPreview?.to}</p><p>{retryPreview?.subject}</p><p className="whitespace-pre-wrap text-sm">{retryPreview?.text}</p><Button disabled={busy} onClick={async () => { if (!retryPreview || busy) return; setBusy(true); try { const r = await retryMail({ data: { id: retryPreview.id, kind: retryPreview.kind, confirmed: true, previewToken: retryPreview.previewToken } }); setError(r.status === "accepted" ? "Nachricht vom Anbieter angenommen; kein Zustellnachweis." : r.error ?? "Annahme unklar."); } catch (e) { setError(e instanceof Error ? e.message : "Annahme unklar."); } finally { setBusy(false); setRetryPreview(null); await query.refetch(); } }}>Bestätigen und Nachricht erneut senden</Button></DialogContent></Dialog>
    {error && <p className="mt-4 text-destructive" role="alert">{error}</p>}
  </main>;
}