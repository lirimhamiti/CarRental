import { redirect } from "next/navigation";
import { getSessionUser, type SessionUser } from "@/lib/session";

export async function getCurrentUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function getCurrentCompanyId(): Promise<string> {
  const user = await getCurrentUser();
  return user.companyId;
}
