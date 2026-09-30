import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company";
import {
  contractWriteErrorStatus,
  isContractBodyValid,
  prepareContractWrite,
  type ContractBody,
} from "@/lib/contract-service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const companyId = await getCurrentCompanyId();

  const contract = await prisma.contract.findFirst({
    where: { id, companyId },
    include: {
      drivers: { include: { client: true }, orderBy: { order: "asc" } },
      car: true,
    },
  });

  if (!contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  const dateOnly = (d: Date) => d.toISOString().slice(0, 10);

  return NextResponse.json({
    id: contract.id,
    carId: contract.carId,
    startDate: dateOnly(contract.startDate),
    endDate: dateOnly(contract.endDate),
    totalPrice: contract.totalPrice != null ? Number(contract.totalPrice) : null,
    crossBorder: contract.crossBorder,
    gps: contract.gps,
    babySeat: contract.babySeat,
    insurance: contract.insurance,
    outOfHours: contract.outOfHours,
    validForCountries: contract.validForCountries,
    drivers: contract.drivers.map((d) => ({
      clientId: d.client.id,
      firstName: d.client.firstName,
      lastName: d.client.lastName,
      birthDate: dateOnly(d.client.birthDate),
      passportNumber: d.client.passportNumber ?? "",
      passportIssueDate: d.client.passportIssueDate ? dateOnly(d.client.passportIssueDate) : "",
      passportExpiryDate: d.client.passportExpiryDate ? dateOnly(d.client.passportExpiryDate) : "",
      licenceNumber: d.client.licenceNumber ?? "",
      licenceIssueDate: d.client.licenceIssueDate ? dateOnly(d.client.licenceIssueDate) : "",
      licenceExpiryDate: d.client.licenceExpiryDate ? dateOnly(d.client.licenceExpiryDate) : "",
    })),
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as ContractBody;

  if (!isContractBodyValid(body)) {
    return NextResponse.json({ code: "MISSING_FIELDS" }, { status: 400 });
  }

  try {
    const companyId = await getCurrentCompanyId();
    const existing = await prisma.contract.findFirst({ where: { id, companyId } });
    if (!existing) {
      return NextResponse.json({ code: "GENERIC" }, { status: 404 });
    }

    const prepared = await prepareContractWrite(body, companyId, id);
    if ("error" in prepared) {
      return NextResponse.json({ code: prepared.error }, { status: contractWriteErrorStatus(prepared.error) });
    }

    try {
      await prisma.contract.update({
        where: { id },
        data: {
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
            deleteMany: {},
            create: prepared.clientIds.map((clientId, order) => ({ clientId, order })),
          },
        },
      });
      return NextResponse.json({ id });
    } catch {
      // Guards the race condition the app-level check above can't fully close;
      // the DB exclusion constraint (see migration car_no_overlap) rejects it.
      return NextResponse.json({ code: "CAR_UNAVAILABLE" }, { status: 409 });
    }
  } catch (err) {
    console.error("PATCH /api/contracts/[id] failed:", err);
    return NextResponse.json({ code: "GENERIC" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const companyId = await getCurrentCompanyId();

  const existing = await prisma.contract.findFirst({ where: { id, companyId } });
  if (!existing) {
    return NextResponse.json({ code: "GENERIC" }, { status: 404 });
  }

  // ContractDriver rows cascade with the contract; the Client rows behind
  // them are left alone since they're reusable across other contracts.
  await prisma.contract.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
