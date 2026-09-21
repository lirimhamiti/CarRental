import Link from "next/link";
import { NewContractForm } from "./NewContractForm";

export default function ContractsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-12 sm:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          New contract
        </h1>
        <Link href="/" className="text-sm text-zinc-500 hover:underline">
          ← Home
        </Link>
      </div>
      <NewContractForm />
    </main>
  );
}
