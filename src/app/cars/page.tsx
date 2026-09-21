import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company";
import { formatDate, isDateInRange } from "@/lib/dates";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary, interpolate } from "@/lib/i18n/get-dictionary";
import { AddCarForm } from "./AddCarForm";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  MAINTENANCE: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  RETIRED: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

export default async function CarsPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const companyId = await getCurrentCompanyId();
  const cars = await prisma.car.findMany({
    where: { companyId },
    include: { contracts: { where: { status: "ACTIVE" } } },
    orderBy: [{ make: "asc" }, { model: "asc" }],
  });

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50/60 via-white to-white dark:from-indigo-950/20 dark:via-zinc-950 dark:to-zinc-950">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-12 sm:px-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-500 dark:text-indigo-400">
            {dict.cars.eyebrow}
          </p>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{dict.cars.title}</h1>
        </div>

        <AddCarForm dict={dict} />

        <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/80 shadow-xl shadow-zinc-200/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60 dark:shadow-black/20">
          {cars.length === 0 ? (
            <p className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              {dict.cars.empty}
            </p>
          ) : (
            <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
              <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  <th className="px-6 py-3 font-medium">{dict.cars.table.car}</th>
                  <th className="px-6 py-3 font-medium">{dict.cars.table.plate}</th>
                  <th className="px-6 py-3 font-medium">{dict.cars.table.status}</th>
                  <th className="px-6 py-3 font-medium">{dict.cars.table.availability}</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {cars.map((car) => {
                  const current = car.contracts.find((c) => isDateInRange(today, c.startDate, c.endDate));
                  return (
                    <tr
                      key={car.id}
                      className="group transition hover:bg-indigo-50/60 dark:hover:bg-indigo-500/5"
                    >
                      <td className="px-6 py-4">
                        <Link href={`/cars/${car.id}`} className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                            <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
                              <path
                                d="M3 12h18M5 12V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M5 12v5a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-5"
                                stroke="currentColor"
                                strokeWidth={1.8}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                          <span className="font-medium text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-50 dark:group-hover:text-indigo-400">
                            {car.make} {car.model} ({car.year})
                          </span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                        {car.plate}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[car.status]}`}
                        >
                          {dict.cars.status[car.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {current ? (
                          <span className="text-red-600 dark:text-red-400">
                            {interpolate(dict.cars.rentedUntil, { date: formatDate(current.endDate, locale) })}
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400">{dict.cars.freeNow}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/cars/${car.id}`}
                          className="text-zinc-300 transition group-hover:text-indigo-500 dark:text-zinc-700"
                        >
                          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                            <path
                              d="M9 5l7 7-7 7"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              </table>
            </div>
          )}
        </div>
        {cars.length > 0 && (
          <p className="text-center text-xs text-zinc-400 sm:hidden">
            {dict.cars.swipeHint}
          </p>
        )}
      </div>
    </main>
  );
}
