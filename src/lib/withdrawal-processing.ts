/** Confirmation is attempted only for an already persisted receipt; failures never affect storage. */
export async function confirmStoredWithdrawal<T extends { id: string; received_at: string }>(
  stored: T | null,
  confirm: (receipt: T) => Promise<boolean>,
): Promise<boolean> {
  if (!stored) return false;
  try { return await confirm(stored); }
  catch { return false; }
}