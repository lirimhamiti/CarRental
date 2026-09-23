import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LogoutButton } from "@/components/LogoutButton";
import { getSessionUser } from "@/lib/session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Car Rental",
  description: "Fleet & rental management",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const user = await getSessionUser();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-zinc-950">
        <header className="bg-showroom-dark sticky top-0 z-20 flex items-center justify-between border-b-2 border-crimson-500 px-4 py-3 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-crimson-500/50 text-crimson-400">
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                <path
                  d="M3 12h18M5 12V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M5 12v5a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-5"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="font-serif text-base tracking-wide text-white">{dict.brand}</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            {user && (
              <>
                <span className="hidden text-xs text-zinc-400 sm:inline">{user.username}</span>
                {user.role === "OWNER" && (
                  <>
                    <Link
                      href="/users"
                      className="text-xs font-medium uppercase tracking-wider text-zinc-300 transition hover:text-crimson-400"
                    >
                      {dict.users.navLabel}
                    </Link>
                    <Link
                      href="/billing"
                      className="text-xs font-medium uppercase tracking-wider text-zinc-300 transition hover:text-crimson-400"
                    >
                      {dict.billing.navLabel}
                    </Link>
                  </>
                )}
                <LogoutButton label={dict.auth.logout} />
              </>
            )}
            <LanguageSwitcher locale={locale} />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
