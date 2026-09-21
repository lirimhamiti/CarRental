import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { NewContractForm } from "./NewContractForm";

export default async function ContractsPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50/60 via-white to-white dark:from-indigo-950/20 dark:via-zinc-950 dark:to-zinc-950">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12 sm:px-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-500 dark:text-indigo-400">
            {dict.contracts.eyebrow}
          </p>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {dict.contracts.title}
          </h1>
        </div>
        <NewContractForm dict={dict} />
      </div>
    </main>
  );
}
