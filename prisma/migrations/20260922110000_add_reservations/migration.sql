-- Lightweight pre-contract holds on a car for a date range, created by
-- clicking a free cell in the fleet availability matrix.

CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Reservation_companyId_idx" ON "Reservation"("companyId");
CREATE INDEX "Reservation_carId_startDate_endDate_idx" ON "Reservation"("carId", "startDate", "endDate");

ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
