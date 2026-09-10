import { Skeleton } from "@/components/Skeleton";

export default function RequestsLoading() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-14">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-9 w-56" />
      <Skeleton className="mt-3 h-4 w-full max-w-md" />

      {[0, 1].map((s) => (
        <div key={s} className="mt-10">
          <Skeleton className="h-6 w-40" />
          <div className="mt-4 space-y-3">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
