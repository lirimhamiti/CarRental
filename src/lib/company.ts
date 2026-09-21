import { prisma } from "@/lib/prisma";

// Placeholder until auth exists: every page resolves "the current company"
// through this one function. Once login is added, this becomes the only
// place that changes — read companyId from the session instead.
export async function getCurrentCompanyId(): Promise<string> {
  const company = await prisma.company.findFirstOrThrow({
    orderBy: { createdAt: "asc" },
  });
  return company.id;
}
