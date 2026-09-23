import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { AvailabilityMatrix } from "./AvailabilityMatrix";

export const dynamic = "force-dynamic";

export default async function AvailabilityPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const companyId = await getCurrentCompanyId();

  const [cars, contracts, reservations] = await Promise.all([
    prisma.car.findMany({
      where: { companyId },
      orderBy: [{ make: "asc" }, { model: "asc" }],
    }),
    prisma.contract.findMany({
      where: { companyId, status: "ACTIVE" },
      include: { drivers: { include: { client: true }, orderBy: { order: "asc" } } },
    }),
    prisma.reservation.findMany({ where: { companyId } }),
  ]);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const bookings = contracts.map((c) => ({
    carId: c.carId,
    startDate: c.startDate,
    endDate: c.endDate,
    driverNames: c.drivers.map((d) => `${d.client.firstName} ${d.client.lastName}`).join(", "),
  }));

  const reservationRows = reservations.map((r) => ({
    carId: r.carId,
    startDate: r.startDate,
    endDate: r.endDate,
    clientName: r.clientName,
    note: r.note,
  }));

  return (
    <main className="bg-showroom-light min-h-screen">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-12 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-crimson-600 dark:text-crimson-400">
              {dict.availability.eyebrow}
            </p>
            <h1 className="font-serif text-3xl text-zinc-900 dark:text-zinc-50">
              {dict.availability.title}
            </h1>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            {dict.common.home}
          </Link>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          {cars.length === 0 ? (
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
              {dict.availability.noCars}
            </p>
          ) : (
            <>
              <AvailabilityMatrix
                cars={cars}
                bookings={bookings}
                reservations={reservationRows}
                today={today}
                dict={dict}
              />
              <p className="mt-3 text-center text-xs text-zinc-400 sm:hidden">
                {dict.cars.swipeHint}
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
