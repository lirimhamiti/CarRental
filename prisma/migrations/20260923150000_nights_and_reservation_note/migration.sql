-- Rental length is counted in nights, not calendar days: a car picked up on
-- the 20th and returned on the 27th is rented for 7 nights, and is free
-- again for a new rental starting the 27th (same-day turnover). This means
-- endDate is now a half-open boundary (the checkout day, not the last
-- occupied day), so the no-overlap constraint changes from an inclusive
-- range '[]' to a half-open range '[)' — two contracts [20,23) and [23,27)
-- no longer count as overlapping.

ALTER TABLE "Contract" DROP CONSTRAINT "Contract_car_no_overlap";

ALTER TABLE "Contract"
  ADD CONSTRAINT "Contract_car_no_overlap"
  EXCLUDE USING gist (
    "carId" WITH =,
    daterange("startDate", "endDate", '[)') WITH &&
  )
  WHERE (status = 'ACTIVE');

-- Lets staff annotate a reservation, e.g. to note that the car is still due
-- back from a previous rental that same day before being handed over again.
ALTER TABLE "Reservation" ADD COLUMN "note" TEXT;
