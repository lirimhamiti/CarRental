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
    include: { client: true, car: true, company: true },
  });

  if (!contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  const days =
    Math.round(
      (contract.endDate.getTime() - contract.startDate.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1;

  const buffer = await renderToBuffer(
    <ContractPdf
      data={{
        id: contract.id,
        createdAt: contract.createdAt,
        companyName: contract.company.name,
        client: contract.client,
        car: contract.car,
        startDate: contract.startDate,
        endDate: contract.endDate,
        days,
        dailyPrice: Number(contract.dailyPrice),
        totalPrice: Number(contract.totalPrice),
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
