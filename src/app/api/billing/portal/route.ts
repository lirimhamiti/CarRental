import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "OWNER") {
    return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  }

  try {
    const company = await prisma.company.findUniqueOrThrow({ where: { id: user.companyId } });
    if (!company.stripeCustomerId) {
      return NextResponse.json({ code: "NO_SUBSCRIPTION" }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const session = await stripe.billingPortal.sessions.create({
      customer: company.stripeCustomerId,
      return_url: `${origin}/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("POST /api/billing/portal failed:", err);
    return NextResponse.json({ code: "GENERIC" }, { status: 500 });
  }
}
