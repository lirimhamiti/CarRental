import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { getCurrentUser } from "@/lib/company";

const MAX_STAFF_USERS = 3;

interface CreateUserBody {
  username: string;
  password: string;
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (currentUser.role !== "OWNER") {
    return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  }

  const body = (await request.json()) as CreateUserBody;
  const username = body.username?.trim();
  const password = body.password;

  if (!username || !password || password.length < 6) {
    return NextResponse.json({ code: "MISSING_FIELDS" }, { status: 400 });
  }

  const staffCount = await prisma.user.count({
    where: { companyId: currentUser.companyId, role: "STAFF" },
  });
  if (staffCount >= MAX_STAFF_USERS) {
    return NextResponse.json({ code: "LIMIT_REACHED" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: { companyId: currentUser.companyId, username, passwordHash, role: "STAFF" },
    });
    return NextResponse.json({ id: user.id, username: user.username, role: user.role }, { status: 201 });
  } catch {
    return NextResponse.json({ code: "USERNAME_EXISTS" }, { status: 409 });
  }
}
