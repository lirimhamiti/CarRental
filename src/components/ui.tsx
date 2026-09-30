export const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:border-crimson-500 focus:outline-none focus:ring-4 focus:ring-crimson-500/15 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:disabled:bg-zinc-800/60";

export const labelClass =
  "mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400";

export const primaryButtonClass =
  "flex items-center justify-center gap-2 rounded-lg bg-crimson-500 px-5 py-3 text-sm font-medium uppercase tracking-wider text-white shadow-sm transition hover:bg-crimson-600 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600";

export function SectionIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-crimson-50 text-crimson-500 dark:bg-crimson-500/15">
      {children}
    </span>
  );
}
