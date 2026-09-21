export default function CarsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-12 sm:px-8">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Cars
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Fleet list goes here — click a car to see its booked date ranges.
      </p>
    </main>
  );
}
