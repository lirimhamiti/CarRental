import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const dynamic = "force-dynamic";

const ICONS = {
  contracts: (
    <path
      d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm7 0v5h5M9 13h6M9 17h6M9 9h2"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  cars: (
    <path
      d="M3 12h18M5 12V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M5 12v5a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-5"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  reports: (
    <path
      d="M4 19V10m6 9V5m6 14v-7"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

export default async function Home() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const companyId = await getCurrentCompanyId();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const [company, totalCars, rentedNow, totalClients] = await Promise.all([
    prisma.company.findUniqueOrThrow({ where: { id: companyId } }),
    prisma.car.count({ where: { companyId } }),
    prisma.car.count({
      where: {
        companyId,
        contracts: { some: { status: "ACTIVE", startDate: { lte: today }, endDate: { gte: today } } },
      },
    }),
    prisma.client.count({ where: { companyId } }),
  ]);

  const stats = [
    { label: dict.home.stats.cars, value: totalCars },
    { label: dict.home.stats.rentedNow, value: rentedNow },
    { label: dict.home.stats.clients, value: totalClients },
  ];

  const sections = [
    { href: "/contracts", icon: ICONS.contracts, ...dict.home.sections.contracts },
    { href: "/cars", icon: ICONS.cars, ...dict.home.sections.cars },
    { href: "/reports", icon: ICONS.reports, ...dict.home.sections.reports },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50/60 via-white to-white dark:from-indigo-950/20 dark:via-zinc-950 dark:to-zinc-950">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-16 sm:px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30">
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
              <path
                d="M3 12h18M5 12V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M5 12v5a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-5"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{company.name}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{dict.home.tagline}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 rounded-2xl border border-zinc-200/80 bg-white/80 py-5 text-center shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <span className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                {stat.value}
              </span>
              <span className="px-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group flex flex-col gap-4 rounded-3xl border border-zinc-200/80 bg-white/80 p-6 shadow-xl shadow-zinc-200/50 backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-900/60 dark:shadow-black/20"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-gradient-to-br group-hover:from-indigo-600 group-hover:to-indigo-500 group-hover:text-white dark:bg-indigo-500/10 dark:text-indigo-400">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  {section.icon}
                </svg>
              </span>
              <div>
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {section.title}
                </p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {section.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
