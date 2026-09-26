"use client";

import { useRef, useState } from "react";
import { inputClass } from "@/components/ui";

// Native <input type="date"> renders in whatever format the browser/OS
// locale dictates (mm/dd/yyyy, dd/mm/yyyy, yyyy-mm-dd…) — there is no
// HTML/CSS way to force a display format on it. This component pairs a
// masked dd.MM.yyyy text field (what the user sees and types) with a
// hidden native date input (for the familiar calendar-picker UI, opened
// via the button) so the picker still works while the visible format is
// always dd.MM.yyyy. The value/onChange contract stays ISO yyyy-MM-dd,
// same as the native input it replaces, so callers don't need to change.

function isoToDisplay(iso: string): string {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  const [, y, m, d] = match;
  return `${d}.${m}.${y}`;
}

function displayToIso(display: string): string | null {
  const match = display.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return null;
  const [, d, m, y] = match;
  const day = Number(d);
  const month = Number(m);
  const year = Number(y);
  const date = new Date(Date.UTC(year, month - 1, day));
  const isValid = date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return isValid ? `${y}-${m}-${d}` : null;
}

function maskDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 4) return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
  if (digits.length > 2) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return digits;
}

export function DateInput({
  value,
  onChange,
  required,
  min,
  max,
  className = inputClass,
}: {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  min?: string;
  max?: string;
  className?: string;
}) {
  const [text, setText] = useState(() => isoToDisplay(value));
  const [syncedValue, setSyncedValue] = useState(value);
  const nativeRef = useRef<HTMLInputElement>(null);

  // Stay in sync when the ISO value changes from outside this input (e.g.
  // a sibling date field recalculating this one, or the native picker).
  // Done during render, not an effect, per React's guidance for resetting
  // state when a prop changes — avoids an extra post-commit render pass.
  if (value !== syncedValue) {
    setSyncedValue(value);
    setText(isoToDisplay(value));
  }

  function handleTextChange(raw: string) {
    const masked = maskDigits(raw);
    setText(masked);
    if (masked === "") {
      onChange("");
      return;
    }
    const iso = displayToIso(masked);
    if (iso) onChange(iso);
  }

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        placeholder="dd.mm.yyyy"
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        required={required}
        className={`${className} pr-9`}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Open calendar"
        onClick={() => nativeRef.current?.showPicker?.()}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-crimson-500"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <path
            d="M8 3v3M16 3v3M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1ZM4 10h16"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <input
        ref={nativeRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="pointer-events-none absolute inset-0 opacity-0"
      />
    </div>
  );
}
