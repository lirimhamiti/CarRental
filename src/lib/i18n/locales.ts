export const locales = ["en", "sq", "mk"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "locale";

export const localeNames: Record<Locale, string> = {
  en: "English",
  sq: "Shqip",
  mk: "Македонски",
};
