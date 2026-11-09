import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RefreshCw, LogOut, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { listWithdrawals, updateWithdrawalHandling } from "@/lib/withdrawal-admin.functions";
import { formatReceivedAt } from "@/lib/withdrawal-request";
import { OrderDispatchAdmin } from "@/components/order-dispatch-admin";

export const Route = createFileRoute("/verwaltung/widerrufe")({
  head: () => ({ meta: [
    { title: "Widerrufsverwaltung | Royal Krabi" },
    { name: "description", content: "Geschützte Betreiberverwaltung der elektronischen Widerrufe von Royal Krabi Serenity Thaimassage." },
    { property: "og:title", content: "Widerrufsverwaltung | Royal Krabi" },
    { property: "og:description", content: "Geschützter Betreiberbereich für Widerrufe." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: Page,
});

function Page() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<"open" | "processed">("open");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"withdrawals" | "orders">("withdrawals");
  const list = useServerFn(listWithdrawals);
  const update = useServerFn(updateWithdrawalHandling);
  const query = useQuery({ queryKey: ["operator-withdrawals"], queryFn: () => list(), enabled: signedIn, retry: false });
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => { setSignedIn(Boolean(data.session)); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => { setSignedIn(Boolean(session)); });
    return () => data.subscription.unsubscribe();
  }, []);
  const row = query.data?.find(r => r.id === selected);
  async function login(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setPassword(""); setBusy(false);
    if (error) setError("Anmeldung nicht möglich. Bitte Betreiberzugang prüfen.");
  }
  async function logout() {
    await queryClient.cancelQueries({ queryKey: ["operator-withdrawals"] });
    queryClient.removeQueries({ queryKey: ["operator-withdrawals"] });
    queryClient.removeQueries({ queryKey: ["operator-orders"] });
    setSelected(null); setSignedIn(false);
    await supabase.auth.signOut();
    await router.navigate({ to: "/verwaltung/widerrufe", replace: true });
  }
  async function save(e: React.FormEvent) {
    e.preventDefault(); if (!row) return;
    setBusy(true); setError(""); setSaved(false);
    try { await update({ data: { id: row.id, status, notes } }); await query.refetch(); setSaved(true); }
    catch { setError("Änderungen konnten nicht gespeichert werden."); }
    finally { setBusy(false); }
  }
  return <main className="container pb-14 pt-36 md:pt-44">
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl text-primary">Widerrufsverwaltung</h1>
      {signedIn && <div className="flex gap-2"><Button variant="outline" aria-label="Aktualisieren" onClick={() => void query.refetch()}><RefreshCw size={18}/></Button><Button variant="outline" onClick={() => void logout()}><LogOut size={18}/> Abmelden</Button></div>}
    </div>
    {signedIn && <nav className="mb-6 flex gap-3" aria-label="Betreiberverwaltung"><Button variant={tab === "withdrawals" ? "default" : "outline"} onClick={() => setTab("withdrawals")}>Widerrufe</Button><Button variant={tab === "orders" ? "default" : "outline"} onClick={() => setTab("orders")}>Bestellungen</Button></nav>}
    {signedIn && tab === "orders" ? <OrderDispatchAdmin/> : !ready ? <p>Wird geladen …</p> : !signedIn ? <form className="grid max-w-sm gap-4" onSubmit={login}>
      <h2 className="text-xl">Betreiberanmeldung</h2>
      <label className="grid gap-2">E-Mail<input className="rounded-md border border-input bg-background p-3" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required/></label>
      <label className="grid gap-2">Passwort<input className="rounded-md border border-input bg-background p-3" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required/></label>
      <Button disabled={busy} type="submit">Anmelden</Button>
    </form> : query.isPending ? <p>Widerrufe werden geladen …</p> : query.isError ? <p role="alert">Kein Zugriff oder Widerrufsverwaltung nicht erreichbar.</p> : row ? <section>
      <Button variant="ghost" onClick={() => setSelected(null)}><ArrowLeft size={18}/> Alle Widerrufe</Button>
      <dl className="my-6 grid gap-4 break-words sm:grid-cols-2">
        {[["Eingangszeit", formatReceivedAt(row.received_at)], ["Referenznummer", row.id], ["Name", row.full_name], ["E-Mail", row.email], ["Bestellreferenz", row.order_reference], ["Verknüpfte Bestellung", row.matched_order_id ?? "Keine Verknüpfung"], ["Widerrufserklärung", row.declaration], ["Bemerkung", row.remark || "Keine"], ["Bearbeitet am", row.processed_at ? formatReceivedAt(row.processed_at) : "Noch offen"]].map(([label, value]) => <div key={label}><dt className="text-sm text-muted-foreground">{label}</dt><dd className="whitespace-pre-wrap">{value}</dd></div>)}
      </dl>
      <form className="grid max-w-xl gap-4" onSubmit={save}>
        <label className="grid gap-2">Bearbeitungsstatus<select className="rounded-md border border-input bg-background p-3" value={status} onChange={e => setStatus(e.target.value === "processed" ? "processed" : "open")}><option value="open">Offen</option><option value="processed">Bearbeitet</option></select></label>
        <label className="grid gap-2">Interne Notizen<textarea className="rounded-md border border-input bg-background p-3" value={notes} onChange={e => setNotes(e.target.value)} maxLength={10000} rows={5}/></label>
        <Button type="submit" disabled={busy}><Save size={18}/> Speichern</Button>
        {saved && <p role="status">Änderungen gespeichert.</p>}
      </form>
    </section> : <div className="divide-y divide-border">{query.data?.length ? query.data.map(item => <Button key={item.id} variant="ghost" className="h-auto w-full justify-start rounded-none py-4 text-left whitespace-normal" onClick={() => { setSelected(item.id); setStatus(item.handling_status === "processed" ? "processed" : "open"); setNotes(item.internal_notes); setSaved(false); setError(""); }}><span className="grid w-full gap-2 sm:grid-cols-3"><span>{item.full_name}<br/><small>{item.order_reference}</small></span><span>{formatReceivedAt(item.received_at)}<br/><small className="break-all">{item.id}</small></span><span>{item.handling_status === "processed" ? "Bearbeitet" : "Offen"}</span></span></Button>) : <p>Keine Widerrufe vorhanden.</p>}</div>}
    {error && <p className="mt-4 text-destructive" role="alert">{error}</p>}
  </main>;
}