"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inputClass, labelClass, SectionIcon } from "@/components/ui";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const STATUS_OPTIONS = ["ACTIVE", "MAINTENANCE", "RETIRED"] as const;

export function AddCarForm({ dict }: { dict: Dictionary }) {
  const router = useRouter();
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [plate, setPlate] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>("ACTIVE");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const canSubmit =
    make.trim() && model.trim() && plate.trim() && Number(year) >= 1900 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ make, model, year: Number(year), plate, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(dict.cars.errors[data.code as keyof typeof dict.cars.errors] ?? dict.cars.errors.GENERIC);
        return;
      }
      setMake("");
      setModel("");
      setYear("");
      setPlate("");
      setStatus("ACTIVE");
      setSuccess(true);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-3xl border border-zinc-200/80 bg-white/80 p-6 shadow-xl shadow-zinc-200/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60 dark:shadow-black/20 sm:p-8"
    >
      <div className="flex items-center gap-3">
        <SectionIcon>
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
          </svg>
        </SectionIcon>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {dict.cars.addForm.title}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div>
          <label className={labelClass}>{dict.cars.addForm.make}</label>
          <input required value={make} onChange={(e) => setMake(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{dict.cars.addForm.model}</label>
          <input required value={model} onChange={(e) => setModel(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{dict.cars.addForm.year}</label>
          <input
            required
            type="number"
            min={1900}
            max={new Date().getFullYear() + 1}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{dict.cars.addForm.plate}</label>
          <input required value={plate} onChange={(e) => setPlate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{dict.cars.addForm.status}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as (typeof STATUS_OPTIONS)[number])}
            className={inputClass}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {dict.cars.status[option]}
              </option>
            ))}
          </select>
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
          {dict.cars.addForm.success}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-500 hover:to-indigo-400 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:from-zinc-300 disabled:to-zinc-300 disabled:text-zinc-500 disabled:shadow-none dark:disabled:from-zinc-700 dark:disabled:to-zinc-700"
        >
          {submitting ? dict.cars.addForm.submitting : dict.cars.addForm.submit}
        </button>
      </div>
    </form>
  );
}
