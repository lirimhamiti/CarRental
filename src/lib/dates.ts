import type { Locale } from "@/lib/i18n/locales";

const INTL_LOCALE: Record<Locale, string> = {
  en: "en-GB",
  sq: "sq-AL",
  mk: "mk-MK",
};

export function formatDate(date: Date, locale: Locale = "en"): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}
