import { NextResponse } from "next/server";
import { verifyAdminCredentials } from "@/lib/auth";
import { createAdminSession } from "@/lib/session";

interface LoginBody {
  username: string;
  password: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as LoginBody;
  const username = body.username?.trim();
  const password = body.password;

  if (!username || !password || !(await verifyAdminCredentials(username, password))) {
    return NextResponse.json({ code: "INVALID_CREDENTIALS" }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
