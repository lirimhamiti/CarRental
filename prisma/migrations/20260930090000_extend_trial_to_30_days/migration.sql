-- Free trial extended from 15 to 30 days for every company. Existing
-- trialing companies get their window recomputed from their original
-- creation date rather than reset to "now", so someone partway through
-- their old 15-day trial gets the extra days added on top, not a fresh
-- 30-day clock. Companies already on a paid subscription are unaffected in
-- practice (they don't check trialEndsAt), so this only touches TRIALING
-- rows.

UPDATE "Company"
SET "trialEndsAt" = "createdAt" + INTERVAL '30 days'
WHERE "subscriptionStatus" = 'TRIALING';
