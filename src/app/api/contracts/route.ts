import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company";
import { computeEndDate, parseDateOnly } from "@/lib/availability";

interface CreateContractBody {
  clientId?: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  email?: string;
  phone?: string;
  carId: string;
  startDate: string;
  days: number;
  dailyPrice: number;
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateContractBody;

  if (
    !body.firstName?.trim() ||
    !body.lastName?.trim() ||
    !body.documentNumber?.trim() ||
    !body.carId ||
    !body.startDate ||
    !Number.isInteger(body.days) ||
    body.days < 1 ||
    !(Number(body.dailyPrice) > 0)
  ) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  const companyId = await getCurrentCompanyId();
  const startDate = parseDateOnly(body.startDate);
  const endDate = computeEndDate(startDate, body.days);
  const dailyPrice = Number(body.dailyPrice);
  const totalPrice = dailyPrice * body.days;

  const car = await prisma.car.findFirst({ where: { id: body.carId, companyId } });
  if (!car) {
    return NextResponse.json({ error: "Car not found" }, { status: 404 });
  }

  const overlapping = await prisma.contract.findFirst({
    where: {
      carId: car.id,
      status: "ACTIVE",
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
  });
  if (overlapping) {
    return NextResponse.json(
      { error: "This car is no longer available for the selected dates" },
      { status: 409 },
    );
  }

  let clientId = body.clientId;
  if (clientId) {
    const existing = await prisma.client.findFirst({ where: { id: clientId, companyId } });
    if (!existing) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    await prisma.client.update({
      where: { id: clientId },
      data: {
        firstName: body.firstName.trim(),
        lastName: body.lastName.trim(),
        documentNumber: body.documentNumber.trim(),
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
      },
    });
  } else {
    const created = await prisma.client.create({
      data: {
        companyId,
        firstName: body.firstName.trim(),
        lastName: body.lastName.trim(),
        documentNumber: body.documentNumber.trim(),
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
      },
    });
    clientId = created.id;
  }

  try {
    const contract = await prisma.contract.create({
      data: {
        companyId,
        clientId,
        carId: car.id,
        startDate,
        endDate,
        dailyPrice,
        totalPrice,
      },
    });
    return NextResponse.json({ id: contract.id });
  } catch {
    // Guards the race condition the app-level check above can't fully close;
    // the DB exclusion constraint (see migration car_no_overlap) rejects it.
    return NextResponse.json(
      { error: "This car is no longer available for the selected dates" },
      { status: 409 },
    );
  }
}
