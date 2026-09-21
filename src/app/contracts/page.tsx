import Link from "next/link";
import { NewContractForm } from "./NewContractForm";

export default function ContractsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50/60 via-white to-white dark:from-indigo-950/20 dark:via-zinc-950 dark:to-zinc-950">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12 sm:px-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-500 dark:text-indigo-400">
              Rental agreement
            </p>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              New contract
            </h1>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            ← Home
          </Link>
        </div>
        <NewContractForm />
      </div>
    </main>
  );
}
