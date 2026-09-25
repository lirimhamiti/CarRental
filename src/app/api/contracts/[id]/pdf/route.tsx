import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company";
import { ContractPdf } from "@/lib/contract-pdf";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const companyId = await getCurrentCompanyId();

  const contract = await prisma.contract.findFirst({
    where: { id, companyId },
    include: {
      drivers: { include: { client: true }, orderBy: { order: "asc" } },
      car: true,
      company: true,
    },
  });

  if (!contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  const buffer = await renderToBuffer(
    <ContractPdf
      data={{
        id: contract.id,
        createdAt: contract.createdAt,
        companyName: contract.company.name,
        companyAddress: contract.company.address,
        companyEmail: contract.company.email,
        companyPhones: contract.company.phones,
        drivers: contract.drivers.map((d) => d.client),
        car: contract.car,
        startDate: contract.startDate,
        endDate: contract.endDate,
        crossBorder: contract.crossBorder,
        gps: contract.gps,
        babySeat: contract.babySeat,
        insurance: contract.insurance,
        validForCountries: contract.validForCountries,
      }}
    />,
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="contract-${contract.id.slice(-8)}.pdf"`,
    },
  });
}
