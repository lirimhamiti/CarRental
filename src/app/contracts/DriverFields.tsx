"use client";

import { useEffect, useState } from "react";
import { dateInputClass, inputClass, labelClass } from "@/components/ui";
import { interpolate, type Dictionary } from "@/lib/i18n/get-dictionary";

const today = new Date().toISOString().slice(0, 10);

function addYears(dateStr: string, years: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCFullYear(d.getUTCFullYear() + years);
  return d.toISOString().slice(0, 10);
}

interface ClientSuggestion {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  passportNumber: string | null;
  passportIssueDate: string | null;
  passportExpiryDate: string | null;
  licenceNumber: string | null;
  licenceIssueDate: string | null;
  licenceExpiryDate: string | null;
}

export interface DriverValue {
  clientId?: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  passportNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  licenceNumber: string;
  licenceIssueDate: string;
  licenceExpiryDate: string;
}

export function emptyDriver(): DriverValue {
  return {
    clientId: undefined,
    firstName: "",
    lastName: "",
    birthDate: "",
    passportNumber: "",
    passportIssueDate: "",
    passportExpiryDate: "",
    licenceNumber: "",
    licenceIssueDate: "",
    licenceExpiryDate: "",
  };
}

export function DriverFields({
  index,
  driver,
  dict,
  onChange,
  onRemove,
}: {
  index: number;
  driver: DriverValue;
  dict: Dictionary;
  onChange: (patch: Partial<DriverValue>) => void;
  onRemove?: () => void;
}) {
  const [suggestions, setSuggestions] = useState<ClientSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (driver.firstName.trim().length < 2 || driver.clientId) {
      return;
    }
    let cancelled = false;
    const timeout = setTimeout(() => {
      fetch(`/api/clients/search?q=${encodeURIComponent(driver.firstName)}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((json: ClientSuggestion[]) => {
          if (!cancelled) setSuggestions(json);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [driver.firstName, driver.clientId]);

  function selectClient(client: ClientSuggestion) {
    onChange({
      clientId: client.id,
      firstName: client.firstName.toUpperCase(),
      lastName: client.lastName.toUpperCase(),
      birthDate: client.birthDate?.slice(0, 10) ?? "",
      passportNumber: client.passportNumber ?? "",
      passportIssueDate: client.passportIssueDate?.slice(0, 10) ?? "",
      passportExpiryDate: client.passportExpiryDate?.slice(0, 10) ?? "",
      licenceNumber: client.licenceNumber ?? "",
      licenceIssueDate: client.licenceIssueDate?.slice(0, 10) ?? "",
      licenceExpiryDate: client.licenceExpiryDate?.slice(0, 10) ?? "",
    });
    setSuggestions([]);
    setShowSuggestions(false);
  }

  function handleFirstNameChange(value: string) {
    onChange({ firstName: value.toUpperCase(), clientId: undefined });
    setShowSuggestions(true);
    if (value.trim().length < 2) {
      setSuggestions([]);
    }
  }

  function handlePassportIssueChange(value: string) {
    onChange({
      passportIssueDate: value,
      passportExpiryDate: value ? addYears(value, 10) : driver.passportExpiryDate,
    });
  }

  function handleLicenceIssueChange(value: string) {
    onChange({
      licenceIssueDate: value,
      licenceExpiryDate: value ? addYears(value, 10) : driver.licenceExpiryDate,
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {interpolate(dict.contracts.client.driverLabel, { n: String(index + 1) })}
        </h3>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-medium uppercase tracking-wider text-red-600 transition hover:underline dark:text-red-400"
          >
            {dict.contracts.client.removeDriver}
          </button>
        )}
      </div>

      {driver.clientId && (
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
          {dict.contracts.client.existingSelected}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="relative">
          <label className={labelClass}>{dict.contracts.client.nameSurname}</label>
          <input
            required
            placeholder={dict.contracts.client.namePlaceholder}
            value={driver.firstName}
            onChange={(e) => handleFirstNameChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            className={inputClass}
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg shadow-zinc-200/60 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/30">
              {suggestions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => selectClient(s)}
                    className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm transition hover:bg-crimson-50 dark:hover:bg-crimson-500/10"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-crimson-400">
                      {s.firstName[0]}
                      {s.lastName[0]}
                    </span>
                    <span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">
                        {s.firstName} {s.lastName}
                      </span>
                      <span className="ml-1.5 text-zinc-400">
                        · {s.passportNumber || s.licenceNumber || ""}
                      </span>
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
            placeholder={dict.contracts.client.surnamePlaceholder}
            value={driver.lastName}
            onChange={(e) => onChange({ lastName: e.target.value.toUpperCase() })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{dict.contracts.client.birthDate}</label>
          <input
            type="date"
            required
            value={driver.birthDate}
            max={today}
            onChange={(e) => onChange({ birthDate: e.target.value })}
            className={dateInputClass}
          />
        </div>
      </div>

      <p className="-mb-1 text-xs text-zinc-500 dark:text-zinc-400">{dict.contracts.client.idHint}</p>

      <div className="flex flex-col gap-4">
        <div>
          <label className={labelClass}>{dict.contracts.client.passportNumber}</label>
          <input
            value={driver.passportNumber}
            onChange={(e) => onChange({ passportNumber: e.target.value })}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{dict.contracts.client.passportIssueDate}</label>
            <input
              type="date"
              value={driver.passportIssueDate}
              onChange={(e) => handlePassportIssueChange(e.target.value)}
              className={dateInputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{dict.contracts.client.passportExpiryDate}</label>
            <input
              type="date"
              value={driver.passportExpiryDate}
              onChange={(e) => onChange({ passportExpiryDate: e.target.value })}
              className={dateInputClass}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className={labelClass}>{dict.contracts.client.licenceNumber}</label>
          <input
            value={driver.licenceNumber}
            onChange={(e) => onChange({ licenceNumber: e.target.value })}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{dict.contracts.client.licenceIssueDate}</label>
            <input
              type="date"
              value={driver.licenceIssueDate}
              onChange={(e) => handleLicenceIssueChange(e.target.value)}
              className={dateInputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{dict.contracts.client.licenceExpiryDate}</label>
            <input
              type="date"
              value={driver.licenceExpiryDate}
              onChange={(e) => onChange({ licenceExpiryDate: e.target.value })}
              className={dateInputClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
