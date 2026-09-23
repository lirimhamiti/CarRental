"use client";

import { useState } from "react";

export function LogoutButton({ label }: { label: string }) {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    // Hard navigation, not router.push/refresh — see LoginForm.tsx for why:
    // under real-world latency Chrome's navigation-flood protection can
    // drop the client router's history.replaceState call and strand the
    // user on the current page. A plain browser navigation sidesteps it.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- intentional hard navigation, see comment above
    window.location.href = "/login";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      title={label}
      className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-zinc-400 transition hover:text-crimson-400 disabled:opacity-50"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0">
        <path
          d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
