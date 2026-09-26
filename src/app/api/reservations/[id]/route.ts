import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const companyId = await getCurrentCompanyId();
  const { id } = await params;

  const reservation = await prisma.reservation.findFirst({ where: { id, companyId } });
  if (!reservation) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  await prisma.reservation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
