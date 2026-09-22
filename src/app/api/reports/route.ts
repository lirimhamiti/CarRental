import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company";

const PERIOD_MONTHS: Record<string, number> = {
  "1m": 1,
  "3m": 3,
  "6m": 6,
  "1y": 12,
};

function monthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const carId = params.get("carId") ?? "all";
  const period = params.get("period") ?? "6m";
  const months = PERIOD_MONTHS[period];

  if (!months) {
    return NextResponse.json({ code: "INVALID_PERIOD" }, { status: 400 });
  }

  const companyId = await getCurrentCompanyId();

  const today = new Date();
  const currentYear = today.getUTCFullYear();
  const currentMonth = today.getUTCMonth();

  const startMonthIndex = currentYear * 12 + currentMonth - (months - 1);
  const startYear = Math.floor(startMonthIndex / 12);
  const startMonth = ((startMonthIndex % 12) + 12) % 12;
  const rangeStart = new Date(Date.UTC(startYear, startMonth, 1));
  const rangeEnd = new Date(Date.UTC(currentYear, currentMonth + 1, 0));

  if (carId !== "all") {
    const car = await prisma.car.findFirst({ where: { id: carId, companyId } });
    if (!car) {
      return NextResponse.json({ code: "CAR_NOT_FOUND" }, { status: 404 });
    }
  }

  const contracts = await prisma.contract.findMany({
    where: {
      companyId,
      status: { not: "CANCELED" },
      startDate: { gte: rangeStart, lte: rangeEnd },
      ...(carId !== "all" ? { carId } : {}),
    },
    include: { car: true },
  });

  const monthBuckets = new Map<string, number>();
  for (let i = 0; i < months; i++) {
    const index = startMonthIndex + i;
    const year = Math.floor(index / 12);
    const month = ((index % 12) + 12) % 12;
    monthBuckets.set(monthKey(year, month), 0);
  }

  const carTotals = new Map<string, { label: string; income: number }>();
  let totalIncome = 0;

  for (const contract of contracts) {
    const price = Number(contract.totalPrice);
    totalIncome += price;

    const key = monthKey(contract.startDate.getUTCFullYear(), contract.startDate.getUTCMonth());
    monthBuckets.set(key, (monthBuckets.get(key) ?? 0) + price);

    const existing = carTotals.get(contract.carId);
    const label = `${contract.car.make} ${contract.car.model}`;
    carTotals.set(contract.carId, {
      label,
      income: (existing?.income ?? 0) + price,
    });
  }

  const monthly = Array.from(monthBuckets.entries()).map(([key, income]) => {
    const [, monthStr] = key.split("-");
    return { monthIndex: Number(monthStr) - 1, income };
  });

  const byCar = Array.from(carTotals.values()).sort((a, b) => b.income - a.income);

  return NextResponse.json({
    totalIncome,
    contractCount: contracts.length,
    monthly,
    byCar,
  });
}
