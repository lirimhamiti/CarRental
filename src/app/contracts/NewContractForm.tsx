"use client";

import { useEffect, useRef, useState } from "react";
import { dateInputClass, inputClass, labelClass, primaryButtonClass, SectionIcon } from "@/components/ui";
import { carLabel } from "@/lib/cars";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { isDriverValid } from "@/lib/driver-validation";
import { DriverFields, emptyDriver, type DriverValue } from "./DriverFields";

interface AvailableCar {
  id: string;
  make: string;
  model: string;
  year: number | null;
  plate: string;
}

const today = new Date().toISOString().slice(0, 10);

function downloadPdf(contractId: string) {
  const link = document.createElement("a");
  link.href = `/api/contracts/${contractId}/pdf`;
  link.click();
}

// endDate is the checkout/return day (exclusive) — see nightsBetween in
// src/lib/availability.ts for why. The UI still labels this "days".
function nightsBetween(start: string, end: string): number {
  const ms = new Date(`${end}T00:00:00Z`).getTime() - new Date(`${start}T00:00:00Z`).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function addNights(start: string, nights: number): string {
  const d = new Date(`${start}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + nights);
  return d.toISOString().slice(0, 10);
}

interface DriverEntry {
  key: number;
  value: DriverValue;
}

export function NewContractForm({ dict }: { dict: Dictionary }) {
  const nextDriverKey = useRef(1);
  const [drivers, setDrivers] = useState<DriverEntry[]>([{ key: 0, value: emptyDriver() }]);

  const [startDate, setStartDate] = useState(today);
  const [daysField, setDaysField] = useState("1");
  const [endDate, setEndDate] = useState(() => addNights(today, 1));
  const [totalPriceField, setTotalPriceField] = useState("");

  const [availableCars, setAvailableCars] = useState<AvailableCar[]>([]);
  const [carId, setCarId] = useState("");
  const [loadingCars, setLoadingCars] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdContractId, setCreatedContractId] = useState<string | null>(null);

  useEffect(() => {
    if (!startDate || !endDate || endDate <= startDate) return;
    const controller = new AbortController();
    fetch(`/api/cars/available?start=${startDate}&end=${endDate}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((cars: AvailableCar[]) => setAvailableCars(cars))
      .catch(() => {})
      .finally(() => setLoadingCars(false));
    return () => controller.abort();
  }, [startDate, endDate]);

  function updateDriver(key: number, patch: Partial<DriverValue>) {
    setDrivers((prev) => prev.map((d) => (d.key === key ? { key, value: { ...d.value, ...patch } } : d)));
  }

  function addDriver() {
    setDrivers((prev) => [...prev, { key: nextDriverKey.current++, value: emptyDriver() }]);
  }

  function removeDriver(key: number) {
    setDrivers((prev) => prev.filter((d) => d.key !== key));
  }

  function handleStartDateChange(value: string) {
    setStartDate(value);
    const numDays = Number(daysField);
    if (numDays > 0) {
      setEndDate(addNights(value, numDays));
    } else if (endDate <= value) {
      setEndDate(addNights(value, 1));
    }
    setLoadingCars(true);
    setCarId("");
  }

  function handleDaysFieldChange(value: string) {
    setDaysField(value);
    const numDays = Number(value);
    if (numDays > 0 && startDate) {
      setEndDate(addNights(startDate, numDays));
      setLoadingCars(true);
      setCarId("");
    }
  }

  function handleEndDateChange(value: string) {
    setEndDate(value);
    if (startDate && value > startDate) {
      setDaysField(String(nightsBetween(startDate, value)));
    }
    setLoadingCars(true);
    setCarId("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (createdContractId) {
      downloadPdf(createdContractId);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drivers: drivers.map((d) => ({
            clientId: d.value.clientId,
            firstName: d.value.firstName,
            lastName: d.value.lastName,
            birthDate: d.value.birthDate,
            passportNumber: d.value.passportNumber || undefined,
            passportIssueDate: d.value.passportIssueDate || undefined,
            passportExpiryDate: d.value.passportExpiryDate || undefined,
            licenceNumber: d.value.licenceNumber || undefined,
            licenceIssueDate: d.value.licenceIssueDate || undefined,
            licenceExpiryDate: d.value.licenceExpiryDate || undefined,
            phone: d.value.phone || undefined,
          })),
          carId,
          startDate,
          endDate,
          totalPrice: totalPriceField ? Number(totalPriceField) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(dict.contracts.errors[data.code as keyof typeof dict.contracts.errors] ?? dict.contracts.errors.GENERIC);
        return;
      }
      setCreatedContractId(data.id);
      downloadPdf(data.id);
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setDrivers([{ key: 0, value: emptyDriver() }]);
    nextDriverKey.current = 1;
    setStartDate(today);
    setDaysField("1");
    setEndDate(addNights(today, 1));
    setTotalPriceField("");
    setCarId("");
    setCreatedContractId(null);
    setError(null);
  }

  const created = Boolean(createdContractId);
  const days = startDate && endDate && endDate > startDate ? nightsBetween(startDate, endDate) : 0;
  const total = Number(totalPriceField) > 0 ? Number(totalPriceField) : 0;

  const canSubmit =
    created ||
    (drivers.every((d) => isDriverValid(d.value)) &&
      startDate &&
      endDate &&
      endDate > startDate &&
      carId &&
      !submitting);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
    >
      <fieldset disabled={created} className="flex flex-col gap-6 disabled:opacity-60">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <SectionIcon>
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path
                  d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </SectionIcon>
            <h2 className="font-serif text-lg text-zinc-900 dark:text-zinc-50">
              {dict.contracts.client.title}
            </h2>
          </div>

          {drivers.map((d, index) => (
            <DriverFields
              key={d.key}
              index={index}
              driver={d.value}
              dict={dict}
              onChange={(patch) => updateDriver(d.key, patch)}
              onRemove={index > 0 ? () => removeDriver(d.key) : undefined}
            />
          ))}

          <button
            type="button"
            onClick={addDriver}
            className="self-start rounded-lg border border-dashed border-zinc-300 px-4 py-2 text-xs font-medium uppercase tracking-wider text-zinc-600 transition hover:border-crimson-500 hover:text-crimson-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-crimson-500 dark:hover:text-crimson-400"
          >
            + {dict.contracts.client.addDriver}
          </button>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent dark:via-zinc-800" />

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <SectionIcon>
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path
                  d="M3 12h18M5 12V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M5 12v5a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-5M7 10h2m6 0h2"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </SectionIcon>
            <h2 className="font-serif text-lg text-zinc-900 dark:text-zinc-50">
              {dict.contracts.rental.title}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div>
              <label className={labelClass}>{dict.contracts.rental.startDate}</label>
              <input
                type="date"
                required
                value={startDate}
                min={today}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className={dateInputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{dict.contracts.rental.daysLabel}</label>
              <input
                type="number"
                required
                min={1}
                step={1}
                value={daysField}
                onChange={(e) => handleDaysFieldChange(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{dict.contracts.rental.endDate}</label>
              <input
                type="date"
                required
                value={endDate}
                min={startDate ? addNights(startDate, 1) : undefined}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className={dateInputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{dict.contracts.rental.totalPrice}</label>
              <input
                type="number"
                min={0.01}
                step="0.01"
                value={totalPriceField}
                onChange={(e) => setTotalPriceField(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>{dict.contracts.rental.availableCar}</label>
            {loadingCars ? (
              <p className="rounded-xl border border-dashed border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-500 dark:border-zinc-700">
                {dict.contracts.rental.checking}
              </p>
            ) : availableCars.length === 0 ? (
              <p className="rounded-xl border border-dashed border-amber-300 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400">
                {dict.contracts.rental.noCars}
              </p>
            ) : (
              <select
                required
                value={carId}
                onChange={(e) => setCarId(e.target.value)}
                className={inputClass}
              >
                <option value="" disabled>
                  {dict.contracts.rental.selectCar}
                </option>
                {availableCars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {carLabel(car.make, car.model, car.year)} · {car.plate}
                  </option>
                ))}
              </select>
            )}
          </div>

          {total > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-crimson-500/30 bg-ink px-5 py-4 text-white">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-crimson-100/70">
                  {days} {days === 1 ? dict.contracts.rental.day : dict.contracts.rental.days}
                </p>
                <p className="font-serif text-lg">{dict.contracts.rental.totalPrice}</p>
              </div>
              <p className="font-serif text-2xl tabular-nums text-crimson-400">{total.toFixed(2)}</p>
            </div>
          )}
        </div>
      </fieldset>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      {created && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {dict.contracts.created}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={!canSubmit} className={primaryButtonClass}>
          {created ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path
                  d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {dict.contracts.buttons.download}
            </>
          ) : submitting ? (
            dict.contracts.buttons.creating
          ) : (
            dict.contracts.buttons.create
          )}
        </button>
        {created && (
          <button
            type="button"
            onClick={resetForm}
            className="rounded-lg border border-zinc-300 px-5 py-3 text-sm font-medium uppercase tracking-wider text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {dict.contracts.buttons.newContract}
          </button>
        )}
      </div>
    </form>
  );
}
