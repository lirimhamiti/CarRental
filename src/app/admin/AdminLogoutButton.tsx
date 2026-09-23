"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogoutButton({ label }: { label: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/admin/logout", { method: "POST" });
    // No router.push here: AdminPage's own auth check redirects to
    // /admin/login once the admin session is gone, so refresh() alone
    // triggers that — avoids the same push+refresh navigation race fixed
    // in LoginForm.
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="text-xs font-medium uppercase tracking-wider text-zinc-400 transition hover:text-crimson-400 disabled:opacity-50"
    >
      {label}
    </button>
  );
}
