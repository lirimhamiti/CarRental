-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "babySeat" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "crossBorder" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "gps" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "insurance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "remark" TEXT,
ADD COLUMN     "validForCountries" TEXT[] DEFAULT ARRAY[]::TEXT[];
