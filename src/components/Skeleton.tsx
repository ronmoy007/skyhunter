// Lightweight shimmer block for loading.tsx route skeletons.
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-steel-line/60 ${className}`}
      aria-hidden="true"
    />
  );
}
