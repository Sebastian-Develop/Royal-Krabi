import { useState } from 'react';
import { Gift } from 'lucide-react';
import { Button } from './ui/button';
import { parseEuroCents } from '@/lib/money';

export function ValueVoucherInput({ onAdd }: { onAdd: (cents: number) => void }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  return <form className="value-voucher-input" onSubmit={event => { event.preventDefault(); const cents = parseEuroCents(amount); if (cents === null) { setError('Bitte geben Sie einen positiven Euro-Betrag mit höchstens zwei Nachkommastellen ein.'); return; } setError(''); onAdd(cents); }}>
    <label className="field"><span>Ihr Wunschbetrag</span><div className="value-voucher-euro"><input aria-label="Ihr Wunschbetrag" type="text" inputMode="decimal" autoComplete="off" value={amount} onChange={event => setAmount(event.target.value)} placeholder="0,00"/><span aria-hidden="true">€</span></div></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <Button type="submit" variant="outline" className="btn btn-outline"><Gift size={17}/> In den Warenkorb</Button>
  </form>;
}