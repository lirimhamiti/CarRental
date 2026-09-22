export function carLabel(make: string, model: string, year: number | null): string {
  return year ? `${make} ${model} (${year})` : `${make} ${model}`;
}

const REGISTRATION_WARNING_DAYS = 30;

export function registrationUrgency(expiryDate: Date, today: Date): "expired" | "soon" | "ok" {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const daysLeft = Math.round((expiryDate.getTime() - today.getTime()) / MS_PER_DAY);
  if (daysLeft < 0) return "expired";
  if (daysLeft <= REGISTRATION_WARNING_DAYS) return "soon";
  return "ok";
}
