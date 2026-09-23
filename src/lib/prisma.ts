import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Parse sslmode ourselves and pass it as an explicit `ssl` option instead of
// leaving it in the connection string — pg-connection-string's sslmode
// aliasing (prefer/require/verify-ca -> verify-full) is deprecated and logs
// a warning otherwise. Local dev Postgres has no sslmode param, so it's
// unaffected.
const url = new URL(process.env.DATABASE_URL!);
const requiresSsl = url.searchParams.has("sslmode");
url.searchParams.delete("sslmode");
url.searchParams.delete("channel_binding");

const adapter = new PrismaPg({
  connectionString: url.toString(),
  ssl: requiresSsl ? true : undefined,
});

// Cached in every environment, not just dev: a warm serverless instance on
// Vercel reuses this module scope across requests, so without caching here
// each request opens a brand-new, never-closed DB connection on top of the
// last — connections pile up on that instance until Neon's limit is hit and
// queries start failing intermittently.
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
globalForPrisma.prisma = prisma;
