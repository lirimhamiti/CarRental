import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company";
import { formatDate, isDateInRange } from "@/lib/dates";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary, interpolate } from "@/lib/i18n/get-dictionary";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  MAINTENANCE: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  RETIRED: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const companyId = await getCurrentCompanyId();

  const car = await prisma.car.findFirst({
    where: { id, companyId },
    include: {
      contracts: {
        where: { status: "ACTIVE" },
        orderBy: { startDate: "asc" },
        include: { client: true },
      },
    },
  });

  if (!car) {
    notFound();
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentBooking = car.contracts.find((c) =>
    isDateInRange(today, c.startDate, c.endDate),
  );
  const upcomingBookings = car.contracts.filter((c) => c.endDate >= today);

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50/60 via-white to-white dark:from-indigo-950/20 dark:via-zinc-950 dark:to-zinc-950">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12 sm:px-8">
        <Link
          href="/cars"
          className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:hover:text-zinc-50"
        >
          {dict.cars.detail.back}
        </Link>

        <div className="rounded-3xl border border-zinc-200/80 bg-white/80 p-6 shadow-xl shadow-zinc-200/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60 dark:shadow-black/20 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                {car.make} {car.model} ({car.year})
              </h1>
              <p className="mt-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">{car.plate}</p>
            </div>
            <span
              className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[car.status]}`}
            >
              {dict.cars.status[car.status]}
            </span>
          </div>

          <div
            className={`mt-6 rounded-2xl border p-4 text-sm font-medium ${
              currentBooking
                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
            }`}
          >
            {currentBooking
              ? interpolate(dict.cars.detail.notFree, { date: formatDate(currentBooking.endDate, locale) })
              : dict.cars.detail.freeNow}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {dict.cars.detail.bookedDates}
            </h2>
            {upcomingBookings.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {dict.cars.detail.noBookings}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {upcomingBookings.map((booking) => (
                  <li
                    key={booking.id}
                    className="flex flex-col gap-0.5 rounded-xl border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      {formatDate(booking.startDate, locale)} – {formatDate(booking.endDate, locale)}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {booking.client.firstName} {booking.client.lastName}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
