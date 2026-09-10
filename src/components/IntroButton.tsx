import Link from "next/link";
import { Check } from "@/components/icons";

// "Request an interview" — routes to the detailed interview booking page,
// carrying the partner/role so the page and form are pre-filled. Once the
// member has already requested this partner, it shows a done state instead
// (one request per partner).
export function IntroButton({
  partner,
  role,
  requested = false,
}: {
  partner: string;
  role: string;
  requested?: boolean;
}) {
  if (requested) {
    return (
      <Link
        href="/requests"
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan/40 bg-cyan/5 px-4 py-2 text-sm font-semibold text-cyan transition-colors hover:bg-cyan/10"
      >
        <Check className="h-4 w-4" />
        Call requested
      </Link>
    );
  }

  const qs = new URLSearchParams({
    ...(partner ? { partner } : {}),
    ...(role ? { role } : {}),
  }).toString();

  return (
    <Link
      href={`/book-a-call${qs ? `?${qs}` : ""}`}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-steel-line px-4 py-2 text-sm font-semibold text-chrome transition-colors hover:border-blue-500/60"
    >
      Book a call
    </Link>
  );
}
