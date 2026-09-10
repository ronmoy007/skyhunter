import { Skeleton } from "@/components/Skeleton";

export default function DashboardLoading() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-12">
      <div className="flex items-end justify-between gap-3">
        <div>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-9 w-72" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-steel-line bg-navy p-5"
          >
            <Skeleton className="h-8 w-16" />
            <Skeleton className="mt-2 h-3 w-24" />
          </div>
        ))}
      </div>

      <Skeleton className="mt-10 h-56 w-full rounded-2xl" />

      <div className="mt-10">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-4 h-24 w-full rounded-2xl" />
      </div>
    </section>
  );
}
