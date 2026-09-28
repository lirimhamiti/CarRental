// Human-facing contract number: ddMMyy + a 2-digit per-company daily
// sequence, e.g. the first contract created today (28.09.2026) is
// "28092601", the second "28092602", tomorrow's first is "29092601".
// Assigned once at creation and never recomputed, so editing a contract
// later doesn't change its number.
export function formatContractNumber(date: Date, sequence: number): string {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = String(date.getUTCFullYear() % 100).padStart(2, "0");
  return `${day}${month}${year}${String(sequence).padStart(2, "0")}`;
}
