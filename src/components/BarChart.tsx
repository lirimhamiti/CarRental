interface BarChartDatum {
  label: string;
  value: number;
}

const MAX_BAR_HEIGHT = 130;

export function BarChart({
  data,
  formatValue,
}: {
  data: BarChartDatum[];
  formatValue: (n: number) => string;
}) {
  const max = Math.max(0, ...data.map((d) => d.value));
  const maxIndex = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);

  return (
    <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
      <div className="flex min-w-max items-end gap-2 border-b border-zinc-200 dark:border-zinc-800">
        {data.map((d, i) => {
          const height =
            max > 0 ? Math.max((d.value / max) * MAX_BAR_HEIGHT, d.value > 0 ? 4 : 1) : 1;
          return (
            <div
              key={`${d.label}-${i}`}
              title={`${d.label}: ${formatValue(d.value)}`}
              className="flex w-14 flex-col items-center justify-end"
            >
              <span className="mb-1 h-3.5 text-[10px] font-medium text-zinc-600 dark:text-zinc-300">
                {i === maxIndex && max > 0 ? formatValue(d.value) : ""}
              </span>
              <div
                className="w-6 rounded-t-[4px] bg-crimson-500"
                style={{ height: `${height}px` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex min-w-max gap-2">
        {data.map((d, i) => (
          <span
            key={`${d.label}-${i}-label`}
            className="w-14 pt-1.5 text-center text-[10px] text-zinc-400"
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
