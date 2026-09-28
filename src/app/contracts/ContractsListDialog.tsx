"use client";

import { useEffect, useState } from "react";
import { carLabel } from "@/lib/cars";
import { formatDate } from "@/lib/dates";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { interpolate } from "@/lib/i18n/get-dictionary";

interface ContractSummary {
  id: string;
  startDate: string;
  endDate: string;
  totalPrice: number | null;
  car: { make: string; model: string; year: number | null; plate: string };
  drivers: { firstName: string; lastName: string }[];
}

const PAGE_SIZE = 20;

export function ContractsListDialog({
  dict,
  onClose,
  onSelect,
}: {
  dict: Dictionary;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [contracts, setContracts] = useState<ContractSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  function handleQueryChange(value: string) {
    setQuery(value);
    setLoading(true);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  function goToPage(next: number) {
    setLoading(true);
    setPage(next);
  }

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/contracts?q=${encodeURIComponent(debouncedQuery)}&page=${page}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data: { contracts: ContractSummary[]; total: number }) => {
        setContracts(data.contracts);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [debouncedQuery, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-serif text-lg text-zinc-900 dark:text-zinc-50">{dict.contracts.list.title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium uppercase tracking-wider text-zinc-500 transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            {dict.contracts.list.close}
          </button>
        </div>

        <input
          autoFocus
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder={dict.contracts.list.searchPlaceholder}
          className="mt-4 w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-crimson-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        />

        <div className="mt-4 -mx-6 flex-1 overflow-auto px-6">
          {loading ? (
            <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">{dict.contracts.list.loading}</p>
          ) : contracts.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">{dict.contracts.list.empty}</p>
          ) : (
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  <th className="py-2 pr-3">{dict.contracts.list.headers.id}</th>
                  <th className="py-2 pr-3">{dict.contracts.list.headers.drivers}</th>
                  <th className="py-2 pr-3">{dict.contracts.list.headers.car}</th>
                  <th className="py-2 pr-3">{dict.contracts.list.headers.dates}</th>
                  <th className="py-2 pr-3 text-right">{dict.contracts.list.headers.price}</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => onSelect(c.id)}
                    className="cursor-pointer border-b border-zinc-100 transition hover:bg-crimson-50 dark:border-zinc-800/60 dark:hover:bg-crimson-500/10"
                  >
                    <td className="py-2.5 pr-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                      {c.id.slice(-8)}
                    </td>
                    <td className="py-2.5 pr-3 text-zinc-900 dark:text-zinc-50">
                      {c.drivers.map((d) => `${d.firstName} ${d.lastName}`).join(", ") || "-"}
                    </td>
                    <td className="py-2.5 pr-3 text-zinc-700 dark:text-zinc-300">
                      {carLabel(c.car.make, c.car.model, c.car.year)} · {c.car.plate}
                    </td>
                    <td className="py-2.5 pr-3 whitespace-nowrap text-zinc-700 dark:text-zinc-300">
                      {formatDate(new Date(c.startDate))} – {formatDate(new Date(c.endDate))}
                    </td>
                    <td className="py-2.5 pr-3 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                      {c.totalPrice != null ? c.totalPrice.toFixed(2) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {interpolate(dict.contracts.list.pageInfo, { page: String(page), pages: String(totalPages) })}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => goToPage(Math.max(1, page - 1))}
              className="rounded-lg border border-zinc-300 px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {dict.contracts.list.prev}
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => goToPage(Math.min(totalPages, page + 1))}
              className="rounded-lg border border-zinc-300 px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {dict.contracts.list.next}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
