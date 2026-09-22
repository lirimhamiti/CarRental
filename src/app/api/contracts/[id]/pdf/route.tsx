import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company";
import { daysBetweenInclusive } from "@/lib/availability";
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

  const days = daysBetweenInclusive(contract.startDate, contract.endDate);

  const buffer = await renderToBuffer(
    <ContractPdf
      data={{
        id: contract.id,
        createdAt: contract.createdAt,
        companyName: contract.company.name,
        drivers: contract.drivers.map((d) => d.client),
        car: contract.car,
        startDate: contract.startDate,
        endDate: contract.endDate,
        days,
        dailyPrice: contract.dailyPrice != null ? Number(contract.dailyPrice) : null,
        totalPrice: contract.totalPrice != null ? Number(contract.totalPrice) : null,
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
