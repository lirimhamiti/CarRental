import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/company";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (currentUser.role !== "OWNER") {
    return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await params;

  const target = await prisma.user.findFirst({ where: { id, companyId: currentUser.companyId } });
  if (!target) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }
  if (target.role === "OWNER") {
    return NextResponse.json({ code: "CANNOT_REMOVE_OWNER" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.session.deleteMany({ where: { userId: id } }),
    prisma.user.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}
