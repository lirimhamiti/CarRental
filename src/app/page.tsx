import Link from "next/link";

const sections = [
  {
    href: "/contracts",
    title: "Contracts",
    description: "Create a new rental contract or look up an existing one.",
  },
  {
    href: "/cars",
    title: "Cars",
    description: "See your fleet and check when each car is free.",
  },
  {
    href: "/reports",
    title: "Reports",
    description: "Income per car over the last 6 months.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-8 px-4 py-16 sm:px-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Car Rental
      </h1>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-sm transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            <span className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
              {section.title}
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {section.description}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
