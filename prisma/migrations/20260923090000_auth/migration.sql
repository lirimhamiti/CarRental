-- Company/staff auth. Companies get a logo; the User table becomes a
-- username+password login table with a role (OWNER or the up-to-3 STAFF
-- accounts an owner can create), replacing the unused email/name placeholder
-- columns. A Session table backs login cookies so a removed staff user's
-- active session can be revoked immediately, not just blocked going forward.

CREATE TYPE "Role" AS ENUM ('OWNER', 'STAFF');

ALTER TABLE "Company" ADD COLUMN "logoUrl" TEXT;

DROP INDEX "User_email_key";
ALTER TABLE "User" DROP COLUMN "email";
ALTER TABLE "User" DROP COLUMN "name";
ALTER TABLE "User" ADD COLUMN "username" TEXT;
ALTER TABLE "User" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'STAFF';
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Session_userId_idx" ON "Session"("userId");

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
