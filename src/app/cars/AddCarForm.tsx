"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inputClass, labelClass, primaryButtonClass, SectionIcon } from "@/components/ui";
import { DateInput } from "@/components/DateInput";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const STATUS_OPTIONS = ["ACTIVE", "MAINTENANCE", "RETIRED"] as const;
const TRANSMISSION_OPTIONS = ["MANUAL", "AUTOMATIC"] as const;
const FUEL_TYPE_OPTIONS = ["DIESEL", "PETROL", "ELECTRIC"] as const;

export function AddCarForm({ dict }: { dict: Dictionary }) {
  const router = useRouter();
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [plate, setPlate] = useState("");
  const [registrationExpiry, setRegistrationExpiry] = useState("");
  const [transmission, setTransmission] = useState<(typeof TRANSMISSION_OPTIONS)[number] | "">("");
  const [fuelType, setFuelType] = useState<(typeof FUEL_TYPE_OPTIONS)[number] | "">("");
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>("ACTIVE");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const canSubmit =
    make.trim() &&
    model.trim() &&
    plate.trim() &&
    registrationExpiry &&
    (year === "" || Number(year) >= 1900) &&
    !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          make,
          model,
          year: year ? Number(year) : undefined,
          plate,
          registrationExpiryDate: registrationExpiry,
          transmission: transmission || undefined,
          fuelType: fuelType || undefined,
          status,
        }),
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
      setRegistrationExpiry("");
      setTransmission("");
      setFuelType("");
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
      className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
    >
      <div className="flex items-center gap-3">
        <SectionIcon>
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
          </svg>
        </SectionIcon>
        <h2 className="font-serif text-lg text-zinc-900 dark:text-zinc-50">
          {dict.cars.addForm.title}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
          <label className={labelClass}>{dict.cars.addForm.registrationExpiry}</label>
          <DateInput required value={registrationExpiry} onChange={setRegistrationExpiry} />
        </div>
        <div>
          <label className={labelClass}>{dict.cars.addForm.transmission}</label>
          <select
            value={transmission}
            onChange={(e) => setTransmission(e.target.value as (typeof TRANSMISSION_OPTIONS)[number] | "")}
            className={inputClass}
          >
            <option value="">{dict.cars.addForm.unspecified}</option>
            {TRANSMISSION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {dict.cars.addForm.transmissionOptions[option]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>{dict.cars.addForm.fuelType}</label>
          <select
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value as (typeof FUEL_TYPE_OPTIONS)[number] | "")}
            className={inputClass}
          >
            <option value="">{dict.cars.addForm.unspecified}</option>
            {FUEL_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {dict.cars.addForm.fuelTypeOptions[option]}
              </option>
            ))}
          </select>
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
        <button type="submit" disabled={!canSubmit} className={primaryButtonClass}>
          {submitting ? dict.cars.addForm.submitting : dict.cars.addForm.submit}
        </button>
      </div>
    </form>
  );
}
