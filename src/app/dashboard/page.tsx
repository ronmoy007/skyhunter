import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession, findUser, isAdminUser } from "@/lib/auth";
import { applicationsByUser, introsByUser, notifyUnread } from "@/lib/store";
import { STATUS_BADGE, formatSchedule } from "@/lib/requests";
import { collectionGet } from "@/lib/cache";
import { listJobs } from "@/lib/jobs-data";
import {
  PARTNERS as SEED_PARTNERS,
  INCOME_PATHS,
  INCOME_INTRO,
} from "@/lib/community";
import { JobCard } from "@/components/JobCard";
import { IntroButton } from "@/components/IntroButton";
import { TourGuide, type TourStep } from "@/components/TourGuide";
import { UnreadCount } from "@/components/UnreadCount";
import { ArrowRight, Spark, Users, Briefcase, Book } from "@/components/icons";

const INCOME_ICONS: Record<
  string,
  (p: { className?: string }) => React.ReactElement
> = {
  spark: Spark,
  users: Users,
  briefcase: Briefcase,
  book: Book,
};

const accentDot: Record<string, string> = {
  clay: "bg-blue-500",
  sage: "bg-cyan",
  sky: "bg-blue-400",
};

const TOUR: TourStep[] = [
  {
    selector: '[data-tour="tour-welcome"]',
    title: "Welcome aboard",
    body: "This is your dashboard — your home base for building AI agents and winning client projects. Here's a quick one-time walkthrough to get you started.",
  },
  {
    selector: '[data-tour="tour-nav"]',
    title: "Find your way around",
    body: "Jump between the Community, Projects, Playbooks, Case studies, and Resources from up here anytime.",
  },
  {
    selector: '[data-tour="tour-notifications"]',
    title: "Stay in the loop",
    body: "Your notifications live here — new sign-ins, project updates, and call confirmations.",
  },
  {
    selector: '[data-tour="tour-account"]',
    title: "Your account",
    body: "Open this menu for your profile and to sign out. Admins reach the control panel here too.",
  },
  {
    selector: '[data-tour="tour-stats"]',
    title: "Your snapshot",
    body: "A quick read on your project pitches, how complete your profile is, and unread notifications.",
  },
  {
    selector: '[data-tour="tour-income"]',
    title: "Ways your agency earns",
    body: "Real ways members make money building agents: per-build fees, monthly retainers, white-label products, and productized services.",
  },
  {
    selector: '[data-tour="tour-contracts"]',
    title: "Client leads & mentors",
    body: "Vetted clients and expert mentors who bring paid agent builds — members typically charge $5K–$25K per build. Tap 'Book a call' to get started with the SkyHunter team.",
  },
  {
    selector: '[data-tour="tour-applications"]',
    title: "Track your requests",
    body: "Every call you book and project you pitch shows up here with its live status, so you always know where you stand.",
  },
  {
    selector: '[data-tour="tour-profile"]',
    title: "Complete your profile",
    body: "A fuller profile means better matches. Add your photo, your stack, and a social account to stand out.",
  },
];

export const metadata: Metadata = { title: "Dashboard · SkyHunter" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/signin");
  const user = await findUser(session.email);
  if (!user) redirect("/signin");
  const admin = isAdminUser(user);

  const [applications, interviews, unread, jobs, partners] = await Promise.all([
    applicationsByUser(user.email),
    introsByUser(user.email),
    notifyUnread(user.email),
    listJobs(),
    collectionGet("partners", SEED_PARTNERS),
  ]);

  const first = user.name.split(" ")[0];

  // Partners this member has already requested an interview with (one per partner).
  const requestedPartners = new Set(
    interviews.map((i) => i.partner.trim().toLowerCase()),
  );

  // Profile completion (same items as the profile page).
  const p = user.profile;
  const items = [
    !!p.avatarUrl,
    !!p.headline,
    !!p.summary,
    !!p.skills?.length,
    !!p.previousRole,
    !!p.desiredRole,
    !!p.industry,
    !!p.availability,
    !!p.location,
    !!(p.website || p.linkedinUrl || p.connections?.includes("linkedin")),
  ];
  const pct = Math.round((items.filter(Boolean).length / items.length) * 100);

  const appliedIds = new Set(applications.map((a) => a.jobId));
  const recommended = jobs.filter((j) => !appliedIds.has(j.id)).slice(0, 3);

  const tiles: { n: React.ReactNode; l: string }[] = [
    { n: applications.length, l: "Project pitches" },
    { n: `${pct}%`, l: "Profile complete" },
    { n: <UnreadCount initial={unread} />, l: "Unread notifications" },
  ];

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-12">
      <TourGuide
        steps={TOUR}
        storageKey={`skyhunter_tour_dashboard:${user.email}`}
        auto={!user.profile.tourSeen}
        markSeenUrl="/api/tour"
      />

      <div
        data-tour="tour-welcome"
        className="flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
            Dashboard
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-chrome">
            Welcome back, {first}
          </h1>
        </div>
        <Link
          href="/profile"
          data-tour="tour-profile"
          className="rounded-lg border border-steel-line px-4 py-2 text-sm font-semibold text-chrome transition-colors hover:border-blue-500/60"
        >
          Edit profile
        </Link>
      </div>

      {/* Stat tiles */}
      <dl data-tour="tour-stats" className="mt-6 grid grid-cols-3 gap-4">
        {tiles.map((t) => (
          <div key={t.l} className="rounded-2xl border border-steel-line bg-navy p-5">
            <dt className="font-display text-3xl font-semibold text-chrome">
              {t.n}
            </dt>
            <dd className="mt-1 text-xs text-fog">{t.l}</dd>
          </div>
        ))}
      </dl>

      {/* Extra income — ways to earn again after AI reshaped your work */}
      <div data-tour="tour-income" className="mt-10">
        <div className="max-w-2xl">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
            {INCOME_INTRO.eyebrow}
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-chrome">
            {INCOME_INTRO.title}
          </h2>
          <p className="mt-1 text-sm text-mist">{INCOME_INTRO.body}</p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INCOME_PATHS.map((path) => {
            const Icon = INCOME_ICONS[path.icon];
            return (
              <div
                key={path.title}
                className="flex h-full flex-col rounded-2xl border border-steel-line bg-navy p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                    {Icon && <Icon className="h-5 w-5" />}
                  </span>
                  <span className="rounded-md bg-cyan/10 px-2 py-0.5 text-xs font-semibold text-cyan ring-1 ring-cyan/25">
                    {path.earn}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-base font-semibold text-chrome">
                  {path.title}
                </h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-mist">
                  {path.body}
                </p>
                <p className="mt-3 text-xs font-medium text-fog">
                  {path.effort}
                </p>
                <Link
                  href={path.href}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-300 hover:text-blue-400"
                >
                  {path.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contracts from our network — the core offer */}
      <div
        data-tour="tour-contracts"
        className="mt-10 overflow-hidden rounded-2xl border border-blue-500/30 bg-blue-500/5"
      >
        <div className="border-b border-blue-500/20 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">
                Client leads &amp; mentors
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-chrome">
                Get matched with paid agent builds &amp; expert mentors
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-mist">
                Our community connects you directly with vetted clients and
                seasoned builders who bring real, paid agent projects — members
                typically charge <span className="font-semibold text-chrome">$5K–$25K per build</span>.
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-px bg-steel-line/60 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((p) => (
            <div key={p.name} className="flex h-full flex-col bg-navy p-5">
              <div className="flex items-center gap-3">
                {p.photo ? (
                  <Image
                    src={p.photo}
                    alt={p.name}
                    width={44}
                    height={44}
                    className="h-11 w-11 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${accentDot[p.accent] ?? "bg-blue-500"}`}
                  >
                    {p.initials}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold text-chrome">{p.name}</p>
                  <p className="truncate text-xs text-blue-300">{p.role}</p>
                  <p className="truncate text-xs text-fog">{p.company}</p>
                </div>
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-mist">
                {p.offer}
              </p>
              <div className="mt-4">
                {admin ? (
                  <span className="text-xs text-fog">
                    Manage interview requests in the admin panel.
                  </span>
                ) : (
                  <IntroButton
                    partner={p.name}
                    role={p.role}
                    requested={requestedPartners.has(p.name.trim().toLowerCase())}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Your requests — interviews + applications, with live status */}
      <div data-tour="tour-applications" className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-chrome">
            Your requests
          </h2>
          {interviews.length + applications.length > 0 && (
            <Link
              href="/requests"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-300 hover:text-blue-400"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {interviews.length + applications.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-steel-line bg-navy/40 p-8 text-center">
            <p className="text-mist">
              You haven&apos;t booked a call or pitched a project yet.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link
                href="/work"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-400"
              >
                Browse projects <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/book-a-call"
                className="inline-flex items-center gap-2 rounded-lg border border-steel-line px-5 py-2.5 text-sm font-semibold text-chrome hover:border-blue-500/60"
              >
                Book a call
              </Link>
            </div>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-steel-line overflow-hidden rounded-2xl border border-steel-line">
            {interviews.slice(0, 3).map((iv) => (
              <li key={`iv-${iv.id}`}>
                <Link
                  href={`/requests/interview/${iv.id}`}
                  className="flex items-center justify-between gap-4 bg-navy/50 px-5 py-4 transition-colors hover:bg-abyss"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-chrome">
                      {iv.partner && iv.partner !== "SkyHunter interview"
                        ? `Call · ${iv.partner}`
                        : "Build call with the SkyHunter team"}
                    </p>
                    <p className="text-xs text-fog">
                      {iv.scheduledAt ? (
                        <span className="font-semibold text-amber-600">
                          Scheduled · {formatSchedule(iv.scheduledAt)}
                        </span>
                      ) : (
                        <>
                          Interview ·{" "}
                          {new Date(iv.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${
                        STATUS_BADGE[iv.status] ?? "bg-steel text-fog"
                      }`}
                    >
                      {iv.status}
                    </span>
                    <ArrowRight className="h-4 w-4 text-fog" />
                  </div>
                </Link>
              </li>
            ))}
            {applications.slice(0, 3).map((a) => (
              <li key={`app-${a.id}`}>
                <Link
                  href={`/requests/application/${a.id}`}
                  className="flex items-center justify-between gap-4 bg-navy/50 px-5 py-4 transition-colors hover:bg-abyss"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-chrome">
                      {a.jobTitle || a.jobId}
                    </p>
                    <p className="text-xs text-fog">
                      Application ·{" "}
                      {new Date(a.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${
                        STATUS_BADGE[a.status] ?? "bg-steel text-fog"
                      }`}
                    >
                      {a.status}
                    </span>
                    <ArrowRight className="h-4 w-4 text-fog" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recommended jobs */}
      {recommended.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-chrome">
              Projects for you
            </h2>
            <Link
              href="/work"
              className="text-sm font-semibold text-blue-300 hover:text-blue-400"
            >
              See all →
            </Link>
          </div>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
