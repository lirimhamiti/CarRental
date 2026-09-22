-- Price is now entered as a single total (not a daily rate × days), and is
-- optional — a contract can be created without a price set yet.

ALTER TABLE "Contract" ALTER COLUMN "dailyPrice" DROP NOT NULL;
ALTER TABLE "Contract" ALTER COLUMN "totalPrice" DROP NOT NULL;
