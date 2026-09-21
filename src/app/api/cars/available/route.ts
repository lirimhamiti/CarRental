import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company";
import { computeEndDate, parseDateOnly } from "@/lib/availability";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const startParam = params.get("start");
  const days = Number(params.get("days"));

  if (!startParam || !Number.isInteger(days) || days < 1) {
    return NextResponse.json(
      { error: "start and days (positive integer) are required" },
      { status: 400 },
    );
  }

  const start = parseDateOnly(startParam);
  const end = computeEndDate(start, days);
  const companyId = await getCurrentCompanyId();

  const cars = await prisma.car.findMany({
    where: {
      companyId,
      status: "ACTIVE",
      contracts: {
        none: {
          status: "ACTIVE",
          startDate: { lte: end },
          endDate: { gte: start },
        },
      },
    },
    orderBy: [{ make: "asc" }, { model: "asc" }],
  });

  return NextResponse.json(cars);
}
