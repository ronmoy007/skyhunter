"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "./Select";
import { useAuth } from "./AuthProvider";

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

const EXPERIENCE = [
  "Less than 1 year",
  "1–3 years",
  "3–5 years",
  "5–10 years",
  "10+ years",
];

const WORK_PREFERENCE = ["Remote", "Hybrid", "On-site", "No preference"];

const AVAILABILITY = [
  "Available immediately",
  "Within 2 weeks",
  "Within a month",
  "Open, but not urgent",
  "Not actively looking",
];

type Profile = {
  name: string;
  previousRole: string;
  industry: string;
  situation: string;
  location: string;
  headline: string;
  summary: string;
  skills: string;
  experienceYears: string;
  desiredRole: string;
  workPreference: string;
  availability: string;
  desiredSalary: string;
  phone: string;
  website: string;
  linkedinUrl: string;
  githubUrl: string;
};

type Status = "idle" | "saving" | "saved" | "error";

const inputClass =
  "w-full rounded-xl border border-steel-line bg-void px-4 py-3 text-chrome outline-none transition-colors placeholder:text-faint focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
const labelClass = "mb-1.5 block text-sm font-medium text-mist";

function Field({
  id,
  label,
  hint,
  children,
}: {
  id?: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {id ? (
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
      ) : (
        <span className={labelClass}>{label}</span>
      )}
      {children}
      {hint && <p className="mt-1 text-xs text-faint">{hint}</p>}
    </div>
  );
}

function SectionHeading({ children, sub }: { children: string; sub?: string }) {
  return (
    <div className="border-t border-steel-line pt-6">
      <h3 className="font-display text-base font-semibold text-chrome">
        {children}
      </h3>
      {sub && <p className="mt-0.5 text-sm text-fog">{sub}</p>}
    </div>
  );
}

export function ProfileForm({ initial }: { initial: Profile }) {
  const router = useRouter();
  const { refresh } = useAuth();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    setMessage("");

    const data = Object.fromEntries(new FormData(e.currentTarget).entries());

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Couldn't save your changes.");
      }
      setStatus("saved");
      await refresh(); // update the navbar name
      router.refresh(); // update the server-rendered header
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Couldn't save your changes.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Basics */}
      <Field id="name" label="Full name">
        <input
          id="name"
          name="name"
          required
          defaultValue={initial.name}
          className={inputClass}
        />
      </Field>

      <Field
        id="headline"
        label="Professional headline"
        hint="One line that sums you up — shown at the top of your profile."
      >
        <input
          id="headline"
          name="headline"
          defaultValue={initial.headline}
          placeholder="e.g. Copywriter moving into content strategy"
          className={inputClass}
        />
      </Field>

      <Field
        id="summary"
        label="About you"
        hint="A short summary of your background, strengths, and what you're looking for."
      >
        <textarea
          id="summary"
          name="summary"
          rows={4}
          defaultValue={initial.summary}
          placeholder="Tell employers who you are, what you've done, and where you're headed."
          className={inputClass}
        />
      </Field>

      {/* Career */}
      <SectionHeading sub="Where you've been and where you want to go.">
        Career
      </SectionHeading>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="previousRole" label="Most recent role">
          <input
            id="previousRole"
            name="previousRole"
            defaultValue={initial.previousRole}
            placeholder="e.g. Copywriter, Bookkeeper"
            className={inputClass}
          />
        </Field>
        <Field id="desiredRole" label="Target role">
          <input
            id="desiredRole"
            name="desiredRole"
            defaultValue={initial.desiredRole}
            placeholder="e.g. Content Strategist"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Industry">
          <Select
            name="industry"
            options={INDUSTRIES}
            defaultValue={initial.industry}
          />
        </Field>
        <Field label="Years of experience">
          <Select
            name="experienceYears"
            options={EXPERIENCE}
            defaultValue={initial.experienceYears}
            placeholder="Select experience"
          />
        </Field>
      </div>

      <Field
        id="skills"
        label="Skills"
        hint="Separate with commas — e.g. Copywriting, SEO, Figma, Project management."
      >
        <textarea
          id="skills"
          name="skills"
          rows={2}
          defaultValue={initial.skills}
          placeholder="Copywriting, SEO, Figma, Client management"
          className={inputClass}
        />
      </Field>

      <Field label="What brings you here?">
        <Select
          name="situation"
          options={SITUATIONS}
          defaultValue={initial.situation}
        />
      </Field>

      {/* Preferences */}
      <SectionHeading sub="Helps us match you to the right contracts and roles.">
        Job preferences
      </SectionHeading>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Work preference">
          <Select
            name="workPreference"
            options={WORK_PREFERENCE}
            defaultValue={initial.workPreference}
            placeholder="Select preference"
          />
        </Field>
        <Field label="Availability">
          <Select
            name="availability"
            options={AVAILABILITY}
            defaultValue={initial.availability}
            placeholder="Select availability"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="desiredSalary"
          label="Desired pay"
          hint="A rate or range you're aiming for."
        >
          <input
            id="desiredSalary"
            name="desiredSalary"
            defaultValue={initial.desiredSalary}
            placeholder="e.g. $2.5K–$3.5K / month"
            className={inputClass}
          />
        </Field>
        <Field id="location" label="Location">
          <input
            id="location"
            name="location"
            defaultValue={initial.location}
            placeholder="City, Region, Country"
            className={inputClass}
          />
        </Field>
      </div>

      {/* Contact & links */}
      <SectionHeading sub="How employers reach you and see your work.">
        Contact &amp; links
      </SectionHeading>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="phone" label="Phone (optional)">
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={initial.phone}
            placeholder="+1 555 000 1234"
            className={inputClass}
          />
        </Field>
        <Field id="website" label="Portfolio / website">
          <input
            id="website"
            name="website"
            type="url"
            defaultValue={initial.website}
            placeholder="https://yoursite.com"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="linkedinUrl" label="LinkedIn">
          <input
            id="linkedinUrl"
            name="linkedinUrl"
            type="url"
            defaultValue={initial.linkedinUrl}
            placeholder="https://linkedin.com/in/you"
            className={inputClass}
          />
        </Field>
        <Field id="githubUrl" label="GitHub">
          <input
            id="githubUrl"
            name="githubUrl"
            type="url"
            defaultValue={initial.githubUrl}
            placeholder="https://github.com/you"
            className={inputClass}
          />
        </Field>
      </div>

      {status === "error" && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {message}
        </p>
      )}
      {status === "saved" && (
        <p className="rounded-lg border border-cyan/30 bg-cyan/5 px-4 py-3 text-sm text-cyan">
          Your profile has been saved.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "saving"}
        className="rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "saving" ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
