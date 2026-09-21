import type { Locale } from "./locales";
import en from "./dictionaries/en";
import sq from "./dictionaries/sq";
import mk from "./dictionaries/mk";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { en, sq, mk };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function interpolate(template: string, params: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => params[key] ?? match);
}
