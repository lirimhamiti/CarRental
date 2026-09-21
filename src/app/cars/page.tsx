import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company";

export const dynamic = "force-dynamic";

export default async function CarsPage() {
  const companyId = await getCurrentCompanyId();
  const cars = await prisma.car.findMany({
    where: { companyId },
    orderBy: [{ make: "asc" }, { model: "asc" }],
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-12 sm:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Cars
        </h1>
        <Link href="/" className="text-sm text-zinc-500 hover:underline">
          ← Home
        </Link>
      </div>

      {cars.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No cars yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {cars.map((car) => (
            <Link
              key={car.id}
              href={`/cars/${car.id}`}
              className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {car.make} {car.model} ({car.year})
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {car.plate} · {car.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
