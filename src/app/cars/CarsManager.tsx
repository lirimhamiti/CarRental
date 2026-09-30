"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { inputClass, labelClass, primaryButtonClass, SectionIcon } from "@/components/ui";
import { DateInput } from "@/components/DateInput";
import { parseDateOnly } from "@/lib/availability";
import { carLabel, registrationUrgency } from "@/lib/cars";
import { formatDate } from "@/lib/dates";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { interpolate } from "@/lib/i18n/get-dictionary";

const STATUS_OPTIONS = ["ACTIVE", "MAINTENANCE", "RETIRED"] as const;
const TRANSMISSION_OPTIONS = ["MANUAL", "AUTOMATIC"] as const;
const FUEL_TYPE_OPTIONS = ["DIESEL", "PETROL", "ELECTRIC"] as const;

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  MAINTENANCE: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  RETIRED: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

interface CarRow {
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

function emptyFields() {
  return {
    make: "",
    model: "",
    year: "",
    plate: "",
    registrationExpiry: "",
    transmission: "" as (typeof TRANSMISSION_OPTIONS)[number] | "",
    fuelType: "" as (typeof FUEL_TYPE_OPTIONS)[number] | "",
    status: "ACTIVE" as (typeof STATUS_OPTIONS)[number],
  };
}

export function CarsManager({ dict, cars, todayIso }: { dict: Dictionary; cars: CarRow[]; todayIso: string }) {
  const router = useRouter();
  const today = parseDateOnly(todayIso);

  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [fields, setFields] = useState(emptyFields());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [deletingCar, setDeletingCar] = useState<CarRow | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canSubmit =
    fields.make.trim() &&
    fields.model.trim() &&
    fields.plate.trim() &&
    fields.registrationExpiry &&
    (fields.year === "" || Number(fields.year) >= 1900) &&
    !submitting;

  function startEdit(car: CarRow) {
    setEditingCarId(car.id);
    setFields({
      make: car.make,
      model: car.model,
      year: car.year != null ? String(car.year) : "",
      plate: car.plate,
      registrationExpiry: car.registrationExpiryDate,
      transmission: car.transmission ?? "",
      fuelType: car.fuelType ?? "",
      status: car.status,
    });
    setError(null);
    setSuccess(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingCarId(null);
    setFields(emptyFields());
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      const url = editingCarId ? `/api/cars/${editingCarId}` : "/api/cars";
      const method = editingCarId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          make: fields.make,
          model: fields.model,
          year: fields.year ? Number(fields.year) : undefined,
          plate: fields.plate,
          registrationExpiryDate: fields.registrationExpiry,
          transmission: fields.transmission || undefined,
          fuelType: fields.fuelType || undefined,
          status: fields.status,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(dict.cars.errors[data.code as keyof typeof dict.cars.errors] ?? dict.cars.errors.GENERIC);
        return;
      }
      setEditingCarId(null);
      setFields(emptyFields());
      setSuccess(true);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  function openDeleteDialog(car: CarRow) {
    setDeletingCar(car);
    setDeleteError(null);
  }

  function closeDeleteDialog() {
    setDeletingCar(null);
    setDeleteError(null);
  }

  async function confirmDelete() {
    if (!deletingCar) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/cars/${deletingCar.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setDeleteError(dict.cars.errors[data?.code as keyof typeof dict.cars.errors] ?? dict.cars.errors.GENERIC);
        return;
      }
      if (editingCarId === deletingCar.id) {
        cancelEdit();
      }
      setDeletingCar(null);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SectionIcon>
              {editingCarId ? (
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path
                    d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                </svg>
              )}
            </SectionIcon>
            <h2 className="font-serif text-lg text-zinc-900 dark:text-zinc-50">
              {editingCarId ? dict.cars.detail.editTitle : dict.cars.addForm.title}
            </h2>
          </div>
          {editingCarId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-xs font-medium uppercase tracking-wider text-zinc-500 transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              {dict.cars.detail.cancel}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className={labelClass}>{dict.cars.addForm.make}</label>
            <input
              required
              value={fields.make}
              onChange={(e) => setFields((f) => ({ ...f, make: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{dict.cars.addForm.model}</label>
            <input
              required
              value={fields.model}
              onChange={(e) => setFields((f) => ({ ...f, model: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{dict.cars.addForm.year}</label>
            <input
              type="number"
              min={1900}
              max={new Date().getFullYear() + 1}
              value={fields.year}
              onChange={(e) => setFields((f) => ({ ...f, year: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{dict.cars.addForm.plate}</label>
            <input
              required
              value={fields.plate}
              onChange={(e) => setFields((f) => ({ ...f, plate: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{dict.cars.addForm.registrationExpiry}</label>
            <DateInput
              required
              value={fields.registrationExpiry}
              onChange={(value) => setFields((f) => ({ ...f, registrationExpiry: value }))}
            />
          </div>
          <div>
            <label className={labelClass}>{dict.cars.addForm.transmission}</label>
            <select
              value={fields.transmission}
              onChange={(e) =>
                setFields((f) => ({ ...f, transmission: e.target.value as (typeof TRANSMISSION_OPTIONS)[number] | "" }))
              }
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
              value={fields.fuelType}
              onChange={(e) =>
                setFields((f) => ({ ...f, fuelType: e.target.value as (typeof FUEL_TYPE_OPTIONS)[number] | "" }))
              }
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
              value={fields.status}
              onChange={(e) => setFields((f) => ({ ...f, status: e.target.value as (typeof STATUS_OPTIONS)[number] }))}
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
        {success && !editingCarId && (
          <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {dict.cars.addForm.success}
          </p>
        )}

        <div>
          <button type="submit" disabled={!canSubmit} className={primaryButtonClass}>
            {editingCarId
              ? submitting
                ? dict.cars.detail.saving
                : dict.cars.detail.save
              : submitting
                ? dict.cars.addForm.submitting
                : dict.cars.addForm.submit}
          </button>
        </div>
      </form>

      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {cars.length === 0 ? (
          <p className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">{dict.cars.empty}</p>
        ) : (
          <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  <th className="px-6 py-3 font-medium">{dict.cars.table.car}</th>
                  <th className="px-6 py-3 font-medium">{dict.cars.table.plate}</th>
                  <th className="px-6 py-3 font-medium">{dict.cars.table.registrationExpiry}</th>
                  <th className="px-6 py-3 font-medium">{dict.cars.table.transmission}</th>
                  <th className="px-6 py-3 font-medium">{dict.cars.table.fuelType}</th>
                  <th className="px-6 py-3 font-medium">{dict.cars.table.status}</th>
                  <th className="px-6 py-3 font-medium">{dict.cars.table.action}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {cars.map((car) => (
                  <tr key={car.id} className="transition hover:bg-crimson-50/60 dark:hover:bg-crimson-500/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-crimson-50 text-crimson-500 dark:bg-crimson-500/15">
                          <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
                            <path
                              d="M3 12h18M5 12V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M5 12v5a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-5"
                              stroke="currentColor"
                              strokeWidth={1.6}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-50">
                          {carLabel(car.make, car.model, car.year)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-zinc-500 dark:text-zinc-400">{car.plate}</td>
                    <td className="px-6 py-4 text-xs">
                      {(() => {
                        const urgency = registrationUrgency(parseDateOnly(car.registrationExpiryDate), today);
                        const formatted = formatDate(parseDateOnly(car.registrationExpiryDate));
                        if (urgency === "expired") {
                          return (
                            <span className="font-medium text-red-600 dark:text-red-400">
                              {interpolate(dict.cars.registrationExpired, { date: formatted })}
                            </span>
                          );
                        }
                        if (urgency === "soon") {
                          return (
                            <span className="font-medium text-amber-600 dark:text-amber-400">
                              {interpolate(dict.cars.registrationExpiringSoon, { date: formatted })}
                            </span>
                          );
                        }
                        return <span className="text-zinc-500 dark:text-zinc-400">{formatted}</span>;
                      })()}
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400">
                      {car.transmission ? dict.cars.addForm.transmissionOptions[car.transmission] : dict.cars.notSpecified}
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400">
                      {car.fuelType ? dict.cars.addForm.fuelTypeOptions[car.fuelType] : dict.cars.notSpecified}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[car.status]}`}
                      >
                        {dict.cars.status[car.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => startEdit(car)}
                          title={dict.cars.detail.edit}
                          className="text-zinc-400 transition hover:text-crimson-500 dark:text-zinc-600"
                        >
                          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                            <path
                              d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"
                              stroke="currentColor"
                              strokeWidth={1.7}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteDialog(car)}
                          title={dict.cars.detail.deleteButton}
                          className="text-zinc-400 transition hover:text-red-600 dark:text-zinc-600"
                        >
                          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                            <path
                              d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13M10 11v6M14 11v6"
                              stroke="currentColor"
                              strokeWidth={1.7}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <Link
                          href={`/cars/${car.id}`}
                          title={dict.cars.detail.bookedDates}
                          className="text-zinc-400 transition hover:text-crimson-500 dark:text-zinc-600"
                        >
                          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                            <path
                              d="M8 3v3M16 3v3M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1ZM4 10h16M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01M16 17h.01"
                              stroke="currentColor"
                              strokeWidth={1.5}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {cars.length > 0 && (
        <p className="mt-3 text-center text-xs text-zinc-400 sm:hidden">{dict.cars.swipeHint}</p>
      )}

      {deletingCar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeDeleteDialog}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-lg text-zinc-900 dark:text-zinc-50">{dict.cars.detail.deleteButton}</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              {interpolate(dict.cars.detail.deleteConfirmMessage, {
                car: carLabel(deletingCar.make, deletingCar.model, deletingCar.year),
              })}
            </p>

            {deleteError && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                {deleteError}
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {deleting ? dict.cars.detail.deleting : dict.cars.detail.confirmDelete}
              </button>
              <button
                type="button"
                onClick={closeDeleteDialog}
                className="rounded-lg border border-zinc-300 px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {dict.cars.detail.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
