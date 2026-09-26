import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company";
import { addNights, isRealConflict, parseDateOnly } from "@/lib/availability";

interface CreateReservationBody {
  carId: string;
  startDate: string;
  days: number;
  clientName: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateReservationBody;

  if (!body.carId || !body.startDate || !(Number(body.days) > 0) || !body.clientName?.trim()) {
    return NextResponse.json({ code: "MISSING_FIELDS" }, { status: 400 });
  }

  try {
    const companyId = await getCurrentCompanyId();
    const car = await prisma.car.findFirst({ where: { id: body.carId, companyId } });
    if (!car) {
      return NextResponse.json({ code: "CAR_NOT_FOUND" }, { status: 404 });
    }

    const startDate = parseDateOnly(body.startDate);
    const endDate = addNights(startDate, Number(body.days));

    const overlappingContracts = await prisma.contract.findMany({
      where: {
        carId: car.id,
        status: "ACTIVE",
        startDate: { lt: endDate },
        endDate: { gt: startDate },
      },
    });
    if (overlappingContracts.some((c) => isRealConflict(c.startDate, c.endDate, startDate, endDate))) {
      return NextResponse.json({ code: "CAR_UNAVAILABLE" }, { status: 409 });
    }

    const overlappingReservations = await prisma.reservation.findMany({
      where: {
        carId: car.id,
        startDate: { lt: endDate },
        endDate: { gt: startDate },
      },
    });
    if (overlappingReservations.some((r) => isRealConflict(r.startDate, r.endDate, startDate, endDate))) {
      return NextResponse.json({ code: "CAR_UNAVAILABLE" }, { status: 409 });
    }

    const reservation = await prisma.reservation.create({
      data: {
        companyId,
        carId: car.id,
        clientName: body.clientName.trim(),
        startDate,
        endDate,
      },
    });
    return NextResponse.json({ id: reservation.id });
  } catch (err) {
    console.error("POST /api/reservations failed:", err);
    return NextResponse.json({ code: "GENERIC" }, { status: 500 });
  }
}
