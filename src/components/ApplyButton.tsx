"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { Check, Spinner } from "./icons";

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
        Pitch for this project
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
        Sign up to pitch
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
        body: JSON.stringify({ jobId, note, phone, link }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Couldn't submit.");
      setApplied(true);
      setOpen(false);
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
        <span className="inline-flex items-center gap-2 rounded-lg bg-cyan/10 px-6 py-3.5 font-semibold text-cyan ring-1 ring-cyan/30">
          <Check className="h-5 w-5" /> Pitched
        </span>
        <button
          onClick={withdraw}
          disabled={busy}
          className="rounded-lg border border-steel-line px-5 py-3.5 text-sm font-medium text-mist transition-colors hover:text-chrome disabled:opacity-60"
        >
          Withdraw
        </button>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-steel-line bg-void px-3.5 py-2.5 text-sm text-chrome outline-none transition-colors placeholder:text-faint focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-blue-500 px-8 py-3.5 font-semibold text-white transition-colors hover:bg-blue-400"
      >
        Pitch for this project
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-chrome/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="lift relative w-full max-w-md rounded-2xl border border-steel-line bg-void p-6 text-left">
            <h3 className="font-display text-xl font-semibold text-chrome">
              Pitch for {jobTitle}
            </h3>
            <p className="mt-1 text-sm text-fog">
              A few details help the client size you up. Pitching as{" "}
              <span className="font-medium text-mist">{user?.email}</span>.
            </p>

            <form onSubmit={submit} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="apply-note"
                  className="mb-1.5 block text-sm font-medium text-mist"
                >
                  Your pitch
                </label>
                <textarea
                  id="apply-note"
                  required
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={inputCls}
                  placeholder="How you'd approach this build, your relevant stack, and similar agents you've shipped…"
                />
              </div>
              <div>
                <label
                  htmlFor="apply-link"
                  className="mb-1.5 block text-sm font-medium text-mist"
                >
                  Portfolio / past work link{" "}
                  <span className="text-faint">(optional)</span>
                </label>
                <input
                  id="apply-link"
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className={inputCls}
                  placeholder="https://…"
                />
              </div>
              <div>
                <label
                  htmlFor="apply-phone"
                  className="mb-1.5 block text-sm font-medium text-mist"
                >
                  Phone <span className="text-faint">(optional)</span>
                </label>
                <input
                  id="apply-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputCls}
                  placeholder="+1 555 123 4567"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-steel-line px-4 py-2.5 text-sm font-medium text-mist transition-colors hover:text-chrome"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex min-w-[9rem] items-center justify-center gap-2 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-400 disabled:opacity-60"
                >
                  {busy && <Spinner className="h-4 w-4" />}
                  {busy ? "Submitting…" : "Submit pitch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
