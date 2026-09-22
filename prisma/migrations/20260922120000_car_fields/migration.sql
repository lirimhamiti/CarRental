-- Add-car form changes: year becomes optional, registration expiry date
-- becomes required (existing cars are backfilled to one year from today as
-- a placeholder — should be corrected per car), and transmission/fuel type
-- are new optional fields.

ALTER TABLE "Car" ALTER COLUMN "year" DROP NOT NULL;

ALTER TABLE "Car" ADD COLUMN "registrationExpiryDate" DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 year');
ALTER TABLE "Car" ALTER COLUMN "registrationExpiryDate" DROP DEFAULT;

CREATE TYPE "CarTransmission" AS ENUM ('MANUAL', 'AUTOMATIC');
CREATE TYPE "CarFuelType" AS ENUM ('DIESEL', 'PETROL', 'ELECTRIC');

ALTER TABLE "Car" ADD COLUMN "transmission" "CarTransmission";
ALTER TABLE "Car" ADD COLUMN "fuelType" "CarFuelType";
