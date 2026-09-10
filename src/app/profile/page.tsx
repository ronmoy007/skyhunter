import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession, findUser } from "@/lib/auth";
import { ProfileForm } from "@/components/ProfileForm";
import { SignOutButton } from "@/components/SignOutButton";
import { AvatarUploader } from "@/components/AvatarUploader";
import { Check } from "@/components/icons";

export const metadata: Metadata = {
  title: "Your profile · SkyHunter",
  description: "View and edit your SkyHunter profile.",
};

export const dynamic = "force-dynamic";

const providerLabel: Record<string, string> = {
  google: "Google",
  linkedin: "LinkedIn",
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/signin");
  const user = await findUser(session.email);
  if (!user) redirect("/signin");

  const sp = await searchParams;

  const initials =
    user.name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const signedUpWith = user.provider
    ? providerLabel[user.provider] ?? user.provider
    : "Email & password";

  const connections = user.profile.connections ?? [];

  const p = user.profile;

  // Profile completion checklist.
  const items = [
    { label: "Upload a profile photo", done: !!p.avatarUrl },
    { label: "Write a professional headline", done: !!p.headline },
    { label: "Add an 'About you' summary", done: !!p.summary },
    { label: "List your skills", done: !!p.skills?.length },
    { label: "Add your most recent role", done: !!p.previousRole },
    { label: "Set a target role", done: !!p.desiredRole },
    { label: "Choose your industry", done: !!p.industry },
    { label: "Set your availability", done: !!p.availability },
    { label: "Add your location", done: !!p.location },
    { label: "Add a portfolio or LinkedIn link", done: !!(p.website || p.linkedinUrl || connections.includes("linkedin")) },
  ];
  const doneCount = items.filter((i) => i.done).length;
  const pct = Math.round((doneCount / items.length) * 100);

  return (
    <section className="mx-auto max-w-3xl px-5 py-14">
      {(sp.connected || sp.error) && (
        <div
          className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
            sp.error
              ? "border-red-300 bg-red-50 text-red-700"
              : "border-cyan/30 bg-cyan/5 text-cyan"
          }`}
        >
          {sp.error
            ? sp.error
            : `${providerLabel[sp.connected ?? ""] ?? sp.connected} connected.`}
        </div>
      )}

      {/* Header + avatar */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <AvatarUploader
          initialUrl={user.profile.avatarUrl ?? ""}
          initials={initials}
        />
        <div className="text-sm sm:text-right">
          <p className="font-display text-lg font-semibold text-chrome">
            {user.name}
          </p>
          <p className="text-fog">{user.email}</p>
          <div className="mt-2 flex flex-wrap gap-2 sm:justify-end">
            <span className="rounded-md bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300 ring-1 ring-blue-500/25">
              {signedUpWith}
            </span>
            {connections
              .filter(
                (c) =>
                  (c === "google" || c === "linkedin") && c !== user.provider,
              )
              .map((c) => (
                <span
                  key={c}
                  className="rounded-md bg-cyan/10 px-2.5 py-1 text-xs font-medium text-cyan ring-1 ring-cyan/30"
                >
                  {providerLabel[c] ?? c} connected
                </span>
              ))}
            <span className="rounded-md bg-steel px-2.5 py-1 text-xs font-medium text-mist">
              Since {memberSince}
            </span>
          </div>
        </div>
      </div>

      {/* Professional snapshot — what an employer sees at a glance. */}
      {(p.headline ||
        p.summary ||
        p.skills?.length ||
        p.desiredRole ||
        p.experienceYears ||
        p.availability ||
        p.workPreference ||
        p.desiredSalary ||
        p.website ||
        p.linkedinUrl ||
        p.githubUrl) && (
        <div className="mt-8 rounded-2xl border border-steel-line bg-navy p-6">
          {p.headline && (
            <p className="font-display text-lg font-semibold text-chrome">
              {p.headline}
            </p>
          )}
          {p.summary && (
            <p className="mt-2 text-sm leading-relaxed text-mist">{p.summary}</p>
          )}

          {!!p.skills?.length && (
            <div className="mt-4 flex flex-wrap gap-2">
              {p.skills.map((s) => (
                <span
                  key={s}
                  className="rounded-md bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300 ring-1 ring-blue-500/25"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {(p.desiredRole ||
            p.experienceYears ||
            p.availability ||
            p.workPreference ||
            p.desiredSalary) && (
            <dl className="mt-5 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {[
                { l: "Target role", v: p.desiredRole },
                { l: "Experience", v: p.experienceYears },
                { l: "Availability", v: p.availability },
                { l: "Work preference", v: p.workPreference },
                { l: "Desired pay", v: p.desiredSalary },
              ]
                .filter((r) => r.v)
                .map((r) => (
                  <div key={r.l} className="flex justify-between gap-4">
                    <dt className="text-fog">{r.l}</dt>
                    <dd className="text-right font-medium text-chrome">{r.v}</dd>
                  </div>
                ))}
            </dl>
          )}

          {(p.website || p.linkedinUrl || p.githubUrl) && (
            <div className="mt-5 flex flex-wrap gap-3 border-t border-steel-line pt-4">
              {[
                { l: "Portfolio", href: p.website },
                { l: "LinkedIn", href: p.linkedinUrl },
                { l: "GitHub", href: p.githubUrl },
              ]
                .filter((x) => x.href)
                .map((x) => (
                  <a
                    key={x.l}
                    href={x.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-steel-line px-3 py-1.5 text-sm font-medium text-chrome transition-colors hover:border-blue-500/60"
                  >
                    {x.l}
                  </a>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Completion meter */}
      <div className="mt-6 rounded-2xl border border-steel-line bg-navy p-6">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-lg font-semibold text-chrome">
            Profile completion
          </h2>
          <span className="font-display text-2xl font-semibold text-blue-300">
            {pct}%
          </span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-steel">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {items.map((i) => (
            <li
              key={i.label}
              className={`flex items-center gap-2 text-sm ${
                i.done ? "text-fog line-through" : "text-mist"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  i.done ? "bg-blue-500 text-white" : "border border-steel-line"
                }`}
              >
                {i.done && <Check className="h-2.5 w-2.5" />}
              </span>
              {i.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Editable details */}
      <div className="mt-6">
        <h2 className="font-display text-lg font-semibold text-chrome">
          Your details
        </h2>
        <div className="mt-4 rounded-2xl border border-steel-line bg-navy p-6">
          <ProfileForm
            initial={{
              name: user.name,
              previousRole: p.previousRole,
              industry: p.industry,
              situation: p.situation,
              location: p.location,
              headline: p.headline ?? "",
              summary: p.summary ?? "",
              skills: (p.skills ?? []).join(", "),
              experienceYears: p.experienceYears ?? "",
              desiredRole: p.desiredRole ?? "",
              workPreference: p.workPreference ?? "",
              availability: p.availability ?? "",
              desiredSalary: p.desiredSalary ?? "",
              phone: p.phone ?? "",
              website: p.website ?? "",
              linkedinUrl: p.linkedinUrl ?? "",
              githubUrl: p.githubUrl ?? "",
            }}
          />
        </div>
      </div>

      {/* Account actions */}
      <div className="mt-6 flex items-center justify-between rounded-2xl border border-steel-line bg-abyss p-6">
        <div>
          <p className="font-semibold text-chrome">Account</p>
          <p className="text-sm text-fog">Signed in as {user.email}</p>
        </div>
        <SignOutButton />
      </div>
    </section>
  );
}
