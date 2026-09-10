import { Skeleton } from "@/components/Skeleton";

export default function JobsLoading() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-14">
      <div className="max-w-2xl">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-3 h-4 w-full max-w-md" />
      </div>

      <div className="mt-8 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-lg" />
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-steel-line bg-navy p-6"
          >
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-3 h-3 w-24" />
            <Skeleton className="mt-5 h-16 w-full" />
            <Skeleton className="mt-5 h-9 w-32 rounded-lg" />
          </div>
        ))}
      </div>
    </section>
  );
}
