import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company";
import { formatDate } from "@/lib/dates";
import { carLabel, registrationUrgency } from "@/lib/cars";
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
    orderBy: [{ make: "asc" }, { model: "asc" }],
  });

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  return (
    <main className="bg-showroom-light min-h-screen">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-12 sm:px-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-crimson-600 dark:text-crimson-400">
            {dict.cars.eyebrow}
          </p>
          <h1 className="font-serif text-3xl text-zinc-900 dark:text-zinc-50">{dict.cars.title}</h1>
        </div>

        <AddCarForm dict={dict} />

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {cars.length === 0 ? (
            <p className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              {dict.cars.empty}
            </p>
          ) : (
            <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
              <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  <th className="px-6 py-3 font-medium">{dict.cars.table.car}</th>
                  <th className="px-6 py-3 font-medium">{dict.cars.table.plate}</th>
                  <th className="px-6 py-3 font-medium">{dict.cars.table.registrationExpiry}</th>
                  <th className="px-6 py-3 font-medium">{dict.cars.table.transmission}</th>
                  <th className="px-6 py-3 font-medium">{dict.cars.table.fuelType}</th>
                  <th className="px-6 py-3 font-medium">{dict.cars.table.status}</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {cars.map((car) => {
                  return (
                    <tr
                      key={car.id}
                      className="group transition hover:bg-crimson-50/60 dark:hover:bg-crimson-500/5"
                    >
                      <td className="px-6 py-4">
                        <Link href={`/cars/${car.id}`} className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-crimson-400">
                            <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
                              <path
                                d="M3 12h18M5 12V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M5 12v5a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-5"
                                stroke="currentColor"
                                strokeWidth={1.6}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                          <span className="font-medium text-zinc-900 group-hover:text-crimson-600 dark:text-zinc-50 dark:group-hover:text-crimson-400">
                            {carLabel(car.make, car.model, car.year)}
                          </span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                        {car.plate}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {(() => {
                          const urgency = registrationUrgency(car.registrationExpiryDate, today);
                          const formatted = formatDate(car.registrationExpiryDate, locale);
                          if (urgency === "expired") {
                            return (
                              <span className="font-medium text-red-600 dark:text-red-400">
                                {interpolate(dict.cars.registrationExpired, { date: formatted })}
                              </span>
                            );
                          }
                          if (urgency === "soon") {
                            return (
                              <span className="font-medium text-amber-600 dark:text-amber-400">
                                {interpolate(dict.cars.registrationExpiringSoon, { date: formatted })}
                              </span>
                            );
                          }
                          return <span className="text-zinc-500 dark:text-zinc-400">{formatted}</span>;
                        })()}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400">
                        {car.transmission ? dict.cars.addForm.transmissionOptions[car.transmission] : dict.cars.notSpecified}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400">
                        {car.fuelType ? dict.cars.addForm.fuelTypeOptions[car.fuelType] : dict.cars.notSpecified}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[car.status]}`}
                        >
                          {dict.cars.status[car.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/cars/${car.id}`}
                          className="text-zinc-300 transition group-hover:text-crimson-500 dark:text-zinc-700"
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
