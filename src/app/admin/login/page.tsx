import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/session";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { AdminLoginForm } from "./AdminLoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <main className="bg-showroom-light flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-crimson-600 dark:text-crimson-400">
            {dict.admin.login.eyebrow}
          </p>
          <h1 className="font-serif text-2xl text-zinc-900 dark:text-zinc-50">{dict.admin.login.title}</h1>
        </div>
        <AdminLoginForm dict={dict} />
      </div>
    </main>
  );
}
