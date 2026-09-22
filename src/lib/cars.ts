export function carLabel(make: string, model: string, year: number | null): string {
  return year ? `${make} ${model} (${year})` : `${make} ${model}`;
}
