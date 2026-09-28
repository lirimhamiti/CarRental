import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company";
import {
  contractWriteErrorStatus,
  isContractBodyValid,
  prepareContractWrite,
  type ContractBody,
} from "@/lib/contract-service";

const PAGE_SIZE = 20;

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const q = params.get("q")?.trim() ?? "";
  const page = Math.max(1, Number(params.get("page")) || 1);

  const companyId = await getCurrentCompanyId();

  const where: Prisma.ContractWhereInput = {
    companyId,
    ...(q
      ? {
          OR: [
            { id: q },
            { car: { make: { contains: q, mode: "insensitive" } } },
            { car: { model: { contains: q, mode: "insensitive" } } },
            { car: { plate: { contains: q, mode: "insensitive" } } },
            { drivers: { some: { client: { firstName: { contains: q, mode: "insensitive" } } } } },
            { drivers: { some: { client: { lastName: { contains: q, mode: "insensitive" } } } } },
          ],
        }
      : {}),
  };

  const [total, contracts] = await Promise.all([
    prisma.contract.count({ where }),
    prisma.contract.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        car: true,
        drivers: { include: { client: true }, orderBy: { order: "asc" } },
      },
    }),
  ]);

  return NextResponse.json({
    contracts: contracts.map((c) => ({
      id: c.id,
      createdAt: c.createdAt,
      startDate: c.startDate,
      endDate: c.endDate,
      totalPrice: c.totalPrice != null ? Number(c.totalPrice) : null,
      car: { make: c.car.make, model: c.car.model, year: c.car.year, plate: c.car.plate },
      drivers: c.drivers.map((d) => ({ firstName: d.client.firstName, lastName: d.client.lastName })),
    })),
    total,
    page,
    pageSize: PAGE_SIZE,
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as ContractBody;

  if (!isContractBodyValid(body)) {
    return NextResponse.json({ code: "MISSING_FIELDS" }, { status: 400 });
  }

  try {
    const companyId = await getCurrentCompanyId();
    const prepared = await prepareContractWrite(body, companyId);
    if ("error" in prepared) {
      return NextResponse.json({ code: prepared.error }, { status: contractWriteErrorStatus(prepared.error) });
    }

    try {
      const contract = await prisma.contract.create({
        data: {
          companyId,
          carId: prepared.carId,
          startDate: prepared.startDate,
          endDate: prepared.endDate,
          dailyPrice: prepared.dailyPrice,
          totalPrice: prepared.totalPrice,
          crossBorder: body.crossBorder ?? true,
          gps: body.gps ?? false,
          babySeat: body.babySeat ?? false,
          insurance: body.insurance ?? false,
          outOfHours: body.outOfHours ?? false,
          validForCountries: prepared.validForCountries,
          drivers: {
            create: prepared.clientIds.map((clientId, order) => ({ clientId, order })),
          },
        },
      });
      return NextResponse.json({ id: contract.id });
    } catch {
      // Guards the race condition the app-level check above can't fully close;
      // the DB exclusion constraint (see migration car_no_overlap) rejects it.
      return NextResponse.json({ code: "CAR_UNAVAILABLE" }, { status: 409 });
    }
  } catch (err) {
    // Any unexpected failure (e.g. a DB schema out of sync with a pending
    // migration) must still return JSON — an uncaught throw here leaves the
    // client with an empty response body and a confusing JSON-parse crash.
    console.error("POST /api/contracts failed:", err);
    return NextResponse.json({ code: "GENERIC" }, { status: 500 });
  }
}
