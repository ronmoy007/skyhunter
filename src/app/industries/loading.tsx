import { Skeleton } from "@/components/Skeleton";

export default function CommunityLoading() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 pb-14 pt-20">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-4 h-12 w-full" />
          <Skeleton className="mt-3 h-12 w-3/4" />
          <Skeleton className="mt-6 h-4 w-full max-w-md" />
          <Skeleton className="mt-2 h-4 w-full max-w-sm" />
          <div className="mt-8 flex gap-3">
            <Skeleton className="h-11 w-36 rounded-xl" />
            <Skeleton className="h-11 w-36 rounded-xl" />
          </div>
        </div>
        <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
      </div>
    </section>
  );
}
