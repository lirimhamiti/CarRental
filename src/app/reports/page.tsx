import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ReportsForm } from "./ReportsForm";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const companyId = await getCurrentCompanyId();

  const cars = await prisma.car.findMany({
    where: { companyId },
    select: { id: true, make: true, model: true, plate: true },
    orderBy: [{ make: "asc" }, { model: "asc" }],
  });

  return (
    <main className="bg-showroom-light min-h-screen">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-12 sm:px-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-600 dark:text-gold-400">
            {dict.reports.eyebrow}
          </p>
          <h1 className="font-serif text-3xl text-zinc-900 dark:text-zinc-50">
            {dict.reports.title}
          </h1>
        </div>
        <ReportsForm cars={cars} dict={dict} />
      </div>
    </main>
  );
}
