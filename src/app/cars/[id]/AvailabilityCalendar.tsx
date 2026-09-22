"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface Booking {
  id: string;
  startDate: Date;
  endDate: Date;
  clientName: string;
}

function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export function AvailabilityCalendar({
  bookings,
  today,
  dict,
}: {
  bookings: Booking[];
  today: Date;
  dict: Dictionary;
}) {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(today));

  const monthLabel = `${dict.cars.detail.calendar.months[viewMonth.getUTCMonth()]} ${viewMonth.getUTCFullYear()}`;
  const weekdayLabels = dict.cars.detail.calendar.weekdays;

  const year = viewMonth.getUTCFullYear();
  const month = viewMonth.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const firstWeekday = (viewMonth.getUTCDay() + 6) % 7; // Monday-first index

  const cells: (Date | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(Date.UTC(year, month, i + 1))),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function bookingFor(date: Date): Booking | undefined {
    return bookings.find((b) => date >= b.startDate && date <= b.endDate);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label={dict.cars.detail.calendar.prevMonth}
          onClick={() => setViewMonth(new Date(Date.UTC(year, month - 1, 1)))}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="font-serif text-base text-zinc-900 dark:text-zinc-50">{monthLabel}</p>
        <button
          type="button"
          aria-label={dict.cars.detail.calendar.nextMonth}
          onClick={() => setViewMonth(new Date(Date.UTC(year, month + 1, 1)))}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdayLabels.map((label) => (
          <span key={label} className="py-1 text-[11px] font-medium uppercase text-zinc-400">
            {label}
          </span>
        ))}
        {cells.map((date, i) => {
          if (!date) return <span key={i} />;
          const booking = bookingFor(date);
          const isToday = isSameDay(date, today);
          return (
            <div
              key={i}
              title={booking?.clientName}
              className={`flex aspect-square items-center justify-center rounded-lg text-xs font-medium ${
                booking
                  ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                  : "text-zinc-600 dark:text-zinc-300"
              } ${isToday ? "ring-2 ring-crimson-500 ring-inset" : ""}`}
            >
              {date.getUTCDate()}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          {dict.cars.detail.calendar.legendBooked}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full ring-2 ring-crimson-500" />
          {dict.cars.detail.calendar.legendToday}
        </span>
      </div>
    </div>
  );
}
