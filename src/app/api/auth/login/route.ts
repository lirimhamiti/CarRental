import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { createUserSession } from "@/lib/session";

interface LoginBody {
  username: string;
  password: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as LoginBody;
  const username = body.username?.trim();
  const password = body.password;

  if (!username || !password) {
    return NextResponse.json({ code: "MISSING_FIELDS" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ code: "INVALID_CREDENTIALS" }, { status: 401 });
  }

  await createUserSession(user.id);
  return NextResponse.json({ ok: true, role: user.role });
}
