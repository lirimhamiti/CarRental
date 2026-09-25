"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inputClass, labelClass, primaryButtonClass, SectionIcon } from "@/components/ui";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const MAX_PHONES = 3;

export function CreateCompanyForm({ dict }: { dict: Dictionary }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [ownerUsername, setOwnerUsername] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [ownerPasswordConfirm, setOwnerPasswordConfirm] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phones, setPhones] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordsMatch = ownerPassword === ownerPasswordConfirm;
  const canSubmit =
    name.trim() && ownerUsername.trim() && ownerPassword.length >= 6 && passwordsMatch && !submitting;

  function updatePhone(index: number, value: string) {
    setPhones((prev) => prev.map((p, i) => (i === index ? value : p)));
  }

  function addPhone() {
    setPhones((prev) => (prev.length < MAX_PHONES ? [...prev, ""] : prev));
  }

  function removePhone(index: number) {
    setPhones((prev) => prev.filter((_, i) => i !== index));
  }

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
      if (address.trim()) formData.set("address", address);
      if (email.trim()) formData.set("email", email);
      for (const phone of phones) {
        if (phone.trim()) formData.append("phones", phone);
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
      setAddress("");
      setEmail("");
      setPhones([""]);
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
        <div>
          <label className={labelClass}>{dict.admin.createForm.address}</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>{dict.admin.createForm.email}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className={labelClass}>{dict.admin.createForm.phone}</label>
        {phones.map((phone, index) => (
          <div key={index} className="flex items-center gap-3">
            <input
              type="tel"
              value={phone}
              onChange={(e) => updatePhone(index, e.target.value)}
              className={inputClass}
            />
            {phones.length > 1 && (
              <button
                type="button"
                onClick={() => removePhone(index)}
                className="shrink-0 text-xs font-medium uppercase tracking-wider text-red-600 transition hover:underline dark:text-red-400"
              >
                {dict.admin.createForm.removePhone}
              </button>
            )}
          </div>
        ))}
        {phones.length < MAX_PHONES && (
          <button
            type="button"
            onClick={addPhone}
            className="self-start rounded-lg border border-dashed border-zinc-300 px-4 py-2 text-xs font-medium uppercase tracking-wider text-zinc-600 transition hover:border-crimson-500 hover:text-crimson-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-crimson-500 dark:hover:text-crimson-400"
          >
            + {dict.admin.createForm.addPhone}
          </button>
        )}
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
