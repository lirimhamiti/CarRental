import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { NewContractForm } from "./NewContractForm";

export default async function ContractsPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <main className="bg-showroom-light min-h-screen">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12 sm:px-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-sapphire-600 dark:text-sapphire-400">
            {dict.contracts.eyebrow}
          </p>
          <h1 className="font-serif text-3xl text-zinc-900 dark:text-zinc-50">
            {dict.contracts.title}
          </h1>
        </div>
        <NewContractForm dict={dict} />
      </div>
    </main>
  );
}
