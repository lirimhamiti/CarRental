import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company";

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
