import { redirect } from "next/navigation";
import { getSessionUser, type SessionUser } from "@/lib/session";

export function hasAccess(user: SessionUser): boolean {
  if (user.subscriptionStatus === "ACTIVE") return true;
  return user.subscriptionStatus === "TRIALING" && user.trialEndsAt > new Date();
}

export async function getCurrentUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  if (!hasAccess(user)) {
    redirect("/trial-expired");
  }
  return user;
}

export async function getCurrentCompanyId(): Promise<string> {
  const user = await getCurrentUser();
  return user.companyId;
}
