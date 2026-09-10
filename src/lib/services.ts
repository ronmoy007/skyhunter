// Services data — source of truth for the /services grid and each
// /services/[slug] detail page. Each service has the card fields plus a full
// detail payload (overview, benefit pillars, deliverables, tech groups, a
// numbered process, use cases, and FAQ). Icons are referenced by key and
// resolved to a component in the pages (see SERVICE_ICONS).

export type IconKey =
  | "Laptop"
  | "Spark"
  | "Book"
  | "Compass"
  | "Users"
  | "Shield"
  | "Lifebuoy";

export type ServiceDetail = {
  name: string;
  slug: string;
  icon: IconKey;
  price: string;
  /** One-line card body. */
  body: string;
  /** Short chips on the card. */
  tags: string[];

  // ---- Detail ----
  summary: string;
  /** Optional per-service hero art; falls back to the shared service banner. */
  heroImage?: { light: string; dark: string };
  overviewTitle: string;
  overview: string;

  benefits: { title: string; body: string }[];
  deliverables: string[];
  stackGroups: { label: string; items: string[] }[];
  steps: { title: string; body: string }[];
  useCases: string[];
  faq: { q: string; a: string }[];
};

export const SERVICES: ServiceDetail[] = [
  {
    name: "Website & web-app builds",
    slug: "website-web-app-builds",
    icon: "Laptop",
    price: "From $18k–35k",
    body: "Fast, modern sites and web apps for e-commerce, healthcare, and law — designed to convert and engineered to scale under real traffic.",
    tags: ["Next.js", "Shopify", "CMS"],
    summary:
      "Fast, modern sites and web apps for e-commerce, healthcare, and law — designed to convert and engineered to hold up when real traffic arrives.",
    overviewTitle: "A site is only as good as its slowest page",
    overview:
      "Most sites lose people before they ever convert — heavy pages, clumsy checkouts, and search that doesn't find anything. We build front ends that are genuinely fast, accessible, and easy to run, so the experience earns the click instead of losing it.",
    benefits: [
      { title: "Built to convert", body: "Layouts, speed, and flows shaped around the action you want visitors to take." },
      { title: "Fast by default", body: "Top Core Web Vitals out of the box — sub-second loads on real devices and networks." },
      { title: "Scales cleanly", body: "Architecture that stays smooth from launch day to your busiest traffic spike." },
      { title: "Easy to run", body: "A CMS and design system your team can actually update without calling us." },
    ],
    deliverables: [
      "E-commerce storefronts, checkout & catalog",
      "Healthcare portals built for compliance",
      "Law firm sites with client intake",
      "Design system, CMS, and analytics",
    ],
    stackGroups: [
      { label: "Frontend", items: ["Next.js", "React", "TypeScript", "Tailwind"] },
      { label: "Commerce & CMS", items: ["Shopify", "Sanity", "Headless CMS"] },
      { label: "Infra", items: ["Vercel", "Edge rendering", "Analytics"] },
    ],
    steps: [
      { title: "Scope & design", body: "We agree the pages, flows, and success metrics, then design the experience up front." },
      { title: "Build", body: "Production-grade front end on a clear cadence, with staging links you can click every week." },
      { title: "Optimize", body: "Performance, SEO, and accessibility passes so it's fast and findable at launch." },
      { title: "Launch & hand off", body: "We ship, wire up analytics, and hand you a CMS your team owns." },
    ],
    useCases: [
      "High-volume e-commerce storefronts",
      "Compliant healthcare and patient-portal front ends",
      "Law firm and professional-services sites",
      "Marketing sites and product landing pages",
      "Web apps and customer dashboards",
    ],
    faq: [
      { q: "How long does a build take?", a: "Most sites ship in 6–12 weeks depending on scope. We agree the timeline before we start." },
      { q: "Can we update it ourselves?", a: "Yes — we build on a CMS and design system so your team can edit content and pages without engineering." },
      { q: "Do you handle SEO and performance?", a: "Every build includes performance, accessibility, and technical-SEO passes before launch." },
    ],
  },
  {
    name: "AI agents",
    slug: "ai-agents",
    icon: "Spark",
    price: "From $8k–25k",
    body: "Support, workflow, and sales agents that take real actions — grounded in your data, with clean human handoff when it matters.",
    tags: ["Support", "Workflow", "Tool use"],
    summary:
      "Support, workflow, and sales agents that take real actions — grounded in your data, with a clean handoff to a human the moment it matters.",
    overviewTitle: "An agent that guesses is worse than no agent",
    overview:
      "Plenty of agents demo well and then invent an answer in front of a real customer. We build agents grounded in your systems, with guardrails and escalation, so they act reliably and know when to step back.",
    benefits: [
      { title: "Takes real actions", body: "Tool use wired into your systems — not just chat, but bookings, updates, and lookups." },
      { title: "Grounded answers", body: "Every response tied to your live data, so it stays accurate as things change." },
      { title: "Safe handoff", body: "Clear escalation to a human whenever a request crosses the agent's boundary." },
      { title: "Measurable", body: "Evals and dashboards prove the agent is helping, not just running." },
    ],
    deliverables: [
      "Support & deflection agents",
      "Workflow automation agents",
      "Sales & qualification agents",
      "Tool calling into your systems",
    ],
    stackGroups: [
      { label: "Models", items: ["Claude", "OpenAI", "Open-weight LLMs"] },
      { label: "Orchestration", items: ["Tool use", "LangGraph", "RAG"] },
      { label: "Quality", items: ["Evals", "Guardrails", "Tracing"] },
    ],
    steps: [
      { title: "Map the job", body: "We define exactly what the agent should do, touch, and never do." },
      { title: "Ground & wire", body: "Connect it to your data and tools, with guardrails around every action." },
      { title: "Evaluate", body: "Score it against real tasks until its behavior is reliable, not just plausible." },
      { title: "Ship & monitor", body: "Launch with dashboards and handoff paths, then tune as usage grows." },
    ],
    useCases: [
      "Customer support and ticket deflection",
      "Sales qualification and follow-up",
      "Internal workflow and ops automation",
      "Onboarding and in-product assistance",
      "Data lookups and system actions",
    ],
    faq: [
      { q: "Will it hallucinate?", a: "We ground answers in your data and add guardrails plus evals, so the agent stays accurate and refuses when unsure." },
      { q: "Can it do more than chat?", a: "Yes — agents call tools to take real actions in your systems, with a human handoff when needed." },
      { q: "Which model do you use?", a: "We pick the model that fits your task and budget — often Claude — rather than defaulting to one." },
    ],
  },
  {
    name: "LLM apps & copilots",
    slug: "llm-apps-copilots",
    icon: "Book",
    price: "Custom scope",
    body: "Custom LLM products — copilots, assistants, and generative features — embedded right where your users already work.",
    tags: ["Claude", "Streaming", "RAG"],
    summary:
      "Custom LLM products — copilots, assistants, and generative features — embedded right where your users already work, not bolted on beside it.",
    overviewTitle: "The best AI feature feels like part of the product",
    overview:
      "A copilot in a separate tab gets ignored. We build LLM features into the flow your users are already in, with streaming UX and context that makes them genuinely useful from the first interaction.",
    benefits: [
      { title: "In the flow", body: "Features embedded where work already happens, so adoption is natural." },
      { title: "Context-aware", body: "The right context and prompts so answers fit your product and your user." },
      { title: "Fast UX", body: "Streaming, caching, and thoughtful states that make it feel instant." },
      { title: "Yours to own", body: "Clean code and architecture you keep — no black box, no lock-in." },
    ],
    deliverables: [
      "In-product copilots & assistants",
      "Generative features & drafting",
      "Prompt & context architecture",
      "Streaming UX and caching",
    ],
    stackGroups: [
      { label: "Models", items: ["Claude", "OpenAI", "Open-weight LLMs"] },
      { label: "Retrieval", items: ["RAG", "pgvector", "Embeddings"] },
      { label: "Experience", items: ["Streaming", "Caching", "Next.js"] },
    ],
    steps: [
      { title: "Find the moment", body: "We pinpoint where in your product an LLM feature actually helps." },
      { title: "Design the context", body: "Prompt and context architecture that grounds the feature in your data." },
      { title: "Build the UX", body: "Streaming, states, and caching that make it feel fast and reliable." },
      { title: "Ship & refine", body: "Launch, watch real usage, and tune prompts and behavior." },
    ],
    useCases: [
      "In-product copilots and assistants",
      "Drafting and content-generation features",
      "Summarization and rewriting",
      "Natural-language search and Q&A",
      "Guided workflows and automation",
    ],
    faq: [
      { q: "Do we own the code?", a: "Completely. We build with your stack and hand over clean, documented code — no proprietary black box." },
      { q: "How do you keep it fast?", a: "Streaming responses, caching, and careful context design keep the experience feeling instant." },
      { q: "Can it use our data?", a: "Yes — we ground features in your content with retrieval so they're accurate and on-brand." },
    ],
  },
  {
    name: "RAG & search",
    slug: "rag-search",
    icon: "Compass",
    price: "From $12k–28k",
    body: "Retrieval over your documents and data, with citations you can trust and evals that keep answers honest as content grows.",
    tags: ["pgvector", "Rerank", "Citations"],
    summary:
      "Retrieval over your documents and data, with citations you can trust and evals that keep answers honest as your content grows.",
    overviewTitle: "An answer you can't verify is worthless",
    overview:
      "Generic AI search answers confidently and gives you no way to check it. We build retrieval that cites its sources, handles messy formats, and is measured continuously — so your team can actually act on what it returns.",
    benefits: [
      { title: "Cited answers", body: "Every response links back to the exact source passage it came from." },
      { title: "Handles messy data", body: "Mixed formats, scanned files, and huge document sets, parsed cleanly." },
      { title: "Stays accurate", body: "Evals catch drift as your content changes, so quality holds over time." },
      { title: "Access-aware", body: "Results respect who's allowed to see what, right down to the document." },
    ],
    deliverables: [
      "Document ingestion & chunking",
      "Vector + keyword hybrid search",
      "Cited, grounded answers",
      "Freshness and re-index pipelines",
    ],
    stackGroups: [
      { label: "Models", items: ["Claude", "OpenAI", "Embeddings"] },
      { label: "Retrieval", items: ["pgvector", "Hybrid search", "Rerankers"] },
      { label: "Quality", items: ["Evals", "Citations", "Tracing"] },
    ],
    steps: [
      { title: "Ingest", body: "We parse and chunk your documents — including the messy, scanned ones." },
      { title: "Retrieve", body: "Hybrid vector and keyword search with reranking for the right passages." },
      { title: "Ground & cite", body: "Answers built only from retrieved sources, each one cited." },
      { title: "Evaluate", body: "A continuous eval suite keeps accuracy honest as content grows." },
    ],
    useCases: [
      "Knowledge-base and support search",
      "Internal document and policy Q&A",
      "Contract and legal document search",
      "Product and catalog search",
      "Research and analyst assistants",
    ],
    faq: [
      { q: "How do you prevent wrong answers?", a: "Answers are built only from retrieved, cited sources, and an eval suite continuously checks accuracy." },
      { q: "Can it handle PDFs and scans?", a: "Yes — we parse mixed formats, including scanned documents, with layout-aware extraction." },
      { q: "Does it respect permissions?", a: "Retrieval is access-aware, so users only ever see answers from documents they're allowed to read." },
    ],
  },
  {
    name: "Voice agents",
    slug: "voice-agents",
    icon: "Users",
    price: "From $12k–25k",
    body: "Natural phone and in-app voice agents that book, qualify, and resolve — replacing menu trees and hold music.",
    tags: ["Vapi", "Twilio", "Telephony"],
    summary:
      "Natural phone and in-app voice agents that book, qualify, and resolve — replacing menu trees and hold music with a conversation that actually helps.",
    overviewTitle: "Nobody misses the phone tree",
    overview:
      "Traditional IVR frustrates callers and still ends in a queue. We build voice agents that understand natural speech, take real actions, and transfer to a person the moment it's warranted — so callers get answers, not menus.",
    benefits: [
      { title: "Natural conversation", body: "Callers speak normally and get understood — no rigid menus or keywords." },
      { title: "Gets things done", body: "Books, qualifies, and resolves by taking real actions in your systems." },
      { title: "Live transfer", body: "Hands off to the right human with full context when it should." },
      { title: "Always on", body: "Coverage around the clock without staffing the phones." },
    ],
    deliverables: [
      "Inbound & outbound voice flows",
      "Booking, qualifying & routing",
      "Live transfer to a human",
      "Call transcripts & analytics",
    ],
    stackGroups: [
      { label: "Voice", items: ["Vapi", "TTS / STT", "LiveKit"] },
      { label: "Telephony", items: ["Twilio", "SIP", "Call routing"] },
      { label: "Logic", items: ["Claude", "Tool use", "Transcripts"] },
    ],
    steps: [
      { title: "Design the flows", body: "We map the calls the agent should handle — and where it should transfer." },
      { title: "Build the voice", body: "Natural speech in and out, wired to your booking and CRM systems." },
      { title: "Add handoff", body: "Live transfer with context so humans pick up right where the agent left off." },
      { title: "Launch & tune", body: "Go live with transcripts and analytics, then refine from real calls." },
    ],
    useCases: [
      "Inbound support and triage lines",
      "Appointment booking and reminders",
      "Lead qualification and routing",
      "Outbound follow-up calls",
      "After-hours phone coverage",
    ],
    faq: [
      { q: "Does it sound robotic?", a: "No — we use natural TTS and conversational design so callers can speak normally and be understood." },
      { q: "Can it transfer to a person?", a: "Yes — the agent hands off live to the right human with full context whenever it's warranted." },
      { q: "Will it work with our phone system?", a: "We integrate with standard telephony (Twilio, SIP) and route to your existing numbers and teams." },
    ],
  },
  {
    name: "Evals, guardrails & red-teaming",
    slug: "evals-guardrails",
    icon: "Shield",
    price: "From $8k",
    body: "Automated evals, guardrails, and adversarial testing so your AI ships safely and keeps working as it scales.",
    tags: ["Braintrust", "Red-team", "CI"],
    summary:
      "Automated evals, guardrails, and adversarial testing so your AI ships safely — and keeps working as it scales, instead of quietly drifting.",
    overviewTitle: "AI quality that isn't measured, decays",
    overview:
      "Without evals, you can't tell if a prompt change made things better or worse — you just hope. We build the evals, guardrails, and red-team tests that turn AI quality into something you can see, gate on, and trust.",
    benefits: [
      { title: "Measured quality", body: "Eval suites tied to real tasks so you know quality, not just vibes." },
      { title: "Safe outputs", body: "Guardrails on inputs and outputs to catch unsafe or off-policy responses." },
      { title: "Adversarial testing", body: "Red-team and jailbreak tests that find failures before your users do." },
      { title: "No regressions", body: "CI-gated evals so a prompt tweak can't silently break production." },
    ],
    deliverables: [
      "Eval suites tied to real tasks",
      "Input/output guardrails",
      "Red-team & jailbreak testing",
      "Regression dashboards",
    ],
    stackGroups: [
      { label: "Evals", items: ["Braintrust", "Promptfoo", "Custom suites"] },
      { label: "Safety", items: ["Guardrails", "Red-team", "Policy checks"] },
      { label: "Ops", items: ["CI", "Tracing", "Dashboards"] },
    ],
    steps: [
      { title: "Define quality", body: "We turn 'good output' into concrete, testable criteria for your use case." },
      { title: "Build evals", body: "Automated suites that score responses against those criteria on real tasks." },
      { title: "Red-team", body: "Adversarial and jailbreak testing to surface failure modes early." },
      { title: "Gate & monitor", body: "Wire evals into CI and dashboards so quality can't regress unnoticed." },
    ],
    useCases: [
      "Pre-launch AI quality assurance",
      "Guardrails for customer-facing agents",
      "Regression testing on prompt changes",
      "Safety and compliance reviews",
      "Ongoing production monitoring",
    ],
    faq: [
      { q: "Can you add this to an existing AI feature?", a: "Yes — we frequently wrap evals and guardrails around AI you already have in production." },
      { q: "What does 'red-teaming' involve?", a: "We adversarially probe your AI for jailbreaks, unsafe outputs, and edge-case failures, then help you close them." },
      { q: "How do evals run?", a: "They run in CI on every change and feed dashboards, so regressions are caught before they ship." },
    ],
  },
  {
    name: "Ongoing retainer",
    slug: "ongoing-retainer",
    icon: "Lifebuoy",
    price: "Monthly",
    body: "After launch, we run, monitor, and improve what we built — new features, tuned prompts, and evals that keep quality from drifting.",
    tags: ["Monitoring", "Iteration", "Support"],
    summary:
      "After launch, we run, monitor, and improve what we built — new features, tuned prompts, and evals that keep quality from drifting as the world changes.",
    overviewTitle: "Launch is a milestone, not the finish line",
    overview:
      "Software — and AI especially — needs care after go-live: models change, usage shifts, and quality drifts if no one's watching. A retainer keeps a senior team on your build so it keeps improving instead of quietly decaying.",
    benefits: [
      { title: "Always watched", body: "Monitoring and on-call so incidents are caught and handled fast." },
      { title: "Keeps improving", body: "A steady stream of new features and refinements, not a frozen v1." },
      { title: "Quality holds", body: "Continuous evals and tuning so AI stays sharp as inputs change." },
      { title: "One senior team", body: "The people who built it keep running it — no re-onboarding, no handoffs." },
    ],
    deliverables: [
      "Monitoring & on-call for incidents",
      "Continuous eval & quality tuning",
      "New features and iterations",
      "Monthly roadmap & reporting",
    ],
    stackGroups: [
      { label: "Monitoring", items: ["Tracing", "Dashboards", "Alerting"] },
      { label: "Quality", items: ["Evals", "Prompt tuning", "Guardrails"] },
      { label: "Delivery", items: ["Roadmap", "Reporting", "On-call"] },
    ],
    steps: [
      { title: "Onboard", body: "We set monitoring, evals, and a shared roadmap for what happens next." },
      { title: "Run", body: "We watch production, handle incidents, and keep quality steady." },
      { title: "Improve", body: "New features and tuning land on a predictable monthly cadence." },
      { title: "Report", body: "Clear monthly reporting so you always know what changed and why." },
    ],
    useCases: [
      "Running a live AI product post-launch",
      "Keeping evals and quality from drifting",
      "Shipping a steady feature roadmap",
      "Monitoring and incident response",
      "Ongoing prompt and model tuning",
    ],
    faq: [
      { q: "Is there a minimum commitment?", a: "Retainers are monthly and flexible — we scope the level of support to what your build actually needs." },
      { q: "What if we only need occasional help?", a: "We can run a lighter retainer focused on monitoring and incident response, with features as needed." },
      { q: "Do we keep ownership?", a: "Always. You own the code and can bring it in-house at any time — the retainer is support, not lock-in." },
    ],
  },
];

export function getService(slug: string): ServiceDetail | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
