import { Skeleton } from "@/components/Skeleton";

export default function SupportLoading() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-14">
      <div className="max-w-2xl">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="mt-3 h-4 w-full max-w-md" />
      </div>
      <div className="mt-10 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    </section>
  );
}
