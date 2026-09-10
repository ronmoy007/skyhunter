"use client";

import { useEffect, useState } from "react";
import { Select } from "./Select";
import { Honeypot } from "./Honeypot";
import { Check, Spinner } from "./icons";

const INDUSTRIES = [
  "E-commerce",
  "Healthcare",
  "Law / Legal",
  "Startup / SaaS",
  "Other",
];
const PROJECT_TYPES = [
  "Website / web app",
  "AI agent",
  "LLM app",
  "RAG / search",
  "Voice agent",
  "Not sure yet",
];
const BUDGETS = [
  "Under $10k",
  "$10k – $25k",
  "$25k – $50k",
  "$50k+",
  "Not sure yet",
];
const TIMELINES = ["ASAP", "1–3 months", "3–6 months", "Flexible"];

const inputCls =
  "w-full rounded-xl border border-steel-line bg-void px-4 py-3 text-chrome outline-none transition-colors placeholder:text-faint focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
const labelCls = "mb-1.5 block text-sm font-medium text-mist";

export function LeadForm({
  defaultIndustry = "",
  defaultProjectType = "",
}: {
  defaultIndustry?: string;
  defaultProjectType?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState(defaultIndustry);
  const [projectType, setProjectType] = useState(defaultProjectType);
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [message, setMessage] = useState("");
  const [hp, setHp] = useState("");

  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (defaultIndustry) setIndustry(defaultIndustry);
    if (defaultProjectType) setProjectType(defaultProjectType);
  }, [defaultIndustry, defaultProjectType]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "project",
          name,
          email,
          company,
          industry,
          projectType,
          budget,
          timeline,
          message,
          hp_check: hp,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Couldn't send your brief.");
      setState("done");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-cyan/40 bg-cyan/5 p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cyan text-white">
          <Check className="h-6 w-6" />
        </span>
        <h3 className="mt-4 font-display text-xl font-semibold text-chrome">
          Brief received — thank you
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-mist">
          We&apos;ll review it and email{" "}
          <span className="font-medium text-chrome">{email}</span> within one
          business day with next steps and a suggested scope. Talk soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Honeypot />
      {/* Honeypot's own input isn't wired to state; add a controlled shadow trap
          so bots that fill any hidden field are still caught. */}
      <input
        type="text"
        name="company_url"
        tabIndex={-1}
        autoComplete="off"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        aria-hidden="true"
        className="hidden"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ld-name" className={labelCls}>
            Your name
          </label>
          <input
            id="ld-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label htmlFor="ld-email" className={labelCls}>
            Work email
          </label>
          <input
            id="ld-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="you@company.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="ld-company" className={labelCls}>
          Company <span className="text-faint">(optional)</span>
        </label>
        <input
          id="ld-company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className={inputCls}
          placeholder="Company or project name"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className={labelCls}>Industry</span>
          <Select
            name="industry"
            options={INDUSTRIES}
            defaultValue={industry}
            placeholder="Choose one"
            onChange={setIndustry}
          />
        </div>
        <div>
          <span className={labelCls}>What do you need built?</span>
          <Select
            name="projectType"
            options={PROJECT_TYPES}
            defaultValue={projectType}
            placeholder="Choose one"
            onChange={setProjectType}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className={labelCls}>Budget</span>
          <Select
            name="budget"
            options={BUDGETS}
            defaultValue={budget}
            placeholder="Rough range"
            onChange={setBudget}
          />
        </div>
        <div>
          <span className={labelCls}>Timeline</span>
          <Select
            name="timeline"
            options={TIMELINES}
            defaultValue={timeline}
            placeholder="When do you need it?"
            onChange={setTimeline}
          />
        </div>
      </div>

      <div>
        <label htmlFor="ld-msg" className={labelCls}>
          Tell us about the project
        </label>
        <textarea
          id="ld-msg"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={inputCls}
          placeholder="What are you building, who's it for, and what does success look like? Links to anything relevant help."
        />
      </div>

      {state === "error" && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-blue-400 disabled:opacity-60"
      >
        {state === "sending" && <Spinner className="h-4 w-4" />}
        {state === "sending" ? "Sending…" : "Send project brief"}
      </button>

      <p className="text-center text-xs text-fog">
        No obligation. We reply within one business day.
      </p>
    </form>
  );
}
