-- One-time data wipe, requested to reset the database to a clean slate.
-- The /admin superuser login lives in environment variables, not the
-- database, so it is unaffected by this — there is no admin row to
-- preserve or lose here.
TRUNCATE TABLE
  "ContractDriver",
  "Contract",
  "Reservation",
  "Client",
  "Car",
  "Session",
  "User",
  "Company"
CASCADE;
