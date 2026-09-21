export function parseDateOnly(value: string): Date {
  // "YYYY-MM-DD" -> UTC midnight, matching Prisma's @db.Date storage.
  return new Date(`${value}T00:00:00.000Z`);
}

export function daysBetweenInclusive(start: Date, end: Date): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
}
