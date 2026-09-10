"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/icons";

type Connection = { name: string; headline: string; avatarUrl: string };

type Member = {
  name: string;
  avatarUrl: string;
  headline: string;
  summary: string;
  skills: string[];
  previousRole: string;
  desiredRole: string;
  industry: string;
  experienceYears: string;
  availability: string;
  workPreference: string;
  location: string;
  website: string;
  linkedinUrl: string;
  githubUrl: string;
  memberSince: string;
};

const AVATAR_COLORS = [
  "bg-[#8710d8]",
  "bg-[#2aa79b]",
  "bg-[#e17076]",
  "bg-[#3c8ce7]",
  "bg-[#e6a04c]",
  "bg-[#6bc86b]",
];
function colorFor(s: string): string {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function initialsOf(name: string): string {
  return (
    name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"
  );
}

function Avatar({
  name,
  url,
  seed,
  size,
  ring,
}: {
  name: string;
  url: string;
  seed: string;
  size: string;
  ring?: boolean;
}) {
  const ringCls = ring ? "ring-4 ring-navy shadow-sm" : "";
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={url}
        alt={name}
        className={`${size} ${ringCls} shrink-0 rounded-full object-cover`}
      />
    );
  }
  return (
    <span
      className={`${size} ${ringCls} flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${colorFor(seed)}`}
    >
      {initialsOf(name)}
    </span>
  );
}

export function MemberProfileModal({
  email,
  onClose,
}: {
  email: string;
  onClose: () => void;
}) {
  const [member, setMember] = useState<Member | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(
          `/api/members?email=${encodeURIComponent(email)}`,
          { cache: "no-store" },
        );
        const json = await res.json();
        if (!alive) return;
        if (json.ok) {
          setMember(json.member);
          setConnections(json.connections ?? []);
        } else {
          setError(
            res.status === 403
              ? "You don't have access to this profile."
              : "Couldn't load this profile.",
          );
        }
      } catch {
        if (alive) setError("Couldn't load this profile.");
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [email]);

  // Close on Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const details = member
    ? [
        { l: "Target role", v: member.desiredRole },
        { l: "Most recent role", v: member.previousRole },
        { l: "Industry", v: member.industry },
        { l: "Experience", v: member.experienceYears },
        { l: "Availability", v: member.availability },
        { l: "Work preference", v: member.workPreference },
        { l: "Location", v: member.location },
      ].filter((r) => r.v)
    : [];

  const links = member
    ? [
        { l: "Portfolio", href: member.website },
        { l: "LinkedIn", href: member.linkedinUrl },
        { l: "GitHub", href: member.githubUrl },
      ].filter((x) => x.href)
    : [];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={member ? `${member.name}'s profile` : "Member profile"}
        onClick={(e) => e.stopPropagation()}
        className="lift my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-steel-line bg-navy shadow-2xl"
      >
        {!loaded ? (
          <div className="relative">
            <CloseButton onClose={onClose} plain />
            <div className="flex justify-center py-20 text-fog">
              <Spinner className="h-6 w-6" />
            </div>
          </div>
        ) : error ? (
          <div className="relative">
            <CloseButton onClose={onClose} plain />
            <p className="px-6 py-16 text-center text-sm text-fog">{error}</p>
          </div>
        ) : member ? (
          <div className="max-h-[85vh] overflow-y-auto">
            {/* Cover + overlapping avatar */}
            <div className="relative h-28 bg-gradient-to-br from-[#a435f0] via-[#8710d8] to-[#6d28d9]">
              <CloseButton onClose={onClose} />
              <div className="absolute -bottom-9 left-6">
                <Avatar
                  name={member.name}
                  url={member.avatarUrl}
                  seed={member.name}
                  size="h-[4.5rem] w-[4.5rem] text-2xl"
                  ring
                />
              </div>
            </div>

            <div className="px-6 pb-6 pt-12">
              {/* Identity */}
              <h2 className="font-display text-xl font-semibold leading-tight text-chrome">
                {member.name}
              </h2>
              {member.headline && (
                <p className="mt-1 text-sm text-mist">{member.headline}</p>
              )}
              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fog">
                <span className="inline-flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                    <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  Member since {member.memberSince}
                </span>
                {member.location && (
                  <>
                    <span className="text-faint">·</span>
                    <span className="inline-flex items-center gap-1.5">
                      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                        <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                        <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" />
                      </svg>
                      {member.location}
                    </span>
                  </>
                )}
              </p>

              {/* Summary */}
              {member.summary && (
                <p className="mt-4 text-sm leading-relaxed text-mist">
                  {member.summary}
                </p>
              )}

              {/* Skills */}
              {!!member.skills.length && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {member.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-steel px-3 py-1 text-xs font-medium text-blue-300 ring-1 ring-steel-line"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Detail cells */}
              {!!details.length && (
                <dl className="mt-5 grid gap-2.5 sm:grid-cols-2">
                  {details.map((r) => (
                    <div
                      key={r.l}
                      className="rounded-xl border border-steel-line bg-steel/50 px-4 py-2.5"
                    >
                      <dt className="text-[0.68rem] font-semibold uppercase tracking-wide text-fog">
                        {r.l}
                      </dt>
                      <dd className="mt-0.5 text-sm font-medium text-chrome">
                        {r.v}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              {/* Links */}
              {!!links.length && (
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {links.map((x) => (
                    <a
                      key={x.l}
                      href={x.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-steel-line px-3 py-1.5 text-sm font-medium text-chrome transition-colors hover:border-blue-400 hover:text-blue-300"
                    >
                      {x.l}
                      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                        <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  ))}
                </div>
              )}

              {/* Connections */}
              <div className="mt-6 border-t border-steel-line pt-5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-chrome">
                    Connections
                  </h3>
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-steel px-1.5 text-xs font-semibold text-blue-300">
                    {connections.length}
                  </span>
                </div>
                {connections.length === 0 ? (
                  <p className="mt-3 text-sm text-fog">No connections yet.</p>
                ) : (
                  <ul className="mt-3 space-y-1">
                    {connections.map((c, i) => (
                      <li key={`${c.name}-${i}`}>
                        <div className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-navy-soft">
                          <Avatar
                            name={c.name}
                            url={c.avatarUrl}
                            seed={c.name}
                            size="h-10 w-10 text-sm"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-chrome">
                              {c.name}
                            </p>
                            {c.headline && (
                              <p className="truncate text-xs text-fog">
                                {c.headline}
                              </p>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CloseButton({
  onClose,
  plain,
}: {
  onClose: () => void;
  plain?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close"
      className={
        plain
          ? "absolute right-3 top-3 z-10 rounded-full p-1.5 text-fog transition-colors hover:bg-navy-soft hover:text-chrome"
          : "absolute right-3 top-3 z-10 rounded-full bg-white/20 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
      }
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
