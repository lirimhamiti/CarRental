"use client";

import { useEffect, useState } from "react";
import { inputClass, labelClass, SectionIcon } from "@/components/ui";

interface ClientSuggestion {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  email: string | null;
  phone: string | null;
}

interface AvailableCar {
  id: string;
  make: string;
  model: string;
  year: number;
  plate: string;
}

const today = new Date().toISOString().slice(0, 10);

function downloadPdf(contractId: string) {
  const link = document.createElement("a");
  link.href = `/api/contracts/${contractId}/pdf`;
  link.click();
}

function daysBetweenInclusive(start: string, end: string): number {
  const ms = new Date(`${end}T00:00:00Z`).getTime() - new Date(`${start}T00:00:00Z`).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24)) + 1;
}

export function NewContractForm() {
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [suggestions, setSuggestions] = useState<ClientSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [dailyPrice, setDailyPrice] = useState("");

  const [availableCars, setAvailableCars] = useState<AvailableCar[]>([]);
  const [carId, setCarId] = useState("");
  const [loadingCars, setLoadingCars] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdContractId, setCreatedContractId] = useState<string | null>(null);

  useEffect(() => {
    if (firstName.trim().length < 2 || clientId) {
      return;
    }
    let cancelled = false;
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/clients/search?q=${encodeURIComponent(firstName)}`);
      if (!cancelled && res.ok) {
        setSuggestions(await res.json());
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [firstName, clientId]);

  useEffect(() => {
    if (!startDate || !endDate || endDate < startDate) return;
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

  function selectClient(client: ClientSuggestion) {
    setClientId(client.id);
    setFirstName(client.firstName);
    setLastName(client.lastName);
    setDocumentNumber(client.documentNumber);
    setEmail(client.email ?? "");
    setPhone(client.phone ?? "");
    setSuggestions([]);
    setShowSuggestions(false);
  }

  function handleFirstNameChange(value: string) {
    setFirstName(value);
    setClientId(undefined);
    setShowSuggestions(true);
    if (value.trim().length < 2) {
      setSuggestions([]);
    }
  }

  function handleStartDateChange(value: string) {
    setStartDate(value);
    if (endDate < value) setEndDate(value);
    setLoadingCars(true);
    setCarId("");
  }

  function handleEndDateChange(value: string) {
    setEndDate(value);
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
          clientId,
          firstName,
          lastName,
          documentNumber,
          email: email || undefined,
          phone: phone || undefined,
          carId,
          startDate,
          endDate,
          dailyPrice: Number(dailyPrice),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setCreatedContractId(data.id);
      downloadPdf(data.id);
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setClientId(undefined);
    setFirstName("");
    setLastName("");
    setDocumentNumber("");
    setEmail("");
    setPhone("");
    setStartDate(today);
    setEndDate(today);
    setDailyPrice("");
    setCarId("");
    setCreatedContractId(null);
    setError(null);
  }

  const created = Boolean(createdContractId);
  const days = startDate && endDate && endDate >= startDate ? daysBetweenInclusive(startDate, endDate) : 0;
  const total = days > 0 && Number(dailyPrice) > 0 ? days * Number(dailyPrice) : 0;

  const canSubmit =
    created ||
    (firstName.trim() &&
      lastName.trim() &&
      documentNumber.trim() &&
      startDate &&
      endDate &&
      endDate >= startDate &&
      carId &&
      Number(dailyPrice) > 0 &&
      !submitting);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-3xl border border-zinc-200/80 bg-white/80 p-6 shadow-xl shadow-zinc-200/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60 dark:shadow-black/20 sm:p-8"
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
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Client
            </h2>
          </div>
          {clientId && (
            <p className="-mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Existing client selected — fields filled in automatically
            </p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="relative">
              <label className={labelClass}>Name Surname *</label>
              <input
                required
                placeholder="Name"
                value={firstName}
                onChange={(e) => handleFirstNameChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                className={inputClass}
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg shadow-zinc-200/60 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/30">
                  {suggestions.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => selectClient(s)}
                        className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm transition hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                          {s.firstName[0]}
                          {s.lastName[0]}
                        </span>
                        <span>
                          <span className="font-medium text-zinc-900 dark:text-zinc-50">
                            {s.firstName} {s.lastName}
                          </span>
                          <span className="ml-1.5 text-zinc-400">· {s.documentNumber}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <label className={labelClass}>&nbsp;</label>
              <input
                required
                placeholder="Surname"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>ID number or passport ID *</label>
              <input
                required
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Phone number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
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
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Rental
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Start date *</label>
              <input
                type="date"
                required
                value={startDate}
                min={today}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>End date *</label>
              <input
                type="date"
                required
                value={endDate}
                min={startDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Daily price *</label>
              <input
                type="number"
                required
                min={0.01}
                step="0.01"
                value={dailyPrice}
                onChange={(e) => setDailyPrice(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Available car *</label>
            {loadingCars ? (
              <p className="rounded-xl border border-dashed border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-500 dark:border-zinc-700">
                Checking availability…
              </p>
            ) : availableCars.length === 0 ? (
              <p className="rounded-xl border border-dashed border-amber-300 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400">
                No cars free for these dates.
              </p>
            ) : (
              <select
                required
                value={carId}
                onChange={(e) => setCarId(e.target.value)}
                className={inputClass}
              >
                <option value="" disabled>
                  Select a car
                </option>
                {availableCars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.make} {car.model} ({car.year}) · {car.plate}
                  </option>
                ))}
              </select>
            )}
          </div>

          {total > 0 && (
            <div className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 px-5 py-4 text-white shadow-lg shadow-indigo-500/25">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-indigo-100">
                  {days} {days === 1 ? "day" : "days"} · {Number(dailyPrice).toFixed(2)} / day
                </p>
                <p className="text-lg font-semibold">Total price</p>
              </div>
              <p className="text-2xl font-bold tabular-nums">{total.toFixed(2)}</p>
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
          Contract created — your download should have started.
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-500 hover:to-indigo-400 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:from-zinc-300 disabled:to-zinc-300 disabled:text-zinc-500 disabled:shadow-none dark:disabled:from-zinc-700 dark:disabled:to-zinc-700"
        >
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
              Download contract
            </>
          ) : submitting ? (
            "Creating…"
          ) : (
            "Create contract"
          )}
        </button>
        {created && (
          <button
            type="button"
            onClick={resetForm}
            className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            New contract
          </button>
        )}
      </div>
    </form>
  );
}
