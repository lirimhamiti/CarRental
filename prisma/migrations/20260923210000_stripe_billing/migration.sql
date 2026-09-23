-- Tracks the live Stripe subscription behind each company's billing state,
-- kept in sync by the /api/billing/webhook handler.

ALTER TABLE "Company" ADD COLUMN "stripeSubscriptionId" TEXT;
ALTER TABLE "Company" ADD COLUMN "currentPriceId" TEXT;

CREATE UNIQUE INDEX "Company_stripeSubscriptionId_key" ON "Company"("stripeSubscriptionId");
