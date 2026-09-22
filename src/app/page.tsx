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
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  cars: (
    <path
      d="M3 12h18M5 12V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M5 12v5a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-5"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  reports: (
    <path
      d="M4 19V10m6 9V5m6 14v-7"
      stroke="currentColor"
      strokeWidth={1.5}
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
    <main className="bg-showroom-light min-h-screen">
      <div className="bg-showroom-dark">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-3 px-4 py-6 text-center sm:flex-row sm:justify-between sm:px-8 sm:py-7">
          <div className="sm:text-left">
            <h1 className="font-serif text-xl text-white sm:text-2xl">{company.name}</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-crimson-400/90">
              {dict.home.tagline}
            </p>
          </div>

          <div className="flex items-center gap-5 sm:gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-0.5">
                <span className="font-serif text-lg text-crimson-400 sm:text-xl">
                  {stat.value}
                </span>
                <span className="text-[9px] font-medium uppercase tracking-wider text-zinc-400">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-8 sm:py-16">
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 sm:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group relative flex flex-col gap-5 bg-white p-8 transition hover:bg-ink dark:bg-zinc-950 dark:hover:bg-ink sm:p-9"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-300 text-zinc-500 transition group-hover:border-crimson-500/60 group-hover:text-crimson-400 dark:border-zinc-700 dark:text-zinc-400">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  {section.icon}
                </svg>
              </span>
              <div>
                <p className="font-serif text-xl text-zinc-900 transition group-hover:text-white dark:text-zinc-50">
                  {section.title}
                </p>
                <p className="mt-1.5 text-sm text-zinc-500 transition group-hover:text-zinc-400 dark:text-zinc-400">
                  {section.description}
                </p>
              </div>
              <span className="mt-1 flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-zinc-400 opacity-0 transition group-hover:text-crimson-400 group-hover:opacity-100">
                <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
                  <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
