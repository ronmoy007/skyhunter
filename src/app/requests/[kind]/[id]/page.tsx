import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { introsByUser, applicationsByUser } from "@/lib/store";
import { STATUS_BADGE, STATUS_HINT, formatSchedule } from "@/lib/requests";
import { ArrowRight } from "@/components/icons";

export const metadata: Metadata = { title: "Request · SkyHunter" };
export const dynamic = "force-dynamic";

function parseInterview(message: string): { when?: string; goals?: string } {
  const when = message.match(/Preferred:\s*([^.]+?)(?:\.|$)/i)?.[1]?.trim();
  const goals = message.match(/Goals:\s*(.+)$/i)?.[1]?.trim();
  return { when, goals };
}

function fullDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function Badge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-md px-3 py-1 text-sm font-semibold capitalize ${
        STATUS_BADGE[status] ?? "bg-steel text-fog"
      }`}
    >
      {status}
    </span>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-steel-line py-3 last:border-0 sm:flex-row sm:justify-between sm:gap-6">
      <dt className="text-sm text-fog">{label}</dt>
      <dd className="text-sm font-medium text-chrome sm:text-right">{children}</dd>
    </div>
  );
}

function Hint({ status }: { status: string }) {
  return (
    <div className="mt-5 rounded-xl border border-blue-500/25 bg-blue-500/5 px-5 py-4">
      <p className="text-sm font-medium text-chrome">
        {STATUS_HINT[status] ?? "We'll keep you posted here."}
      </p>
    </div>
  );
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/signin?next=/requests");
  const { kind, id } = await params;

  if (kind !== "interview" && kind !== "application") notFound();

  const back = (
    <Link
      href="/requests"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-fog transition-colors hover:text-chrome"
    >
      ← Back to your requests
    </Link>
  );

  if (kind === "interview") {
    const iv = (await introsByUser(session.email)).find((i) => i.id === id);
    if (!iv) notFound();
    const { when, goals } = parseInterview(iv.message);
    const title =
      iv.partner && iv.partner !== "SkyHunter interview"
        ? `Interview · ${iv.partner}`
        : "Interview with the SkyHunter team";

    return (
      <section className="mx-auto max-w-2xl px-5 py-14">
        {back}
        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
              Interview request
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-chrome">
              {title}
            </h1>
          </div>
          <Badge status={iv.status} />
        </div>

        {iv.scheduledAt ? (
          <div className="mt-5 rounded-2xl border border-amber-400/40 bg-amber-400/5 px-5 py-5">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">
              Interview scheduled
            </p>
            <p className="mt-2 font-display text-2xl font-semibold text-chrome">
              {formatSchedule(iv.scheduledAt)}
            </p>
            <p className="mt-1 text-sm text-mist">
              Interviews are held on Lark — please install the app and be ready a
              few minutes early.
            </p>
            {iv.scheduleNote && (
              <p className="mt-3 rounded-lg border border-steel-line bg-navy/50 px-4 py-2.5 text-sm text-mist">
                {iv.scheduleNote}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              {iv.meetingLink && (
                <a
                  href={iv.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-400"
                >
                  Join the interview <ArrowRight className="h-4 w-4" />
                </a>
              )}
              <a
                href="https://www.larksuite.com/en_us/download"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-steel-line px-5 py-2.5 text-sm font-semibold text-chrome transition-colors hover:border-blue-500/60"
              >
                Download Lark
              </a>
            </div>
          </div>
        ) : (
          <Hint status={iv.status} />
        )}

        <dl className="mt-6 rounded-2xl border border-steel-line bg-navy/50 px-5 py-2">
          {iv.role && <Row label="Role">{iv.role}</Row>}
          <Row label="Requested on">{fullDate(iv.createdAt)}</Row>
          {when && <Row label="Preferred time">{when}</Row>}
          <Row label="Contact email">{iv.contactEmail || iv.email}</Row>
          {iv.phone && <Row label="Phone">{iv.phone}</Row>}
        </dl>

        {goals && (
          <div className="mt-4 rounded-2xl border border-steel-line bg-navy/50 p-5">
            <p className="text-xs uppercase tracking-wider text-fog">
              What you asked for
            </p>
            <p className="mt-2 text-sm leading-relaxed text-mist">{goals}</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link
            href="/book-a-call"
            className="inline-flex items-center gap-2 rounded-lg border border-steel-line px-5 py-2.5 text-sm font-semibold text-chrome hover:border-blue-500/60"
          >
            Book another interview
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-300 hover:text-blue-400"
          >
            Need help? Contact the team <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  // Application
  const app = (await applicationsByUser(session.email)).find((a) => a.id === id);
  if (!app) notFound();

  return (
    <section className="mx-auto max-w-2xl px-5 py-14">
      {back}
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
            Job application
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-chrome">
            {app.jobTitle || app.jobId}
          </h1>
        </div>
        <Badge status={app.status} />
      </div>

      <Hint status={app.status} />

      <dl className="mt-6 rounded-2xl border border-steel-line bg-navy/50 px-5 py-2">
        <Row label="Applied on">{fullDate(app.createdAt)}</Row>
        <Row label="Role">
          <Link
            href={`/work/${app.jobId}`}
            className="text-blue-300 hover:text-blue-400"
          >
            {app.jobTitle || app.jobId}
          </Link>
        </Row>
        <Row label="Applied as">{app.email}</Row>
      </dl>

      {app.note && (
        <div className="mt-4 rounded-2xl border border-steel-line bg-navy/50 p-5">
          <p className="text-xs uppercase tracking-wider text-fog">
            What you submitted
          </p>
          <p className="mt-2 text-sm leading-relaxed text-mist">{app.note}</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Link
          href={`/work/${app.jobId}`}
          className="inline-flex items-center gap-2 rounded-lg border border-steel-line px-5 py-2.5 text-sm font-semibold text-chrome hover:border-blue-500/60"
        >
          View the role
        </Link>
        <Link
          href="/work"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-300 hover:text-blue-400"
        >
          Browse more jobs <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
