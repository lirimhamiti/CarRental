import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { isAdminAuthenticated } from "@/lib/session";

const TRIAL_DAYS = 15;

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const name = (formData.get("name") as string | null)?.trim();
  const ownerUsername = (formData.get("ownerUsername") as string | null)?.trim();
  const ownerPassword = formData.get("ownerPassword") as string | null;
  const logo = formData.get("logo") as File | null;

  if (!name || !ownerUsername || !ownerPassword) {
    return NextResponse.json({ code: "MISSING_FIELDS" }, { status: 400 });
  }

  let logoUrl: string | null = null;
  if (logo && logo.size > 0) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ code: "BLOB_NOT_CONFIGURED" }, { status: 500 });
    }
    const blob = await put(`company-logos/${Date.now()}-${logo.name}`, logo, { access: "public" });
    logoUrl = blob.url;
  }

  const passwordHash = await hashPassword(ownerPassword);

  try {
    const company = await prisma.company.create({
      data: {
        name,
        logoUrl,
        trialEndsAt: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
        users: { create: { username: ownerUsername, passwordHash, role: "OWNER" } },
      },
    });
    return NextResponse.json(company, { status: 201 });
  } catch {
    return NextResponse.json({ code: "USERNAME_EXISTS" }, { status: 409 });
  }
}
