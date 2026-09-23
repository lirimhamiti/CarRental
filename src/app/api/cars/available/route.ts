import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company";
import { parseDateOnly } from "@/lib/availability";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const startParam = params.get("start");
  const endParam = params.get("end");

  if (!startParam || !endParam) {
    return NextResponse.json({ error: "start and end are required" }, { status: 400 });
  }

  const start = parseDateOnly(startParam);
  const end = parseDateOnly(endParam);
  if (end < start) {
    return NextResponse.json({ error: "end must not be before start" }, { status: 400 });
  }

  const companyId = await getCurrentCompanyId();

  const cars = await prisma.car.findMany({
    where: {
      companyId,
      status: "ACTIVE",
      contracts: {
        none: {
          status: "ACTIVE",
          startDate: { lt: end },
          endDate: { gt: start },
        },
      },
    },
    orderBy: [{ make: "asc" }, { model: "asc" }],
  });

  return NextResponse.json(cars);
}
