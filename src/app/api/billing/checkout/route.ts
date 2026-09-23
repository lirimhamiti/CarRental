import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { findPlan } from "@/lib/pricing-plans";

interface CheckoutBody {
  priceId: string;
}

// Uses getSessionUser() rather than the access-gated getCurrentUser() —
// this route is exactly how a company with an expired trial gets back in,
// so it can't itself be blocked by the trial gate.
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "OWNER") {
    return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  }

  const body = (await request.json()) as CheckoutBody;
  const plan = findPlan(body.priceId);
  if (!plan) {
    return NextResponse.json({ code: "INVALID_PLAN" }, { status: 400 });
  }

  try {
    const company = await prisma.company.findUniqueOrThrow({ where: { id: user.companyId } });

    let stripeCustomerId = company.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        name: company.name,
        metadata: { companyId: company.id },
      });
      stripeCustomerId = customer.id;
      await prisma.company.update({ where: { id: company.id }, data: { stripeCustomerId } });
    }

    const origin = new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${origin}/billing?success=1`,
      cancel_url: `${origin}/billing?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("POST /api/billing/checkout failed:", err);
    return NextResponse.json({ code: "GENERIC" }, { status: 500 });
  }
}
