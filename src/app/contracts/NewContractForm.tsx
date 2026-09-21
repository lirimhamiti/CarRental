"use client";

import { useEffect, useState } from "react";

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
  const [days, setDays] = useState(1);
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
    if (!startDate || days < 1) return;
    const controller = new AbortController();
    fetch(`/api/cars/available?start=${startDate}&days=${days}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((cars: AvailableCar[]) => setAvailableCars(cars))
      .catch(() => {})
      .finally(() => setLoadingCars(false));
    return () => controller.abort();
  }, [startDate, days]);

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
    setLoadingCars(true);
    setCarId("");
  }

  function handleDaysChange(value: number) {
    setDays(Math.max(1, value));
    setLoadingCars(true);
    setCarId("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
          days,
          dailyPrice: Number(dailyPrice),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setCreatedContractId(data.id);
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
    setDays(1);
    setDailyPrice("");
    setCarId("");
    setCreatedContractId(null);
    setError(null);
  }

  if (createdContractId) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950">
        <p className="font-medium text-green-800 dark:text-green-300">
          Contract created.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <a
            href={`/api/contracts/${createdContractId}/pdf`}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Download PDF
          </a>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            New contract
          </button>
        </div>
      </div>
    );
  }

  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    documentNumber.trim() &&
    carId &&
    Number(dailyPrice) > 0 &&
    !submitting;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Client
        </h2>
        {clientId && (
          <p className="text-xs text-green-700 dark:text-green-400">
            Existing client selected — fields filled in automatically.
          </p>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="relative">
            <label className="mb-1 block text-xs text-zinc-500">Name *</label>
            <input
              required
              value={firstName}
              onChange={(e) => handleFirstNameChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                {suggestions.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => selectClient(s)}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      {s.firstName} {s.lastName}{" "}
                      <span className="text-zinc-400">· {s.documentNumber}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">Surname *</label>
            <input
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">
              ID / Passport number *
            </label>
            <input
              required
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Rental
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-zinc-500">Start date *</label>
            <input
              type="date"
              required
              value={startDate}
              min={today}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">Days *</label>
            <input
              type="number"
              required
              min={1}
              value={days}
              onChange={(e) => handleDaysChange(Number(e.target.value))}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">Daily price *</label>
            <input
              type="number"
              required
              min={0.01}
              step="0.01"
              value={dailyPrice}
              onChange={(e) => setDailyPrice(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-zinc-500">
            Available car *
          </label>
          {loadingCars ? (
            <p className="text-sm text-zinc-500">Checking availability…</p>
          ) : availableCars.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No cars free for these dates.
            </p>
          ) : (
            <select
              required
              value={carId}
              onChange={(e) => setCarId(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
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
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {submitting ? "Creating…" : "Create contract"}
      </button>
    </form>
  );
}
