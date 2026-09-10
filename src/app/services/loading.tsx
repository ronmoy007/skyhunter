import { Skeleton } from "@/components/Skeleton";

export default function ReskillLoading() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-14">
      <div className="max-w-2xl">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="mt-3 h-4 w-full max-w-md" />
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-2xl" />
        ))}
      </div>
    </section>
  );
}
