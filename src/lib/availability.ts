export function computeEndDate(startDate: Date, days: number): Date {
  const end = new Date(startDate);
  end.setDate(end.getDate() + days - 1);
  return end;
}

export function parseDateOnly(value: string): Date {
  // "YYYY-MM-DD" -> UTC midnight, matching Prisma's @db.Date storage.
  return new Date(`${value}T00:00:00.000Z`);
}
