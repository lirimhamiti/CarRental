-- Expand Client into a full driver profile (birth date, split passport /
-- driving licence identifiers with issue+expiry dates), drop email (no
-- longer part of the required field set), and let a contract list more
-- than one driver via a join table instead of a single clientId FK.
-- Existing documentNumber values are preserved by migrating them into
-- passportNumber so no client data is lost.

ALTER TABLE "Client" ADD COLUMN "birthDate" DATE NOT NULL DEFAULT '2000-01-01';
ALTER TABLE "Client" ALTER COLUMN "birthDate" DROP DEFAULT;

ALTER TABLE "Client" ADD COLUMN "passportNumber" TEXT;
ALTER TABLE "Client" ADD COLUMN "passportIssueDate" DATE;
ALTER TABLE "Client" ADD COLUMN "passportExpiryDate" DATE;
ALTER TABLE "Client" ADD COLUMN "licenceNumber" TEXT;
ALTER TABLE "Client" ADD COLUMN "licenceIssueDate" DATE;
ALTER TABLE "Client" ADD COLUMN "licenceExpiryDate" DATE;

UPDATE "Client" SET "passportNumber" = "documentNumber" WHERE "documentNumber" IS NOT NULL AND "documentNumber" != '';

ALTER TABLE "Client" DROP COLUMN "documentNumber";
ALTER TABLE "Client" DROP COLUMN "email";

-- CreateTable
CREATE TABLE "ContractDriver" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ContractDriver_pkey" PRIMARY KEY ("id")
);

INSERT INTO "ContractDriver" ("id", "contractId", "clientId", "order")
SELECT gen_random_uuid()::text, "id", "clientId", 0 FROM "Contract";

ALTER TABLE "Contract" DROP CONSTRAINT "Contract_clientId_fkey";
ALTER TABLE "Contract" DROP COLUMN "clientId";

-- CreateIndex
CREATE UNIQUE INDEX "ContractDriver_contractId_clientId_key" ON "ContractDriver"("contractId", "clientId");
CREATE INDEX "ContractDriver_contractId_idx" ON "ContractDriver"("contractId");
CREATE INDEX "ContractDriver_clientId_idx" ON "ContractDriver"("clientId");

-- AddForeignKey
ALTER TABLE "ContractDriver" ADD CONSTRAINT "ContractDriver_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContractDriver" ADD CONSTRAINT "ContractDriver_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
