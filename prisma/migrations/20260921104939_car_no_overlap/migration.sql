-- Prevent double-booking: no two ACTIVE contracts for the same car may have
-- overlapping [startDate, endDate] ranges. Enforced at the database level so
-- a race condition between two concurrent bookings can never slip through,
-- even if the application-level availability check is bypassed or buggy.

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Contract"
  ADD CONSTRAINT "Contract_car_no_overlap"
  EXCLUDE USING gist (
    "carId" WITH =,
    daterange("startDate", "endDate", '[]') WITH &&
  )
  WHERE (status = 'ACTIVE');
