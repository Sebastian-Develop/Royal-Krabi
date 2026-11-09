import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RefreshCw, Truck, PackageCheck } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { listDispatchOrders, previewOrderDispatch, markOrderDispatched } from "@/lib/order-dispatch.functions";
import { formatReceivedAt } from "@/lib/withdrawal-request";

export function OrderDispatchAdmin() {
  const list = useServerFn(listDispatchOrders);
  const preview = useServerFn(previewOrderDispatch);
  const mark = useServerFn(markOrderDispatched);
  const query = useQuery({ queryKey: ["operator-orders"], queryFn: () => list(), retry: false });
  const [message, setMessage] = useState<Awaited<ReturnType<typeof previewOrderDispatch>> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  async function open(id: string) {
    setBusy(true); setError(""); setResult(""); setConfirmed(false);
    try { setMessage(await preview({ data: { id } })); }
    catch (e) { setError(e instanceof Error ? e.message : "Nachricht konnte nicht geladen werden."); }
    finally { setBusy(false); }
  }
  async function submit() {
    if (!message || !confirmed || busy) return;
    setBusy(true); setError("");
    try {
      const response = await mark({ data: { id: message.id, previewToken: message.previewToken, confirmed: true } });
      setMessage(null);
      if (response.record?.emailStatus === "sent") setResult(response.duplicate ? "Bereitstellung bereits gespeichert; keine weitere Nachricht gesendet." : "Bereitstellung gespeichert. Resend hat die E-Mail angenommen.");
      else setError(response.record?.error || "Bereitstellung gespeichert; E-Mail-Ergebnis noch unklar. Nicht erneut auslösen.");
      await query.refetch();
    } catch (e) { setMessage(null); setError(e instanceof Error ? e.message : "Ergebnis unklar. Bitte aktualisieren, nicht erneut auslösen."); await query.refetch(); }
    finally { setBusy(false); }
  }
  return <section>
    <div className="mb-6 flex items-center justify-between gap-4"><h2 className="text-2xl text-primary">Bestellungen · Versand</h2><Button variant="outline" size="icon" aria-label="Bestellungen aktualisieren" onClick={() => void query.refetch()}><RefreshCw/></Button></div>
    {error && <p role="alert" className="mb-4 text-destructive">{error}</p>}
    {result && <p role="status" className="mb-4">{result}</p>}
    {query.isPending ? <p>Bestellungen werden geladen …</p> : query.isError ? <p role="alert">Kein Zugriff oder Bestellverwaltung nicht erreichbar.</p> : <div className="divide-y divide-border">{query.data?.map(order => <article key={order.id} className="grid gap-4 py-6 md:grid-cols-2">
      <div className="min-w-0 break-words"><h3 className="text-xl">{order.full_name}</h3><p className="break-all">{order.email}</p><p className="text-sm text-muted-foreground break-all">{order.id}</p><p>{order.status === "paid" && order.paid_at ? "Zahlung bestätigt" : "Nicht als bezahlt bestätigt"} · {order.delivery === "post" ? "DHL-Versand" : order.delivery === "digital" ? "Digital" : order.delivery === "pickup" ? "Abholung" : "Keine Lieferung"}</p></div>
      <div className="min-w-0">{order.dispatch ? <dl className="grid gap-2 text-sm"><div><dt>Versand / Bereitstellung am</dt><dd>{formatReceivedAt(order.dispatch.fulfilledAt)}</dd></div><div><dt>E-Mail-Ergebnis</dt><dd>{order.dispatch.emailStatus === "sent" ? `Von Resend angenommen · ${order.dispatch.emailAt ? formatReceivedAt(order.dispatch.emailAt) : ""}` : order.dispatch.emailStatus === "failed" ? "E-Mail-Versand fehlgeschlagen" : "E-Mail-Ergebnis unklar / in Bearbeitung"}</dd></div>{order.dispatch.error && <dd role="alert" className="text-destructive">{order.dispatch.error}</dd>}</dl> : <Button className="h-auto min-h-10 whitespace-normal" disabled={busy || order.status !== "paid" || !order.paid_at || !["post", "pickup", "digital"].includes(order.delivery)} onClick={() => void open(order.id)}>{order.delivery === "post" ? <Truck/> : <PackageCheck/>}{order.delivery === "post" ? "Als versendet markieren" : "Als bereitgestellt markieren"}</Button>}</div>
    </article>)}{!query.data?.length && <p>Keine Bestellungen vorhanden.</p>}</div>}
    <Dialog open={Boolean(message)} onOpenChange={open => { if (!open && !busy) setMessage(null); }}><DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto"><DialogTitle>{message?.mode === "post" ? "Versand bestätigen" : "Bereitstellung bestätigen"}</DialogTitle><DialogDescription>Empfänger und Nachricht prüfen</DialogDescription>{message && <><dl className="grid gap-3 break-words"><div><dt className="text-sm text-muted-foreground">Empfänger</dt><dd className="break-all">{message.to}</dd></div><div><dt className="text-sm text-muted-foreground">Betreff</dt><dd>{message.subject}</dd></div></dl><p className="whitespace-pre-wrap text-sm">{message.text}</p><label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} disabled={busy}/><span>{message.mode === "post" ? "Ich bestätige, dass diese Bestellung tatsächlich an DHL übergeben wurde." : message.mode === "digital" ? "Ich bestätige, dass die digitalen Produkte tatsächlich über den vereinbarten Weg bereitgestellt wurden." : "Ich bestätige, dass diese Bestellung zur vereinbarten Abholung bereitliegt."}</span></label><div className="flex flex-wrap justify-end gap-3"><Button variant="outline" disabled={busy} onClick={() => setMessage(null)}>Abbrechen</Button><Button className="h-auto min-h-10 whitespace-normal" disabled={busy || !confirmed} onClick={() => void submit()}>{busy ? "Wird gespeichert …" : "Bestätigen und Kunden benachrichtigen"}</Button></div></>}</DialogContent></Dialog>
  </section>;
}