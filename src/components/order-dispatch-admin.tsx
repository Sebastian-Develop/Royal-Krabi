import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RefreshCw, Truck, PackageCheck } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { listDispatchOrders, previewOrderDispatch, markOrderDispatched, markOrderCollected, retryOperatorNotice } from "@/lib/order-dispatch.functions";
import { formatCents } from "@/lib/money";
import { formatReceivedAt } from "@/lib/withdrawal-request";

export function OrderDispatchAdmin({ selectedOrder }: { selectedOrder?: string | undefined }) {
  const list = useServerFn(listDispatchOrders);
  const preview = useServerFn(previewOrderDispatch);
  const retryInternal = useServerFn(retryOperatorNotice);
  const collect = useServerFn(markOrderCollected);
  const [filter, setFilter] = useState<"paid" | "unpaid">("paid");
  const [collectId, setCollectId] = useState<string | null>(null);
  const mark = useServerFn(markOrderDispatched);
  const query = useQuery({ queryKey: ["operator-orders"], queryFn: () => list(), retry: false });
  const [message, setMessage] = useState<Awaited<ReturnType<typeof previewOrderDispatch>> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  async function open(id: string, retry = false) {
    setBusy(true); setError(""); setResult(""); setConfirmed(false);
    try { setMessage(await preview({ data: { id, retry } })); }
    catch (e) { setError(e instanceof Error ? e.message : "Nachricht konnte nicht geladen werden."); }
    finally { setBusy(false); }
  }
  async function submit() {
    if (!message || !confirmed || busy) return;
    setBusy(true); setError("");
    try {
      const response = await mark({ data: { id: message.id, previewToken: message.previewToken, confirmed: true, retry: message.retry } });
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
    <div className="mb-4 flex flex-wrap gap-2"><Button variant={filter === "paid" ? "default" : "outline"} onClick={() => setFilter("paid")}>Bezahlte Bestellungen</Button><Button variant={filter === "unpaid" ? "default" : "outline"} onClick={() => setFilter("unpaid")}>Unbezahlte Kaufversuche</Button></div>
    {query.isPending ? <p>Bestellungen werden geladen …</p> : query.isError ? <p role="alert">{query.error instanceof Error ? query.error.message : "Bestellverwaltung konnte nicht geladen werden."}</p> : <div className="divide-y divide-border">{query.data?.filter(order => selectedOrder ? order.id === selectedOrder : (order.status === "paid" && Boolean(order.paid_at)) === (filter === "paid")).map(order => <article key={order.id} className="grid gap-4 py-6 md:grid-cols-2">
      <div className="min-w-0 break-words"><h3 className="text-xl">{order.full_name}</h3><p className="break-all">{order.email}</p><p className="text-sm text-muted-foreground break-all">{order.id}</p><p>{order.created_at ? formatReceivedAt(order.created_at) : ""} · {formatCents(order.total_cents ?? 0)}</p><p>{order.phone}</p><p>{[order.street, order.postal_code, order.city].filter(Boolean).join(" ")}</p><ul>{order.items?.map((i, n) => <li key={n}>{i.quantity} × {i.product_name}</li>)}</ul><p>{order.status === "paid" && order.paid_at ? "Zahlung bestätigt" : order.status === "payment_failed" ? "Zahlung fehlgeschlagen" : "Zahlung nicht abgeschlossen"} · {order.delivery === "post" ? "DHL-Versand" : order.delivery === "digital" ? "Digital" : order.delivery === "pickup" ? "Abholung" : "Keine Lieferung"}</p></div>
      <div className="min-w-0">{order.dispatch ? <dl className="grid gap-2 text-sm"><div><dt>Lieferstatus: {order.dispatch.collectedAt ? "Abgeholt" : order.delivery === "pickup" ? "Zur Abholung bereit" : order.delivery === "digital" ? "Digital bereitgestellt" : "Versendet"} · Zeitpunkt</dt><dd>{formatReceivedAt(order.dispatch.fulfilledAt)}</dd></div><div><dt>E-Mail-Ergebnis</dt><dd>{order.dispatch.emailStatus === "sent" ? `Von Resend angenommen · ${order.dispatch.emailAt ? formatReceivedAt(order.dispatch.emailAt) : ""}` : order.dispatch.emailStatus === "failed" ? "E-Mail-Versand fehlgeschlagen" : "E-Mail-Ergebnis unklar / in Bearbeitung"}</dd></div>{order.dispatch.error && <dd role="alert" className="text-destructive">{order.dispatch.error}</dd>}</dl> : <Button className="h-auto min-h-10 whitespace-normal" disabled={busy || order.status !== "paid" || !order.paid_at || !["post", "pickup", "digital"].includes(order.delivery)} onClick={() => void open(order.id)}>{order.delivery === "post" ? <Truck/> : <PackageCheck/>}{order.delivery === "post" ? "Als versendet markieren" : order.delivery === "pickup" ? "Zur Abholung bereit markieren" : "Als bereitgestellt markieren"}</Button>}
{order.dispatch?.emailStatus === "failed" && <Button variant="outline" disabled={busy} onClick={() => void open(order.id, true)}>Fehlgeschlagene Liefernachricht erneut prüfen</Button>}
{order.delivery === "pickup" && order.dispatch && !order.dispatch.collectedAt && <Button variant="outline" onClick={() => setCollectId(order.id)}>Als abgeholt markieren · ohne E-Mail</Button>}
<h4 className="mt-4 font-semibold">E-Mail-Verlauf</h4>{order.email_history?.filter(e => e.kind === "operator_notice").at(-1)?.status === "failed" && <Button variant="outline" disabled={busy} onClick={async () => { if (!window.confirm("Nur den abgelehnten internen Bestellhinweis erneut senden? Empfänger: j.rudklang@royalkrabi-thaimassage.de")) return; setBusy(true); try { const r = await retryInternal({ data: { id: order.id, confirmed: true } }); if (r.status !== "accepted") setError(r.error ?? "Annahme unklar."); await query.refetch(); } catch (e) { setError(e instanceof Error ? e.message : "Nicht gesendet."); } finally { setBusy(false); } }}>Internen Hinweis erneut senden</Button>}{[...(order.email_history ?? []), ...(order.dispatch?.history ?? [])].map((h, n) => <p className="break-all text-sm" key={n}>{formatReceivedAt(h.at)} · {h.kind} · {h.status === "accepted" ? "Vom Anbieter angenommen (kein Zustellnachweis)" : h.status}{h.providerId ? ` · Anbieter-ID: ${h.providerId}` : ""}{h.error ? ` · ${h.error}` : ""}</p>)}
</div>
    </article>)}{!query.data?.length && <p>Keine Bestellungen vorhanden.</p>}</div>}
    <Dialog open={Boolean(collectId)} onOpenChange={open => { if (!open) setCollectId(null); }}><DialogContent><DialogTitle>Abholung bestätigen</DialogTitle><DialogDescription>Bestellung {collectId} tatsächlich abgeholt? Keine Kunden-E-Mail.</DialogDescription><Button disabled={busy} onClick={async () => { if (!collectId || busy) return; setBusy(true); try { await collect({ data: { id: collectId, confirmed: true } }); setCollectId(null); await query.refetch(); } catch (e) { setError(e instanceof Error ? e.message : "Nicht gespeichert."); } finally { setBusy(false); } }}>Abholung bestätigen</Button></DialogContent></Dialog>
    <Dialog open={Boolean(message)} onOpenChange={open => { if (!open && !busy) setMessage(null); }}><DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto"><DialogTitle>{message?.mode === "post" ? "Versand bestätigen" : "Bereitstellung bestätigen"}</DialogTitle><DialogDescription>Empfänger und Nachricht prüfen</DialogDescription>{message && <><p className="break-all">Bestellung: {message.id} · Neuer Status: {message.mode === "post" ? "Versendet" : message.mode === "pickup" ? "Zur Abholung bereit" : "Digital bereitgestellt"}{message.retry ? " · Nur E-Mail erneut senden" : ""}</p><dl className="grid gap-3 break-words"><div><dt className="text-sm text-muted-foreground">Empfänger</dt><dd className="break-all">{message.to}</dd></div><div><dt className="text-sm text-muted-foreground">Betreff</dt><dd>{message.subject}</dd></div></dl><p className="whitespace-pre-wrap text-sm">{message.text}</p><label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} disabled={busy}/><span>{message.mode === "post" ? "Ich bestätige, dass diese Bestellung tatsächlich versendet wurde." : message.mode === "digital" ? "Ich bestätige, dass die digitalen Produkte tatsächlich über den vereinbarten Weg bereitgestellt wurden." : "Ich bestätige, dass diese Bestellung zur vereinbarten Abholung bereitliegt."}</span></label><div className="flex flex-wrap justify-end gap-3"><Button variant="outline" disabled={busy} onClick={() => setMessage(null)}>Abbrechen</Button><Button className="h-auto min-h-10 whitespace-normal" disabled={busy || !confirmed} onClick={() => void submit()}>{busy ? "Wird gespeichert …" : "Bestätigen und Kunden benachrichtigen"}</Button></div></>}</DialogContent></Dialog>
  </section>;
}