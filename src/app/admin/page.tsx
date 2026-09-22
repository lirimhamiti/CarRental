import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/session";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { CreateCompanyForm } from "./CreateCompanyForm";
import { AdminLogoutButton } from "./AdminLogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const locale = await getLocale();
  const dict = getDictionary(locale);

  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      users: { where: { role: "OWNER" }, take: 1 },
      _count: { select: { users: { where: { role: "STAFF" } } } },
    },
  });

  return (
    <main className="bg-showroom-light min-h-screen">
      <div className="bg-showroom-dark">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-6 sm:px-8">
          <h1 className="font-serif text-xl text-white">{dict.admin.brand}</h1>
          <AdminLogoutButton label={dict.admin.logout} />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-crimson-600 dark:text-crimson-400">
            {dict.admin.eyebrow}
          </p>
          <h2 className="font-serif text-2xl text-zinc-900 dark:text-zinc-50">{dict.admin.title}</h2>
        </div>

        <CreateCompanyForm dict={dict} />

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {companies.length === 0 ? (
            <p className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">{dict.admin.empty}</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  <th className="px-6 py-3 font-medium">{dict.admin.table.company}</th>
                  <th className="px-6 py-3 font-medium">{dict.admin.table.owner}</th>
                  <th className="px-6 py-3 font-medium">{dict.admin.table.staff}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {companies.map((company) => (
                  <tr key={company.id}>
                    <td className="flex items-center gap-3 px-6 py-4">
                      {company.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- external Vercel Blob URL, not a local/optimizable asset
                        <img
                          src={company.logoUrl}
                          alt=""
                          className="h-8 w-8 rounded-full border border-zinc-200 object-cover dark:border-zinc-700"
                        />
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-medium text-crimson-400">
                          {company.name.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">{company.name}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                      {company.users[0]?.username ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400">
                      {company._count.users} / 3
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
