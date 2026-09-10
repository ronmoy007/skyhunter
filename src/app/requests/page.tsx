import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { introsByUser, applicationsByUser } from "@/lib/store";
import { STATUS_BADGE, STATUS_HINT, formatSchedule } from "@/lib/requests";
import { ArrowRight } from "@/components/icons";

export const metadata: Metadata = { title: "Your requests · SkyHunter" };
export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${
        STATUS_BADGE[status] ?? "bg-steel text-fog"
      }`}
    >
      {status}
    </span>
  );
}

// Interview requests are stored with the schedule packed into the message —
// pull the readable bits back out for the member.
function parseInterview(message: string): { when?: string; goals?: string } {
  const when = message.match(/Preferred:\s*([^.]+?)(?:\.|$)/i)?.[1]?.trim();
  const goals = message.match(/Goals:\s*(.+)$/i)?.[1]?.trim();
  return { when, goals };
}

function when(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function RequestsPage() {
  const session = await getSession();
  if (!session) redirect("/signin?next=/requests");

  const [interviews, applications] = await Promise.all([
    introsByUser(session.email),
    applicationsByUser(session.email),
  ]);

  return (
    <section className="mx-auto max-w-3xl px-5 py-14">
      <div>
        <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
          Your activity
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-chrome">
          Your requests
        </h1>
        <p className="mt-2 text-mist">
          Track your interviews and job applications here. We&apos;ll notify you
          whenever the team updates a status.
        </p>
      </div>

      {/* Interviews */}
      <div className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold text-chrome">
            Interviews
          </h2>
          <span className="text-sm text-fog">{interviews.length}</span>
        </div>

        {interviews.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-steel-line bg-navy/40 p-8 text-center">
            <p className="text-mist">You haven&apos;t booked an interview yet.</p>
            <Link
              href="/book-a-call"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-400"
            >
              Book an interview <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {interviews.map((iv) => {
              const { when: pref, goals } = parseInterview(iv.message);
              const title =
                iv.partner && iv.partner !== "SkyHunter interview"
                  ? `Interview · ${iv.partner}${iv.role ? ` (${iv.role})` : ""}`
                  : "Interview with the SkyHunter team";
              return (
                <li key={iv.id}>
                  <Link
                    href={`/requests/interview/${iv.id}`}
                    className="block rounded-2xl border border-steel-line bg-navy/50 p-5 transition-colors hover:border-blue-500/50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-chrome">{title}</p>
                        <p className="mt-0.5 text-xs text-fog">
                          Requested {when(iv.createdAt)}
                          {pref ? ` · ${pref}` : ""}
                        </p>
                        {iv.scheduledAt && (
                          <p className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-amber-400/10 px-2 py-0.5 text-xs font-semibold text-amber-600 ring-1 ring-amber-400/30">
                            Scheduled · {formatSchedule(iv.scheduledAt)}
                          </p>
                        )}
                        {goals && (
                          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-mist">
                            {goals}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <StatusBadge status={iv.status} />
                        <ArrowRight className="h-4 w-4 text-fog" />
                      </div>
                    </div>
                    <p className="mt-3 border-t border-steel-line pt-3 text-xs text-fog">
                      {STATUS_HINT[iv.status] ?? ""}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Job applications */}
      <div className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold text-chrome">
            Job applications
          </h2>
          <span className="text-sm text-fog">{applications.length}</span>
        </div>

        {applications.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-steel-line bg-navy/40 p-8 text-center">
            <p className="text-mist">You haven&apos;t applied to any jobs yet.</p>
            <Link
              href="/work"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-400"
            >
              Browse jobs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {applications.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/requests/application/${a.id}`}
                  className="block rounded-2xl border border-steel-line bg-navy/50 p-5 transition-colors hover:border-blue-500/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-chrome">
                        {a.jobTitle || a.jobId}
                      </p>
                      <p className="mt-0.5 text-xs text-fog">
                        Applied {when(a.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={a.status} />
                      <ArrowRight className="h-4 w-4 text-fog" />
                    </div>
                  </div>
                  <p className="mt-3 border-t border-steel-line pt-3 text-xs text-fog">
                    {STATUS_HINT[a.status] ?? ""}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
