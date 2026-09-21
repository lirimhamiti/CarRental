"use client";

import { useRouter } from "next/navigation";
import { locales, localeNames, LOCALE_COOKIE, type Locale } from "@/lib/i18n/locales";

const SHORT_LABEL: Record<Locale, string> = { en: "EN", sq: "SQ", mk: "MK" };

function setLocaleCookie(next: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
}

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();

  function switchTo(next: Locale) {
    if (next === locale) return;
    setLocaleCookie(next);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-gold-500/25 bg-white/5 p-0.5 text-xs font-medium tracking-wide">
      {locales.map((loc) => (
        <button
          key={loc}
          type="button"
          title={localeNames[loc]}
          aria-pressed={loc === locale}
          onClick={() => switchTo(loc)}
          className={`rounded-full px-2.5 py-1 transition ${
            loc === locale
              ? "bg-gold-500 text-ink"
              : "text-gold-100/70 hover:text-gold-100"
          }`}
        >
          {SHORT_LABEL[loc]}
        </button>
      ))}
    </div>
  );
}
