-- No-card-required free trial: every company gets 15 days of full access
-- from creation, tracked here rather than requiring a Stripe subscription
-- up front. Existing companies are backfilled to 15 days from now so they
-- aren't retroactively locked out.

ALTER TABLE "Company" ADD COLUMN "trialEndsAt" TIMESTAMP(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '15 days');
ALTER TABLE "Company" ALTER COLUMN "trialEndsAt" DROP DEFAULT;
