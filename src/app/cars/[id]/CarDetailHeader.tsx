"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui";
import { DateInput } from "@/components/DateInput";
import { carLabel } from "@/lib/cars";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const STATUS_OPTIONS = ["ACTIVE", "MAINTENANCE", "RETIRED"] as const;
const TRANSMISSION_OPTIONS = ["MANUAL", "AUTOMATIC"] as const;
const FUEL_TYPE_OPTIONS = ["DIESEL", "PETROL", "ELECTRIC"] as const;

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  MAINTENANCE: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  RETIRED: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

interface CarData {
  id: string;
  make: string;
  model: string;
  year: number | null;
  plate: string;
  registrationExpiryDate: string;
  transmission: "MANUAL" | "AUTOMATIC" | null;
  fuelType: "DIESEL" | "PETROL" | "ELECTRIC" | null;
  status: "ACTIVE" | "MAINTENANCE" | "RETIRED";
}

export function CarDetailHeader({ dict, car }: { dict: Dictionary; car: CarData }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  const [make, setMake] = useState(car.make);
  const [model, setModel] = useState(car.model);
  const [year, setYear] = useState(car.year != null ? String(car.year) : "");
  const [plate, setPlate] = useState(car.plate);
  const [registrationExpiry, setRegistrationExpiry] = useState(car.registrationExpiryDate);
  const [transmission, setTransmission] = useState<(typeof TRANSMISSION_OPTIONS)[number] | "">(
    car.transmission ?? "",
  );
  const [fuelType, setFuelType] = useState<(typeof FUEL_TYPE_OPTIONS)[number] | "">(car.fuelType ?? "");
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>(car.status);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canSubmit =
    make.trim() &&
    model.trim() &&
    plate.trim() &&
    registrationExpiry &&
    (year === "" || Number(year) >= 1900) &&
    !submitting;

  function cancelEdit() {
    setMake(car.make);
    setModel(car.model);
    setYear(car.year != null ? String(car.year) : "");
    setPlate(car.plate);
    setRegistrationExpiry(car.registrationExpiryDate);
    setTransmission(car.transmission ?? "");
    setFuelType(car.fuelType ?? "");
    setStatus(car.status);
    setError(null);
    setEditing(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/cars/${car.id}`, {
        method: "PATCH",
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
      setEditing(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/cars/${car.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(dict.cars.errors[data?.code as keyof typeof dict.cars.errors] ?? dict.cars.errors.GENERIC);
        return;
      }
      router.push("/cars");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {editing ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h2 className="font-serif text-lg text-zinc-900 dark:text-zinc-50">{dict.cars.detail.editTitle}</h2>
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

          <div className="flex gap-3">
            <button type="submit" disabled={!canSubmit} className={primaryButtonClass}>
              {submitting ? dict.cars.detail.saving : dict.cars.detail.save}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg border border-zinc-300 px-5 py-3 text-sm font-medium uppercase tracking-wider text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {dict.cars.detail.cancel}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl text-zinc-900 dark:text-zinc-50">
                {carLabel(car.make, car.model, car.year)}
              </h1>
              <p className="mt-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">{car.plate}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[car.status]}`}
              >
                {dict.cars.status[car.status]}
              </span>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-xs font-medium uppercase tracking-wider text-crimson-600 transition hover:underline dark:text-crimson-400"
              >
                {dict.cars.detail.edit}
              </button>
            </div>
          </div>
          {error && (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              {error}
            </p>
          )}
        </>
      )}

      <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        {confirmingDelete ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{dict.cars.detail.confirmDelete}?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-medium uppercase tracking-wider text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {deleting ? dict.cars.detail.deleting : dict.cars.detail.confirmDelete}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-xs font-medium uppercase tracking-wider text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {dict.cars.detail.cancel}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="text-xs font-medium uppercase tracking-wider text-red-600 transition hover:underline dark:text-red-400"
          >
            {dict.cars.detail.deleteButton}
          </button>
        )}
      </div>
    </>
  );
}
