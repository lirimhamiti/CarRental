"use client";

import { useState } from "react";
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

export function AvailabilityMatrix({
  cars,
  bookings,
  today,
  dict,
}: {
  cars: CarRow[];
  bookings: Booking[];
  today: Date;
  dict: Dictionary;
}) {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(today));

  const calendar = dict.cars.detail.calendar;
  const monthLabel = `${calendar.months[viewMonth.getUTCMonth()]} ${viewMonth.getUTCFullYear()}`;

  const year = viewMonth.getUTCFullYear();
  const month = viewMonth.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const dates = Array.from({ length: daysInMonth }, (_, i) => new Date(Date.UTC(year, month, i + 1)));

  function bookingFor(carId: string, date: Date): Booking | undefined {
    return bookings.find((b) => b.carId === carId && date >= b.startDate && date <= b.endDate);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label={calendar.prevMonth}
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
          aria-label={calendar.nextMonth}
          onClick={() => setViewMonth(new Date(Date.UTC(year, month + 1, 1)))}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 [-webkit-overflow-scrolling:touch]">
        <table className="border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 border-b border-zinc-200 bg-white px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                &nbsp;
              </th>
              {cars.map((car) => (
                <th
                  key={car.id}
                  className="border-b border-l border-zinc-200 bg-white px-2 py-2 text-center align-bottom dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="max-w-[120px] truncate text-xs font-medium text-zinc-700 dark:text-zinc-200">
                    {car.make} {car.model}
                  </div>
                  <div className="font-mono text-[10px] text-zinc-400">{car.plate}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dates.map((date) => {
              const isToday = isSameDay(date, today);
              const weekday = calendar.weekdays[(date.getUTCDay() + 6) % 7];
              return (
                <tr key={date.toISOString()} className={isToday ? "bg-crimson-50/50 dark:bg-crimson-500/5" : ""}>
                  <td
                    className={`sticky left-0 z-10 whitespace-nowrap border-b border-zinc-100 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 ${
                      isToday ? "text-crimson-600 dark:text-crimson-400" : ""
                    }`}
                  >
                    {weekday} {date.getUTCDate()}
                  </td>
                  {cars.map((car) => {
                    const booking = bookingFor(car.id, date);
                    return (
                      <td
                        key={car.id}
                        className="border-b border-l border-zinc-100 p-1 text-center dark:border-zinc-800"
                      >
                        <span
                          title={booking?.driverNames}
                          className={`inline-block h-5 w-5 rounded ${
                            booking
                              ? "bg-red-400 dark:bg-red-500/70"
                              : "bg-emerald-100 dark:bg-emerald-500/10"
                          }`}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-red-400" />
          {calendar.legendBooked}
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
    </div>
  );
}
