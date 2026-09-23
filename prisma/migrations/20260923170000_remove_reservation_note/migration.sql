-- Reservation notes were removed as a feature (the note field and its
-- return-day hint in the availability matrix). This does not touch the
-- nights/half-open-interval fix from the previous migration.

ALTER TABLE "Reservation" DROP COLUMN "note";
