"use client";

import { useState } from "react";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

export function LoginForm({ dict }: { dict: Dictionary }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = username.trim() && password && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      setError(dict.auth.login.error);
      setSubmitting(false);
      return;
    }
    // A hard navigation, not router.push/refresh: Next's client router moves
    // between routes via history.pushState/replaceState, and under
    // real-world latency (slow mobile, Vercel cold starts) those calls can
    // fire in a tight enough burst that Chrome's own flood protection
    // ("Throttling navigation to prevent the browser from hanging") drops
    // them — leaving the user stuck on /login with a stale page. A plain
    // browser navigation is a single atomic operation that protection
    // doesn't apply to, and it shows the browser's native loading state for
    // the brief gap until "/" finishes loading.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- intentional hard navigation, see comment above
    window.location.href = "/";
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
    >
      <div>
        <label className={labelClass}>{dict.auth.login.username}</label>
        <input
          required
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>{dict.auth.login.password}</label>
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <button type="submit" disabled={!canSubmit} className={primaryButtonClass}>
        {submitting ? dict.auth.login.submitting : dict.auth.login.submit}
      </button>
    </form>
  );
}
