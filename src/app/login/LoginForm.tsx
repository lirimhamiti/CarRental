"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

export function LoginForm({ dict }: { dict: Dictionary }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = username.trim() && password && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        setError(dict.auth.login.error);
        return;
      }
      // No router.push here: LoginPage itself redirects home once it sees a
      // session, so refresh() alone triggers that — one clean navigation
      // instead of two racing ones (push + the redirect refresh() also
      // triggers), which is what caused the "page couldn't load" bug.
      router.refresh();
    } finally {
      setSubmitting(false);
    }
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
