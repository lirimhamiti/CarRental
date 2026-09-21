import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function ReportsPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-12 sm:px-8">
      <h1 className="font-serif text-3xl text-zinc-900 dark:text-zinc-50">
        {dict.reports.title}
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {dict.reports.placeholder}
      </p>
    </main>
  );
}
