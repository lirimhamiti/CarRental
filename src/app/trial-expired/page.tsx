import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { hasAccess } from "@/lib/company";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary, interpolate } from "@/lib/i18n/get-dictionary";
import { formatDate } from "@/lib/dates";
import { primaryButtonClass } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function TrialExpiredPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  if (hasAccess(user)) {
    redirect("/");
  }

  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <main className="bg-showroom-light flex min-h-[calc(100vh-57px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-crimson-600 dark:text-crimson-400">
          {dict.trialExpired.eyebrow}
        </p>
        <h1 className="mt-1 font-serif text-2xl text-zinc-900 dark:text-zinc-50">{dict.trialExpired.title}</h1>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          {interpolate(dict.trialExpired.message, { date: formatDate(user.trialEndsAt, locale) })}
        </p>
        <Link href="/billing" className={`mt-6 inline-flex ${primaryButtonClass}`}>
          {dict.trialExpired.viewPlans}
        </Link>
      </div>
    </main>
  );
}
