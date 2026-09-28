export function parseDateOnly(value: string): Date {
  // "YYYY-MM-DD" -> UTC midnight, matching Prisma's @db.Date storage.
  return new Date(`${value}T00:00:00.000Z`);
}

// A rental's endDate is the checkout/return day, not the last occupied day
// (a half-open [startDate, endDate) range) — picked up the 20th, returned
// the 27th, is 7 nights, and the car is free again for a new rental
// starting the 27th. The UI still labels this "days" for the user, since
// that's the everyday word for it, but the count itself is nights.
export function nightsBetween(start: Date, end: Date): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);
}

export function addNights(start: Date, nights: number): Date {
  const d = new Date(start);
  d.setUTCDate(d.getUTCDate() + nights);
  return d;
}
