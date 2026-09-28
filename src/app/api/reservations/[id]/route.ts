import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company";
import { addNights, isRealConflict, parseDateOnly } from "@/lib/availability";

interface UpdateReservationBody {
  startDate: string;
  days: number;
  clientName: string;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as UpdateReservationBody;

  if (!body.startDate || !(Number(body.days) > 0) || !body.clientName?.trim()) {
    return NextResponse.json({ code: "MISSING_FIELDS" }, { status: 400 });
  }

  try {
    const companyId = await getCurrentCompanyId();
    const existing = await prisma.reservation.findFirst({ where: { id, companyId } });
    if (!existing) {
      return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
    }

    const startDate = parseDateOnly(body.startDate);
    const endDate = addNights(startDate, Number(body.days));

    const overlappingContracts = await prisma.contract.findMany({
      where: {
        carId: existing.carId,
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
        carId: existing.carId,
        id: { not: id },
        startDate: { lt: endDate },
        endDate: { gt: startDate },
      },
    });
    if (overlappingReservations.some((r) => isRealConflict(r.startDate, r.endDate, startDate, endDate))) {
      return NextResponse.json({ code: "CAR_UNAVAILABLE" }, { status: 409 });
    }

    await prisma.reservation.update({
      where: { id },
      data: { clientName: body.clientName.trim(), startDate, endDate },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/reservations/[id] failed:", err);
    return NextResponse.json({ code: "GENERIC" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const companyId = await getCurrentCompanyId();

  const existing = await prisma.reservation.findFirst({ where: { id, companyId } });
  if (!existing) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  await prisma.reservation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
