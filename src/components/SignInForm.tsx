"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { Honeypot } from "./Honeypot";
import { OAuthButtons } from "./OAuthButtons";

type Status = "idle" | "submitting" | "error";

export function SignInForm({
  google = false,
  linkedin = false,
}: {
  google?: boolean;
  linkedin?: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Surface errors handed back by the OAuth callback (?error=...).
  const oauthError = params.get("error");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const payload = {
      email: data.email,
      password: data.password,
      remember: data.remember === "on",
    };

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Something went wrong.");
      }
      await refresh();
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : "We couldn't sign you in.",
      );
    }
  }

  const inputClass =
    "w-full rounded-xl border border-steel-line bg-void px-4 py-3 text-chrome outline-none transition-colors placeholder:text-faint focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
  const labelClass = "mb-1.5 block text-sm font-medium text-mist";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-chrome">
          Welcome back
        </h2>
        <p className="mt-1 text-sm text-fog">
          New here?{" "}
          <Link href="/signup" className="font-medium text-blue-300 hover:text-blue-400">
            Create an account
          </Link>
        </p>
      </div>

      {oauthError && status !== "error" && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {oauthError}
        </p>
      )}

      <OAuthButtons action="Sign in" google={google} linkedin={linkedin} />

      <Honeypot />

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
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className={`${inputClass} pr-16`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-fog hover:text-chrome"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-mist">
        <input
          type="checkbox"
          name="remember"
          defaultChecked
          className="h-4 w-4 rounded border-steel-line accent-blue-500"
        />
        Remember me for 30 days
      </label>

      {status === "error" && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-xl bg-blue-500 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
