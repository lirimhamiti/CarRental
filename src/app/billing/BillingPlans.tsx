"use client";

import { useState } from "react";
import { primaryButtonClass } from "@/components/ui";
import { interpolate, type Dictionary } from "@/lib/i18n/get-dictionary";
import { formatDate } from "@/lib/dates";
import type { PlanTier, PricingPlan } from "@/lib/pricing-plans";

const TIERS: PlanTier[] = ["SMALL", "LARGE"];

interface Props {
  dict: Dictionary;
  plans: PricingPlan[];
  isOwner: boolean;
  subscriptionStatus: "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED";
  currentPriceId: string | null;
  trialEndsAt: string;
}

function planLabel(plans: PricingPlan[], priceId: string | null, dict: Dictionary): string {
  const plan = plans.find((p) => p.priceId === priceId);
  if (!plan) return "—";
  return `${dict.billing.tiers[plan.tier]} · ${dict.billing.intervals[plan.interval]}`;
}

export function BillingPlans({
  dict,
  plans,
  isOwner,
  subscriptionStatus,
  currentPriceId,
  trialEndsAt,
}: Props) {
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function subscribe(priceId: string) {
    setError(null);
    setLoadingPriceId(priceId);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(dict.contracts.errors.GENERIC);
        return;
      }
      window.location.href = data.url;
    } finally {
      setLoadingPriceId(null);
    }
  }

  async function openPortal() {
    setError(null);
    setLoadingPortal(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(dict.contracts.errors.GENERIC);
        return;
      }
      window.location.href = data.url;
    } finally {
      setLoadingPortal(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {subscriptionStatus === "ACTIVE" ? (
        <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {dict.billing.currentPlan}
            </p>
            <p className="mt-1 font-serif text-lg text-zinc-900 dark:text-zinc-50">
              {planLabel(plans, currentPriceId, dict)}
            </p>
          </div>
          {isOwner && (
            <button
              type="button"
              onClick={openPortal}
              disabled={loadingPortal}
              className={primaryButtonClass}
            >
              {dict.billing.manage}
            </button>
          )}
        </div>
      ) : (
        subscriptionStatus === "TRIALING" && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {interpolate(dict.billing.trialUntil, { date: formatDate(new Date(trialEndsAt)) })}
          </p>
        )
      )}

      {!isOwner && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400">
          {dict.billing.ownerOnly}
        </p>
      )}

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      {TIERS.map((tier) => (
        <div key={tier} className="flex flex-col gap-3">
          <h2 className="font-serif text-lg text-zinc-900 dark:text-zinc-50">{dict.billing.tiers[tier]}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {plans
              .filter((plan) => plan.tier === tier)
              .map((plan) => {
                const isCurrent = plan.priceId === currentPriceId && subscriptionStatus === "ACTIVE";
                return (
                  <div
                    key={plan.priceId}
                    className={`flex flex-col gap-3 rounded-xl border p-5 ${
                      isCurrent
                        ? "border-crimson-500 bg-crimson-50/40 dark:bg-crimson-500/5"
                        : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                    }`}
                  >
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {dict.billing.intervals[plan.interval]}
                    </p>
                    <p className="font-serif text-2xl text-zinc-900 dark:text-zinc-50">€{plan.amountEur}</p>
                    <button
                      type="button"
                      onClick={() => subscribe(plan.priceId)}
                      disabled={!isOwner || loadingPriceId === plan.priceId || isCurrent}
                      className={`${primaryButtonClass} justify-center`}
                    >
                      {isCurrent ? dict.billing.currentPlan : dict.billing.subscribe}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
