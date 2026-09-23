-- One-time reset: give every existing company 12 more days of trial (as if
-- each were created 3 days ago under the 15-day trial), so accounts created
-- for testing before the trial gate existed aren't all immediately locked
-- out. Companies already on an ACTIVE subscription are unaffected in
-- practice (they don't check trialEndsAt at all), this just keeps the
-- column non-null and sane for them too.

UPDATE "Company" SET "trialEndsAt" = CURRENT_TIMESTAMP + INTERVAL '12 days';
