"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui";
import { DateInput } from "@/components/DateInput";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface CarRow {
  id: string;
  make: string;
  model: string;
  plate: string;
}

interface Booking {
  carId: string;
  startDate: Date;
  endDate: Date;
  driverNames: string;
}

interface ReservationRow {
  carId: string;
  startDate: Date;
  endDate: Date;
  clientName: string;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + n);
  return d;
}

function startOfMonth(date: Date, offset = 0): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1));
}

function endOfMonth(date: Date, offset = 0): Date {
  // Day 0 of the following month is the last day of the target month.
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset + 1, 0));
}

function allDaysBetween(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) {
    days.push(d);
  }
  return days;
}

// Anchors the rolling window on today: early in the month (1st–10th) there's
// little of the current month behind us, so pull in the previous month too;
// otherwise show the current month plus the next one. Today itself is always
// the default scroll position, reachable by scrolling back into the earlier
// month or forward into the later one.
function rollingRange(today: Date): { start: Date; end: Date } {
  if (today.getUTCDate() <= 10) {
    return { start: startOfMonth(today, -1), end: endOfMonth(today) };
  }
  return { start: startOfMonth(today), end: endOfMonth(today, 1) };
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
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

export function AvailabilityMatrix({
  cars,
  bookings,
  reservations,
  today,
  dict,
}: {
  cars: CarRow[];
  bookings: Booking[];
  reservations: ReservationRow[];
  today: Date;
  dict: Dictionary;
}) {
  const router = useRouter();
  const todayStr = toDateOnly(today);
  const [viewMode, setViewMode] = useState<"range" | "month">("range");
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(today));
  const [selected, setSelected] = useState<CarRow | null>(null);
  const [clientName, setClientName] = useState("");
  const [startDate, setStartDate] = useState(todayStr);
  const [daysField, setDaysField] = useState("1");
  const [endDate, setEndDate] = useState(() => addNights(todayStr, 1));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayCellRef = useRef<HTMLTableCellElement>(null);
  const nameColRef = useRef<HTMLTableCellElement>(null);

  const calendar = dict.cars.detail.calendar;
  const range = useMemo(() => rollingRange(today), [today]);
  const dates =
    viewMode === "range"
      ? allDaysBetween(range.start, range.end)
      : allDaysBetween(monthAnchor, endOfMonth(monthAnchor));
  const rangeStart = dates[0];
  const rangeEnd = dates[dates.length - 1];

  // Land on today's column by default in the rolling view — the window
  // spans an extra month on either side, reachable by scrolling back/forward.
  // scrollIntoView alone isn't enough: the sticky car-name column overlays
  // the scroll container's left edge, so it would hide today's column behind
  // it — offset by that column's rendered width instead.
  useEffect(() => {
    if (viewMode === "range" && scrollRef.current && todayCellRef.current) {
      const containerRect = scrollRef.current.getBoundingClientRect();
      const cellRect = todayCellRef.current.getBoundingClientRect();
      const stickyWidth = nameColRef.current?.getBoundingClientRect().width ?? 0;
      scrollRef.current.scrollLeft += cellRect.left - containerRect.left - stickyWidth;
    }
  }, [viewMode, range]);

  function handlePrev() {
    if (viewMode === "month") {
      setMonthAnchor((prev) => startOfMonth(prev, -1));
    } else {
      scrollRef.current?.scrollBy({ left: -(scrollRef.current.clientWidth * 0.9), behavior: "smooth" });
    }
  }

  function handleNext() {
    if (viewMode === "month") {
      setMonthAnchor((prev) => startOfMonth(prev, 1));
    } else {
      scrollRef.current?.scrollBy({ left: scrollRef.current.clientWidth * 0.9, behavior: "smooth" });
    }
  }

  function switchViewMode(mode: "range" | "month") {
    if (mode === "month") setMonthAnchor(startOfMonth(today));
    setViewMode(mode);
  }
  const monthLabel =
    rangeStart.getUTCMonth() === rangeEnd.getUTCMonth() && rangeStart.getUTCFullYear() === rangeEnd.getUTCFullYear()
      ? `${calendar.months[rangeStart.getUTCMonth()]} ${rangeStart.getUTCFullYear()}`
      : `${calendar.months[rangeStart.getUTCMonth()].slice(0, 3)} ${rangeStart.getUTCDate()} – ${calendar.months[rangeEnd.getUTCMonth()].slice(0, 3)} ${rangeEnd.getUTCDate()}, ${rangeEnd.getUTCFullYear()}`;

  function bookingFor(carId: string, date: Date): Booking | undefined {
    // endDate is the checkout/return day (exclusive) — see nightsBetween.
    return bookings.find((b) => b.carId === carId && date >= b.startDate && date < b.endDate);
  }

  function reservationFor(carId: string, date: Date): ReservationRow | undefined {
    return reservations.find((r) => r.carId === carId && date >= r.startDate && date < r.endDate);
  }

  function openDialog(car: CarRow, date: Date) {
    setSelected(car);
    setClientName("");
    const start = toDateOnly(date);
    setStartDate(start);
    setDaysField("1");
    setEndDate(addNights(start, 1));
    setError(null);
  }

  function closeDialog() {
    setSelected(null);
  }

  function handleStartDateChange(value: string) {
    setStartDate(value);
    const numDays = Number(daysField);
    if (numDays > 0) {
      setEndDate(addNights(value, numDays));
    } else if (endDate <= value) {
      setEndDate(addNights(value, 1));
    }
  }

  function handleDaysFieldChange(value: string) {
    setDaysField(value);
    const numDays = Number(value);
    if (numDays > 0 && startDate) {
      setEndDate(addNights(startDate, numDays));
    }
  }

  function handleEndDateChange(value: string) {
    setEndDate(value);
    if (startDate && value > startDate) {
      setDaysField(String(nightsBetween(startDate, value)));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId: selected.id,
          startDate,
          days: Number(daysField),
          clientName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(dict.contracts.errors[data.code as keyof typeof dict.contracts.errors] ?? dict.contracts.errors.GENERIC);
        return;
      }
      closeDialog();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-zinc-200 p-0.5 text-xs dark:border-zinc-800">
          <button
            type="button"
            onClick={() => switchViewMode("range")}
            className={`rounded-md px-3 py-1.5 font-medium uppercase tracking-wide transition ${
              viewMode === "range"
                ? "bg-ink text-crimson-400"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {dict.availability.viewModeRange}
          </button>
          <button
            type="button"
            onClick={() => switchViewMode("month")}
            className={`rounded-md px-3 py-1.5 font-medium uppercase tracking-wide transition ${
              viewMode === "month"
                ? "bg-ink text-crimson-400"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {dict.availability.viewModeMonth}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label={viewMode === "month" ? calendar.prevMonth : calendar.scrollBack}
          onClick={handlePrev}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="font-serif text-base text-zinc-900 dark:text-zinc-50">{monthLabel}</p>
        <button
          type="button"
          aria-label={viewMode === "month" ? calendar.nextMonth : calendar.scrollForward}
          onClick={handleNext}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div ref={scrollRef} className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 [-webkit-overflow-scrolling:touch]">
        <table className="border-collapse text-sm">
          <thead>
            <tr>
              <th
                ref={nameColRef}
                className="sticky left-0 z-10 border-b border-zinc-200 bg-white px-1.5 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 sm:px-3"
              >
                &nbsp;
              </th>
              {dates.map((date) => {
                const isToday = isSameDay(date, today);
                const weekday = calendar.weekdays[(date.getUTCDay() + 6) % 7];
                return (
                  <th
                    key={date.toISOString()}
                    ref={isToday ? todayCellRef : undefined}
                    className={`min-w-[34px] border-b border-l border-zinc-200 bg-white px-1 py-2 text-center dark:border-zinc-800 dark:bg-zinc-900 sm:min-w-[38px] ${
                      isToday ? "bg-crimson-50/50 text-crimson-600 dark:bg-crimson-500/5 dark:text-crimson-400" : ""
                    }`}
                  >
                    <div className="text-[10px] uppercase text-zinc-400">{weekday}</div>
                    <div className="text-xs font-medium">
                      {date.getUTCDate()}
                      {date.getUTCDate() === 1 && (
                        <span className="ml-0.5 text-[9px] font-normal text-zinc-400">
                          {calendar.months[date.getUTCMonth()].slice(0, 3)}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car.id}>
                <td className="sticky left-0 z-10 whitespace-nowrap border-b border-zinc-100 bg-white px-1.5 py-1.5 text-xs dark:border-zinc-800 dark:bg-zinc-900 sm:px-3">
                  <div
                    title={`${car.make} ${car.model}`}
                    className="max-w-[68px] truncate font-medium text-zinc-700 dark:text-zinc-200 sm:max-w-[140px]"
                  >
                    {car.make} {car.model}
                  </div>
                  <div className="max-w-[68px] truncate font-mono text-[10px] text-zinc-400 sm:max-w-[140px]">
                    {car.plate}
                  </div>
                </td>
                {dates.map((date) => {
                  const isToday = isSameDay(date, today);
                  const isPast = date < today && !isToday;
                  const booking = bookingFor(car.id, date);
                  const reservation = !booking ? reservationFor(car.id, date) : undefined;
                  return (
                    <td
                      key={date.toISOString()}
                      className={`border-b border-l border-zinc-100 p-1 text-center dark:border-zinc-800 ${
                        isToday ? "bg-crimson-50/50 dark:bg-crimson-500/5" : ""
                      }`}
                    >
                      {booking ? (
                        <span
                          title={booking.driverNames}
                          className="inline-block h-5 w-5 rounded bg-red-400 dark:bg-red-500/70"
                        />
                      ) : reservation ? (
                        <span
                          title={reservation.clientName}
                          className="inline-block h-5 w-5 rounded bg-amber-300 dark:bg-amber-500/70"
                        />
                      ) : isPast ? (
                        <span className="inline-block h-5 w-5 rounded bg-zinc-100 dark:bg-zinc-800" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => openDialog(car, date)}
                          title={dict.availability.reserveTitle}
                          className="inline-block h-5 w-5 rounded bg-emerald-100 transition hover:bg-emerald-300 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/40"
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-red-400" />
          {calendar.legendBooked}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-amber-300" />
          {dict.availability.legendReserved}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-emerald-100 dark:bg-emerald-500/10" />
          {dict.availability.legendFree}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full ring-2 ring-crimson-500" />
          {calendar.legendToday}
        </span>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeDialog}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-lg text-zinc-900 dark:text-zinc-50">
              {dict.availability.reserveTitle}
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {selected.make} {selected.model} · {selected.plate}
            </p>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
              <div>
                <label className={labelClass}>{dict.availability.clientName}</label>
                <input
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className={inputClass}
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>{dict.contracts.rental.startDate}</label>
                  <DateInput required value={startDate} min={todayStr} onChange={handleStartDateChange} />
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
              </div>
              <div>
                <label className={labelClass}>{dict.contracts.rental.endDate}</label>
                <DateInput
                  required
                  value={endDate}
                  min={startDate ? addNights(startDate, 1) : undefined}
                  onChange={handleEndDateChange}
                />
              </div>

              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className={`flex-1 ${primaryButtonClass}`}>
                  {submitting ? dict.contracts.buttons.creating : dict.availability.create}
                </button>
                <button
                  type="button"
                  onClick={closeDialog}
                  className="rounded-lg border border-zinc-300 px-5 py-3 text-sm font-medium uppercase tracking-wider text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {dict.availability.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
