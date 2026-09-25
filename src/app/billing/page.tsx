import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { PRICING_PLANS } from "@/lib/pricing-plans";
import { BillingPlans } from "./BillingPlans";

export const dynamic = "force-dynamic";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const { success, canceled } = await searchParams;
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const company = await prisma.company.findUniqueOrThrow({ where: { id: user.companyId } });

  return (
    <main className="bg-showroom-light min-h-screen">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-12 sm:px-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-crimson-600 dark:text-crimson-400">
            {dict.billing.eyebrow}
          </p>
          <h1 className="font-serif text-3xl text-zinc-900 dark:text-zinc-50">{dict.billing.title}</h1>
        </div>

        {success === "1" && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
            {dict.billing.success}
          </p>
        )}
        {canceled === "1" && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400">
            {dict.billing.canceled}
          </p>
        )}

        <BillingPlans
          dict={dict}
          plans={PRICING_PLANS}
          isOwner={user.role === "OWNER"}
          subscriptionStatus={company.subscriptionStatus}
          currentPriceId={company.currentPriceId}
          trialEndsAt={company.trialEndsAt.toISOString()}
        />
      </div>
    </main>
  );
}
