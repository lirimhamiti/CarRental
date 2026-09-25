export function formatDate(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${date.getUTCFullYear()}`;
}

// end is the checkout/return day (exclusive) — see nightsBetween in
// src/lib/availability.ts for why.
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date < end;
}
