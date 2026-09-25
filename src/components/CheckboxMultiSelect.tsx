"use client";

import { useEffect, useRef, useState } from "react";
import { inputClass } from "@/components/ui";

export interface CheckboxMultiSelectOption {
  key: string;
  label: string;
}

export function CheckboxMultiSelect({
  options,
  selected,
  onToggle,
  placeholder,
}: {
  options: CheckboxMultiSelectOption[];
  selected: string[];
  onToggle: (key: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const summary = options
    .filter((o) => selected.includes(o.key))
    .map((o) => o.label)
    .join(", ");

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`${inputClass} flex items-center justify-between gap-2 text-left`}
      >
        <span className={summary ? "" : "text-zinc-400 dark:text-zinc-600"}>
          {summary || placeholder}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={`h-4 w-4 shrink-0 text-zinc-400 transition ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-20 mt-1.5 w-full rounded-lg border border-zinc-200 bg-white p-1.5 shadow-lg shadow-zinc-200/60 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/30">
          {options.map((option) => (
            <label
              key={option.key}
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <input
                type="checkbox"
                checked={selected.includes(option.key)}
                onChange={() => onToggle(option.key)}
                className="h-4 w-4 shrink-0 rounded border-zinc-300 text-crimson-500 focus:ring-crimson-500/40 dark:border-zinc-600"
              />
              {option.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
