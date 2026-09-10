"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Select } from "./Select";
import { LocationPicker } from "./LocationPicker";
import { HumanCheck } from "./HumanCheck";
import { PasswordField } from "./PasswordField";
import { OAuthButtons } from "./OAuthButtons";
import { useAuth } from "./AuthProvider";
import { isStrongPassword } from "@/lib/password";
import { IS_DEV } from "@/lib/flags";
import { Spinner, Check } from "@/components/icons";

// Labeled group with a hairline, so the long form reads as digestible sections.
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pt-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-fog">
          {title}
        </span>
        <span className="h-px flex-1 bg-steel-line" />
      </div>
      {children}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-500 text-[0.65rem] font-bold text-white">
        !
      </span>
      <span>{message}</span>
    </p>
  );
}

const SITUATIONS = [
  "My role was eliminated by AI/automation",
  "My role changed a lot because of AI",
  "I'm worried my role is next",
  "Just exploring what's out there",
];

const INDUSTRIES = [
  "Writing / Media / Marketing",
  "Customer Support / Call Center",
  "Finance / Accounting / Admin",
  "Software / Data / IT",
  "Design / Creative",
  "Operations / Logistics",
  "Education / Training",
  "Healthcare / Care",
  "Skilled Trades",
  "Other",
];

type Status = "idle" | "submitting" | "error";

const inputClass =
  "w-full rounded-xl border border-steel-line bg-void px-4 py-3 text-chrome outline-none transition-colors placeholder:text-faint focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
const labelClass = "mb-1.5 block text-sm font-medium text-mist";

export function SignUpForm({
  google = false,
  linkedin = false,
}: {
  google?: boolean;
  linkedin?: boolean;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const { refresh } = useAuth();

  const [step, setStep] = useState<"form" | "verify">("form");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  // verify-step state
  const [pendingEmail, setPendingEmail] = useState("");
  const [devCode, setDevCode] = useState("");
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState("");

  // Step 1 — submit details, receive a code by email.
  async function handleDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    const data = Object.fromEntries(new FormData(e.currentTarget).entries());

    // Bot check: honeypot must be empty and the human box must be verified.
    if (String(data.hp_check ?? "").trim()) {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
      return;
    }
    if (data.human !== "verified") {
      setStatus("error");
      setMessage("Please complete the 'Verify you are human' check.");
      return;
    }
    // Strong-password gate (also enforced on the server).
    if (!isStrongPassword(String(data.password ?? ""))) {
      setStatus("error");
      setMessage("Please choose a stronger password (see the requirements).");
      return;
    }
    // Location fields are custom controls, so validate them here.
    if (!String(data.street ?? "").trim()) {
      setStatus("error");
      setMessage("Please complete your location (country, street, city).");
      return;
    }
    if (!String(data.city ?? "").trim()) {
      setStatus("error");
      setMessage("Please enter your city.");
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Something went wrong.");
      }

      // Dev mode: the account was created immediately (no email verification).
      if (!json.pending) {
        await refresh();
        router.push("/dashboard?signup=1");
        router.refresh();
        return;
      }

      // Prod: move to the 6-digit code step.
      setPendingEmail(String(data.email ?? ""));
      setDevCode(json.devCode ?? "");
      setCode("");
      setNotice("");
      setStatus("idle");
      setStep("verify");
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : "We couldn't create your account.",
      );
    }
  }

  // Step 2 — verify the 6-digit code, which creates the account.
  async function runVerify(theCode: string) {
    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, code: theCode }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Verification failed.");
      }
      await refresh(); // now signed in
      router.push("/dashboard?signup=1");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : "We couldn't verify that code.",
      );
    }
  }

  function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    runVerify(code);
  }

  async function handleResend() {
    setStatus("idle");
    setMessage("");
    setNotice("");
    try {
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Couldn't resend the code.");
      }
      if (json.devCode) setDevCode(json.devCode);
      setNotice("A new code is on its way.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Couldn't resend the code.");
    }
  }

  // ---- Step 2: verify --------------------------------------------------
  if (step === "verify") {
    return (
      <form onSubmit={handleVerify} className="space-y-5">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-chrome">
            Check your email
          </h2>
          <p className="mt-1 text-sm text-fog">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-mist">{pendingEmail}</span>. Enter it
            below to finish creating your account.
          </p>
        </div>

        {devCode && (
          <p className="rounded-lg border border-blue-500/30 bg-blue-500/5 px-4 py-3 text-sm text-blue-600">
            Dev mode (no email provider configured): your code is{" "}
            <span className="font-semibold tracking-widest">{devCode}</span>.
          </p>
        )}

        <div>
          <label htmlFor="code" className={labelClass}>
            Verification code
          </label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            autoFocus
            value={code}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 6);
              setCode(v);
              if (status === "error") setStatus("idle");
              // Auto-submit the moment all six digits are in (incl. paste).
              if (v.length === 6 && status !== "submitting") runVerify(v);
            }}
            placeholder="••••••"
            className={`${inputClass} text-center text-2xl font-semibold tracking-[0.5em]`}
          />
          <p className="mt-1.5 text-xs text-faint">
            Can&apos;t find it? Check your spam folder.
          </p>
        </div>

        {notice && (
          <p className="flex items-center gap-1.5 text-sm text-cyan">
            <Check className="h-4 w-4" /> {notice}
          </p>
        )}
        {status === "error" && <ErrorBanner message={message} />}

        <button
          type="submit"
          disabled={status === "submitting" || code.length !== 6}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" && <Spinner className="h-4 w-4" />}
          {status === "submitting" ? "Verifying…" : "Verify & create account"}
        </button>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={handleResend}
            className="font-medium text-blue-300 hover:text-blue-400"
          >
            Resend code
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("form");
              setStatus("idle");
              setMessage("");
            }}
            className="text-fog transition-colors hover:text-chrome"
          >
            ← Use a different email
          </button>
        </div>
      </form>
    );
  }

  // ---- Step 1: details -------------------------------------------------
  return (
    <form onSubmit={handleDetails} className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-chrome">
          Create your account
        </h2>
        <p className="mt-1 text-sm text-fog">
          Already have one?{" "}
          <Link href="/signin" className="font-medium text-blue-300 hover:text-blue-400">
            Sign in
          </Link>
        </p>
      </div>

      <OAuthButtons action="Sign up" google={google} linkedin={linkedin} />

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className={labelClass}>
            Full name
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            placeholder="Your name"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@email.com"
            defaultValue={params.get("email") ?? ""}
            className={inputClass}
          />
        </div>

        <PasswordField />
      </div>

      <Section title="About you">
        <div>
          <label htmlFor="previousRole" className={labelClass}>
            What was your most recent role?
          </label>
          <input
            id="previousRole"
            name="previousRole"
            placeholder="e.g. Copywriter, Bookkeeper, Support Lead"
            className={inputClass}
          />
        </div>

        <div>
          <span className={labelClass}>Industry</span>
          <Select name="industry" options={INDUSTRIES} required />
        </div>

        <div>
          <span className={labelClass}>What brings you here?</span>
          <Select name="situation" options={SITUATIONS} required />
        </div>
      </Section>

      <Section title="Where you're based">
        <LocationPicker />
      </Section>

      <HumanCheck />

      {status === "error" && <ErrorBanner message={message} />}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" && <Spinner className="h-4 w-4" />}
        {status === "submitting"
          ? "Sending your code…"
          : IS_DEV
            ? "Create account"
            : "Continue"}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-fog">
        <Check className="h-3.5 w-3.5 text-cyan" />
        {IS_DEV
          ? "Team accounts only. No spam."
          : "Team accounts only. We'll email a 6-digit code to confirm."}
      </p>
    </form>
  );
}
