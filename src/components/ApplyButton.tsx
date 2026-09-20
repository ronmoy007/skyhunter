"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { Check, Spinner } from "./icons";
import { trackJobApplicationConversion } from "@/lib/gtag";

export function ApplyButton({
  jobId,
  jobTitle,
}: {
  jobId: string;
  jobTitle: string;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const authed = !!user;
  // null = not yet resolved (auth still loading, or applied-state not fetched).
  const [applied, setApplied] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [address, setAddress] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState("");
  const [link, setLink] = useState("");

  // Close the dialog on Escape.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Resolve whether this member has already applied, once auth is known.
  // Guests/admins never apply, so mark them resolved as "not applied".
  useEffect(() => {
    if (loading) return;
    if (!user || user.isAdmin) {
      setApplied(false);
      return;
    }
    let cancelled = false;
    fetch(`/api/apply?jobId=${encodeURIComponent(jobId)}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled) setApplied(!!j.applied);
      })
      .catch(() => {
        if (!cancelled) setApplied(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loading, user, jobId]);

  // While auth (and applied-state for members) is resolving, show a disabled
  // placeholder so the button doesn't flash between states.
  if (loading || applied === null) {
    return (
      <span
        aria-hidden="true"
        className="inline-block rounded-lg bg-blue-500/60 px-8 py-3.5 font-semibold text-white/80"
      >
        Apply Now
      </span>
    );
  }

  // Signed-out visitors are prompted to sign up (carrying the role along).
  if (!authed) {
    return (
      <Link
        href={`/signup?role=${encodeURIComponent(jobTitle)}`}
        className="inline-block rounded-lg bg-blue-500 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-blue-400"
      >
        Sign up to apply
      </Link>
    );
  }

  // Admins manage roles — they can't apply to them.
  if (user?.isAdmin) {
    return (
      <p className="rounded-lg border border-steel-line bg-navy/50 px-6 py-3.5 text-sm font-medium text-fog">
        Admin accounts can&apos;t pitch for projects.
      </p>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          fullName,
          email,
          address,
          linkedinUrl,
          expectedSalary,
          note,
          phone,
          link
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Couldn't submit.");
      setApplied(true);
      setOpen(false);
      trackJobApplicationConversion(jobTitle);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function withdraw() {
    setBusy(true);
    await fetch("/api/apply", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    });
    setBusy(false);
    setApplied(false);
    router.refresh();
  }

  if (applied) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-lg bg-green-500/15 px-6 py-3.5 font-semibold text-green-500 ring-1 ring-green-500/30">
          <Check className="h-5 w-5" /> Application submitted
        </span>
        <button
          onClick={withdraw}
          disabled={busy}
          className="rounded-lg border border-steel-line px-5 py-3.5 text-sm font-medium text-mist transition-colors hover:text-chrome disabled:opacity-60"
        >
          Withdraw application
        </button>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-steel-line bg-void px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-chrome outline-none transition-colors placeholder:text-faint focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-1";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-blue-500 px-8 py-3.5 font-semibold text-white transition-colors hover:bg-blue-400 active:bg-blue-600"
      >
        Apply Now
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-chrome/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="lift relative w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl border-t sm:border border-steel-line bg-void p-6 sm:p-8 text-left shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-fog hover:text-chrome"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="mb-6 sm:mb-8 pr-6">
              <h2 className="font-display text-xl sm:text-2xl font-semibold text-chrome">
                Apply for {jobTitle}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-mist">
                Tell us about your experience and why you're interested in this role. We're reviewing this as{" "}
                <span className="font-medium text-blue-300 text-xs sm:text-sm break-all">{user?.email}</span>.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="apply-fullname"
                    className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-chrome"
                  >
                    Full Name
                  </label>
                  <input
                    id="apply-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputCls}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label
                    htmlFor="apply-email"
                    className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-chrome"
                  >
                    Email
                  </label>
                  <input
                    id="apply-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="apply-phone"
                    className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-chrome"
                  >
                    Phone <span className="font-normal text-fog text-xs">(optional)</span>
                  </label>
                  <input
                    id="apply-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputCls}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label
                    htmlFor="apply-salary"
                    className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-chrome"
                  >
                    Expected Monthly Salary{" "}
                    <span className="font-normal text-fog text-xs">(optional)</span>
                  </label>
                  <input
                    id="apply-salary"
                    type="number"
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                    className={inputCls}
                    placeholder="5000"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="apply-address"
                  className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-chrome"
                >
                  Address <span className="font-normal text-fog text-xs">(optional)</span>
                </label>
                <textarea
                  id="apply-address"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputCls}
                  placeholder="Street address, city, state, country, postal code"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="apply-linkedin"
                    className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-chrome"
                  >
                    LinkedIn URL{" "}
                    <span className="font-normal text-fog text-xs">(optional)</span>
                  </label>
                  <input
                    id="apply-linkedin"
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className={inputCls}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div>
                  <label
                    htmlFor="apply-link"
                    className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-chrome"
                  >
                    Portfolio / Website{" "}
                    <span className="font-normal text-fog text-xs">(optional)</span>
                  </label>
                  <input
                    id="apply-link"
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className={inputCls}
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="apply-note"
                  className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-chrome"
                >
                  Cover Letter / Background
                </label>
                <p className="mb-2 sm:mb-3 text-xs text-fog">
                  Tell us about your relevant experience, key skills, and why this role excites you.
                </p>
                <textarea
                  id="apply-note"
                  required
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={inputCls}
                  placeholder="Share your professional background, achievements, and what drew you to this opportunity..."
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-300/50 bg-red-500/10 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-red-400">
                  <p className="font-medium">Error submitting application</p>
                  <p className="mt-1 text-xs">{error}</p>
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 sm:gap-3 border-t border-steel-line pt-4 sm:pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-steel-line px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-mist transition-colors hover:border-steel-line hover:bg-void/50 hover:text-chrome active:bg-void"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-blue-400 active:bg-blue-600 disabled:opacity-60 min-h-[44px] sm:min-h-auto"
                >
                  {busy && <Spinner className="h-4 w-4" />}
                  {busy ? "Submitting…" : "Submit application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
