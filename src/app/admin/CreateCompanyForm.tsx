"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inputClass, labelClass, primaryButtonClass, SectionIcon } from "@/components/ui";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

export function CreateCompanyForm({ dict }: { dict: Dictionary }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [ownerUsername, setOwnerUsername] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [ownerPasswordConfirm, setOwnerPasswordConfirm] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordsMatch = ownerPassword === ownerPasswordConfirm;
  const canSubmit =
    name.trim() && ownerUsername.trim() && ownerPassword.length >= 6 && passwordsMatch && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!passwordsMatch) {
      setError(dict.admin.createForm.passwordMismatch);
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("ownerUsername", ownerUsername);
      formData.set("ownerPassword", ownerPassword);
      if (logo) {
        formData.set("logo", logo);
      }

      const res = await fetch("/api/admin/companies", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(
          dict.admin.createForm.errors[data.code as keyof typeof dict.admin.createForm.errors] ??
            dict.admin.createForm.errors.GENERIC,
        );
        return;
      }
      setName("");
      setOwnerUsername("");
      setOwnerPassword("");
      setOwnerPasswordConfirm("");
      setLogo(null);
      setSuccess(true);
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
      <div className="flex items-center gap-3">
        <SectionIcon>
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
          </svg>
        </SectionIcon>
        <h2 className="font-serif text-lg text-zinc-900 dark:text-zinc-50">{dict.admin.createForm.title}</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>{dict.admin.createForm.name}</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{dict.admin.createForm.logo}</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{dict.admin.createForm.ownerUsername}</label>
          <input
            required
            value={ownerUsername}
            onChange={(e) => setOwnerUsername(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{dict.admin.createForm.ownerPassword}</label>
          <input
            required
            type="password"
            minLength={6}
            value={ownerPassword}
            onChange={(e) => setOwnerPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{dict.admin.createForm.ownerPasswordConfirm}</label>
          <input
            required
            type="password"
            minLength={6}
            value={ownerPasswordConfirm}
            onChange={(e) => setOwnerPasswordConfirm(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}
      {success && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {dict.admin.createForm.success}
        </p>
      )}

      <div>
        <button type="submit" disabled={!canSubmit} className={primaryButtonClass}>
          {submitting ? dict.admin.createForm.submitting : dict.admin.createForm.submit}
        </button>
      </div>
    </form>
  );
}
