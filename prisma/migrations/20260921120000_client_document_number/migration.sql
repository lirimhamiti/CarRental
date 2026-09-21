-- Simplify client identity: merge nationalId/passportNo into a single
-- mandatory documentNumber field, add optional email, drop unused address.
ALTER TABLE "Client" DROP COLUMN "nationalId";
ALTER TABLE "Client" DROP COLUMN "passportNo";
ALTER TABLE "Client" DROP COLUMN "address";

ALTER TABLE "Client" ADD COLUMN "documentNumber" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Client" ALTER COLUMN "documentNumber" DROP DEFAULT;

ALTER TABLE "Client" ADD COLUMN "email" TEXT;
