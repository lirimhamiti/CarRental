// The 4 checkbox-style contract options, shown together in one compact
// multi-select-with-checkboxes control instead of 4 separate rows.
export const CONTRACT_OPTION_KEYS = ["crossBorder", "gps", "babySeat", "insurance"] as const;
export type ContractOptionKey = (typeof CONTRACT_OPTION_KEYS)[number];

export const ALL_COUNTRIES = "ALL";

// Countries selectable for "Valid for" — North Macedonia's Balkan
// neighbors, plus an "all countries" shortcut.
export const VALID_FOR_COUNTRY_KEYS = ["AL", "BG", "BA", "HR", "GR", "XK", "ME", "RS"] as const;

// Bilingual MK/EN labels for the PDF, which is always rendered in both
// languages regardless of the app's current UI locale.
export const OPTION_LABELS_PDF: Record<ContractOptionKey, { mk: string; en: string }> = {
  crossBorder: { mk: "Преминување граница", en: "Cross-border" },
  gps: { mk: "ГПС", en: "GPS" },
  babySeat: { mk: "Седиште за бебе", en: "Baby seat" },
  insurance: { mk: "Осигурување", en: "Insurance" },
};

export const COUNTRY_LABELS_PDF: Record<string, { mk: string; en: string }> = {
  [ALL_COUNTRIES]: { mk: "Сите земји", en: "All countries" },
  AL: { mk: "Албанија", en: "Albania" },
  BG: { mk: "Бугарија", en: "Bulgaria" },
  BA: { mk: "Босна и Херцеговина", en: "Bosnia and Herzegovina" },
  HR: { mk: "Хрватска", en: "Croatia" },
  GR: { mk: "Грција", en: "Greece" },
  XK: { mk: "Косово", en: "Kosovo" },
  ME: { mk: "Црна Гора", en: "Montenegro" },
  RS: { mk: "Србија", en: "Serbia" },
};

// Toggling "All countries" clears every specific country (and vice versa),
// since picking one only makes sense as "all" or as an explicit subset.
export function toggleCountry(selected: string[], key: string): string[] {
  if (key === ALL_COUNTRIES) {
    return selected.includes(ALL_COUNTRIES) ? [] : [ALL_COUNTRIES];
  }
  const withoutAll = selected.filter((c) => c !== ALL_COUNTRIES);
  return withoutAll.includes(key) ? withoutAll.filter((c) => c !== key) : [...withoutAll, key];
}

export function formatCountriesForPdf(codes: string[]): string {
  if (codes.length === 0) return "-";
  if (codes.includes(ALL_COUNTRIES)) return COUNTRY_LABELS_PDF[ALL_COUNTRIES].en;
  return codes
    .map((code) => COUNTRY_LABELS_PDF[code]?.en)
    .filter(Boolean)
    .join(", ");
}
