import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company";
import { parseDateOnly } from "@/lib/availability";

interface UpdateCarBody {
  make: string;
  model: string;
  year?: number;
  plate: string;
  registrationExpiryDate: string;
  transmission?: "MANUAL" | "AUTOMATIC";
  fuelType?: "DIESEL" | "PETROL" | "ELECTRIC";
  status?: "ACTIVE" | "MAINTENANCE" | "RETIRED";
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as UpdateCarBody;

  const yearValid = body.year == null || (Number.isInteger(body.year) && body.year >= 1900);

  if (
    !body.make?.trim() ||
    !body.model?.trim() ||
    !body.plate?.trim() ||
    !body.registrationExpiryDate ||
    !yearValid
  ) {
    return NextResponse.json({ code: "MISSING_FIELDS" }, { status: 400 });
  }

  const companyId = await getCurrentCompanyId();
  const existing = await prisma.car.findFirst({ where: { id, companyId } });
  if (!existing) {
    return NextResponse.json({ code: "GENERIC" }, { status: 404 });
  }

  try {
    const car = await prisma.car.update({
      where: { id },
      data: {
        make: body.make.trim(),
        model: body.model.trim(),
        year: body.year ?? null,
        plate: body.plate.trim().toUpperCase(),
        registrationExpiryDate: parseDateOnly(body.registrationExpiryDate),
        transmission: body.transmission ?? null,
        fuelType: body.fuelType ?? null,
        status: body.status ?? "ACTIVE",
      },
    });
    return NextResponse.json(car);
  } catch {
    return NextResponse.json({ code: "PLATE_EXISTS" }, { status: 409 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const companyId = await getCurrentCompanyId();

  const existing = await prisma.car.findFirst({ where: { id, companyId } });
  if (!existing) {
    return NextResponse.json({ code: "GENERIC" }, { status: 404 });
  }

  // No onDelete: Cascade from Contract/Reservation to Car (unlike
  // ContractDriver -> Contract) — a car with rental history must not be
  // deletable, so this checks explicitly instead of letting the FK
  // constraint reject it with an opaque error.
  const [contractCount, reservationCount] = await Promise.all([
    prisma.contract.count({ where: { carId: id } }),
    prisma.reservation.count({ where: { carId: id } }),
  ]);
  if (contractCount > 0 || reservationCount > 0) {
    return NextResponse.json({ code: "IN_USE" }, { status: 409 });
  }

  await prisma.car.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
