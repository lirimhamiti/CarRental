import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { CarsManager } from "./CarsManager";

export const dynamic = "force-dynamic";

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
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-12 sm:px-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-crimson-600 dark:text-crimson-400">
            {dict.cars.eyebrow}
          </p>
          <h1 className="font-serif text-3xl text-zinc-900 dark:text-zinc-50">{dict.cars.title}</h1>
        </div>

        <CarsManager
          dict={dict}
          todayIso={today.toISOString().slice(0, 10)}
          cars={cars.map((car) => ({
            id: car.id,
            make: car.make,
            model: car.model,
            year: car.year,
            plate: car.plate,
            registrationExpiryDate: car.registrationExpiryDate.toISOString().slice(0, 10),
            transmission: car.transmission,
            fuelType: car.fuelType,
            status: car.status,
          }))}
        />
      </div>
    </main>
  );
}
