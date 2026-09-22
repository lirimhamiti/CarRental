"use client";

import { useEffect, useState } from "react";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui";
import { BarChart } from "@/components/BarChart";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface CarOption {
  id: string;
  make: string;
  model: string;
  plate: string;
}

interface ReportData {
  totalIncome: number;
  contractCount: number;
  monthly: { monthIndex: number; income: number }[];
  byCar: { label: string; income: number }[];
}

const PERIODS = ["1m", "3m", "6m", "1y"] as const;

function formatValue(n: number): string {
  return n.toFixed(2);
}

export function ReportsForm({ cars, dict }: { cars: CarOption[]; dict: Dictionary }) {
  const [carId, setCarId] = useState("all");
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("6m");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportData | null>(null);

  function fetchReport(currentCarId: string, currentPeriod: string) {
    return fetch(`/api/reports?carId=${currentCarId}&period=${currentPeriod}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json: ReportData | null) => {
        if (json) setData(json);
      });
  }

  function runReport() {
    setLoading(true);
    fetchReport(carId, period).finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchReport(carId, period).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const monthLabels = dict.common.monthsShort;
  const periodLabels: Record<(typeof PERIODS)[number], string> = {
    "1m": dict.reports.periodOptions.lastMonth,
    "3m": dict.reports.periodOptions.last3Months,
    "6m": dict.reports.periodOptions.last6Months,
    "1y": dict.reports.periodOptions.lastYear,
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-end sm:gap-4">
        <div className="flex-1">
          <label className={labelClass}>{dict.reports.car}</label>
          <select value={carId} onChange={(e) => setCarId(e.target.value)} className={inputClass}>
            <option value="all">{dict.reports.allCars}</option>
            {cars.map((car) => (
              <option key={car.id} value={car.id}>
                {car.make} {car.model} · {car.plate}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className={labelClass}>{dict.reports.period}</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as (typeof PERIODS)[number])}
            className={inputClass}
          >
            {PERIODS.map((p) => (
              <option key={p} value={p}>
                {periodLabels[p]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={runReport}
          disabled={loading}
          className={`${primaryButtonClass} sm:w-auto`}
        >
          {loading ? dict.reports.checking : dict.reports.check}
        </button>
      </div>

      {data && (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {dict.reports.summary.totalIncome}
              </p>
              <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {formatValue(data.totalIncome)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {dict.reports.summary.contracts}
              </p>
              <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {data.contractCount}
              </p>
            </div>
          </div>

          {data.contractCount === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{dict.reports.noData}</p>
          ) : (
            <>
              <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="font-serif text-lg text-zinc-900 dark:text-zinc-50">
                  {dict.reports.charts.byMonth}
                </h2>
                <div className="mt-6">
                  <BarChart
                    data={data.monthly.map((m) => ({
                      label: monthLabels[m.monthIndex],
                      value: m.income,
                    }))}
                    formatValue={formatValue}
                  />
                </div>
              </div>

              {carId === "all" && data.byCar.length > 0 && (
                <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <h2 className="font-serif text-lg text-zinc-900 dark:text-zinc-50">
                    {dict.reports.charts.byCar}
                  </h2>
                  <div className="mt-6">
                    <BarChart
                      data={data.byCar.map((c) => ({ label: c.label, value: c.income }))}
                      formatValue={formatValue}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
