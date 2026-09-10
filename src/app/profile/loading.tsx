import { Skeleton } from "@/components/Skeleton";

export default function ProfileLoading() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-14">
      <div className="flex items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-2 h-3 w-52" />
          </div>
        </div>
        <Skeleton className="h-6 w-28" />
      </div>

      <Skeleton className="mt-8 h-40 w-full rounded-2xl" />
      <Skeleton className="mt-6 h-32 w-full rounded-2xl" />
      <Skeleton className="mt-6 h-96 w-full rounded-2xl" />
    </section>
  );
}
