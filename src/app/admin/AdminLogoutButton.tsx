"use client";

import { useState } from "react";

export function AdminLogoutButton({ label }: { label: string }) {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/admin/logout", { method: "POST" });
    // Hard navigation, not router.push/refresh — see LoginForm.tsx for why:
    // under real-world latency Chrome's navigation-flood protection can
    // drop the client router's history.replaceState call and strand the
    // user on the current page. A plain browser navigation sidesteps it.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- intentional hard navigation, see comment above
    window.location.href = "/admin/login";
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
