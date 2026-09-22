import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/company";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { AddUserForm } from "./AddUserForm";
import { RemoveUserButton } from "./RemoveUserButton";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const currentUser = await getCurrentUser();
  if (currentUser.role !== "OWNER") {
    redirect("/");
  }

  const locale = await getLocale();
  const dict = getDictionary(locale);

  const users = await prisma.user.findMany({
    where: { companyId: currentUser.companyId },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });
  const staffCount = users.filter((u) => u.role === "STAFF").length;

  return (
    <main className="bg-showroom-light min-h-screen">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12 sm:px-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-crimson-600 dark:text-crimson-400">
            {dict.users.eyebrow}
          </p>
          <h1 className="font-serif text-3xl text-zinc-900 dark:text-zinc-50">{dict.users.title}</h1>
        </div>

        <AddUserForm dict={dict} disabled={staffCount >= 3} />

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="px-6 py-3 font-medium">{dict.users.table.username}</th>
                <th className="px-6 py-3 font-medium">{dict.users.table.role}</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">{user.username}</td>
                  <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400">
                    {user.role === "OWNER" ? dict.users.roleOwner : dict.users.roleStaff}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.role === "STAFF" && <RemoveUserButton id={user.id} dict={dict} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
