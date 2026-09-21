import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company";
import { formatDate, isDateInRange } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-12 sm:px-8">
      <Link href="/cars" className="text-sm text-zinc-500 hover:underline">
        ← Cars
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {car.make} {car.model} ({car.year})
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {car.plate} · {car.status}
        </p>
      </div>

      <div
        className={`rounded-lg border p-4 text-sm font-medium ${
          currentBooking
            ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            : "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
        }`}
      >
        {currentBooking
          ? `Not free right now — rented out until ${formatDate(currentBooking.endDate)}`
          : "Free right now"}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Booked dates
        </h2>
        {upcomingBookings.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No upcoming bookings — this car is free for any date.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {upcomingBookings.map((booking) => (
              <li
                key={booking.id}
                className="flex flex-col gap-0.5 rounded-lg border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  {booking.client.firstName} {booking.client.lastName}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
