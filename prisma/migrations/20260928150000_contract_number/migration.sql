-- Human-facing contract number: ddMMyy + a 2-digit per-company daily
-- sequence (e.g. "28092601"), assigned once at creation. Added as nullable
-- first so existing rows can be backfilled before it's made required.
ALTER TABLE "Contract" ADD COLUMN "number" TEXT;

-- Backfill existing contracts with a number derived from when each one was
-- created, numbering same-company/same-day contracts in creation order.
WITH numbered AS (
  SELECT
    "id",
    to_char("createdAt", 'DDMMYY') || lpad(
      (ROW_NUMBER() OVER (
        PARTITION BY "companyId", to_char("createdAt", 'DDMMYY')
        ORDER BY "createdAt"
      ))::text,
      2,
      '0'
    ) AS computed_number
  FROM "Contract"
)
UPDATE "Contract"
SET "number" = numbered.computed_number
FROM numbered
WHERE "Contract"."id" = numbered."id";

-- AlterTable
ALTER TABLE "Contract" ALTER COLUMN "number" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Contract_companyId_number_key" ON "Contract"("companyId", "number");
