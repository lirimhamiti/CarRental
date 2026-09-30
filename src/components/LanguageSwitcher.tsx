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
    <div className="flex items-center gap-0.5 rounded-full border border-crimson-100 bg-white p-0.5 text-xs font-medium tracking-wide">
      {locales.map((loc) => (
        <button
          key={loc}
          type="button"
          title={localeNames[loc]}
          aria-pressed={loc === locale}
          onClick={() => switchTo(loc)}
          className={`rounded-full px-2.5 py-1 transition ${
            loc === locale ? "bg-crimson-500 text-white" : "text-zinc-500 hover:text-crimson-600"
          }`}
        >
          {SHORT_LABEL[loc]}
        </button>
      ))}
    </div>
  );
}
