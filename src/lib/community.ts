// Community page content: the welcome intro, personas, members, and stats.
// NOTE: member photos in /public/members are royalty-free placeholder portraits.
// Swap them (and the names/blurbs) for your real members before launch.

export type Persona = {
  title: string;
  body: string;
};

export const PERSONAS: Persona[] = [
  {
    title: "Solo builders going agency",
    body: "Freelance developers turning one-off AI gigs into a repeatable, productized agent-building business.",
  },
  {
    title: "Boutique dev shops",
    body: "Small teams adding AI agents and LLM apps to their delivery menu — RAG, automation, and support bots.",
  },
  {
    title: "Marketing agencies",
    body: "Content and growth agencies layering AI agents onto client work to ship faster and charge more.",
  },
  {
    title: "Consultancies & operators",
    body: "Ops and strategy consultants packaging workflow automation into productized services clients renew.",
  },
];

// The people we're looking for: the craft you bring today, and the AI-agent
// service tracks you can grow into. Intentionally no icons.
export type RoleTrack = {
  category: string;
  from: string; // the skill you bring today
  to: string[]; // the AI-agent service tracks you can grow into
};

export const ROLE_TRACKS: RoleTrack[] = [
  {
    category: "Web & App Dev",
    from: "Web developers shipping sites and dashboards for clients",
    to: ["AI Agent Builder", "RAG App Developer", "LLM Integration Engineer", "Agent Platform Architect"],
  },
  {
    category: "Copy & Content",
    from: "Copywriters and content strategists",
    to: ["LLM Prompt Engineer", "Agent Persona Designer", "Eval & Guardrails Writer"],
  },
  {
    category: "Software Engineering",
    from: "Backend and full-stack engineers",
    to: ["Agent Orchestration Engineer", "Tool & Function-Calling Developer", "LLMOps Engineer"],
  },
  {
    category: "Ops & Consulting",
    from: "Ops consultants mapping manual client workflows",
    to: ["Workflow Automation Agency", "Process-to-Agent Consultant"],
  },
  {
    category: "Data & Analytics",
    from: "Data analysts wrangling client spreadsheets and reports",
    to: ["Retrieval Pipeline Builder", "Knowledge Base Engineer"],
  },
  {
    category: "Customer Support",
    from: "Support leads who know client tickets cold",
    to: ["Support Agent Builder", "Deflection & Handoff Designer"],
  },
  {
    category: "Design & UX",
    from: "Product designers shaping client interfaces",
    to: ["Conversational UX Designer", "Agent Interaction Designer"],
  },
  {
    category: "Marketing & Growth",
    from: "Marketing agencies running campaigns for clients",
    to: ["AI Content Ops Builder", "Lead-Gen Agent Specialist"],
  },
  {
    category: "Video & Media",
    from: "Video and media teams producing client assets",
    to: ["Voice Agent Builder", "Multimodal Pipeline Developer"],
  },
  {
    category: "Sales Engineering",
    from: "Solution sellers scoping client projects",
    to: ["AI Solutions Architect", "Agent Pilot Lead"],
  },
  {
    category: "Project Delivery",
    from: "Project managers shipping client engagements",
    to: ["Agent Delivery Lead", "Productized Service Manager"],
  },
  {
    category: "QA & Reliability",
    from: "QA engineers hardening client releases",
    to: ["Agent Eval Engineer", "LLM Reliability Specialist"],
  },
];

export type Member = {
  name: string;
  role: string;
  location: string;
  blurb: string;
  photo: string;
  persona: string;
};

export const MEMBERS: Member[] = [
  {
    name: "Daniel R.",
    role: "Founder, Loop Automations",
    location: "Toronto, CA",
    blurb:
      "Went from freelance dev to a 3-person shop shipping workflow-automation agents on monthly retainers.",
    photo: "https://randomuser.me/api/portraits/men/11.jpg",
    persona: "Solo builder going agency",
  },
  {
    name: "Sofia M.",
    role: "AI Lead, Fieldstone Studio",
    location: "Austin, TX",
    blurb:
      "Added a RAG support-agent service to her boutique dev shop; it's now half of client revenue.",
    photo: "https://randomuser.me/api/portraits/women/21.jpg",
    persona: "Boutique dev shop",
  },
  {
    name: "Marcus T.",
    role: "Freelance Agent Builder",
    location: "Remote",
    blurb:
      "Picks up paid agent-build bounties on SkyHunter and white-labels the results for other agencies.",
    photo: "https://randomuser.me/api/portraits/men/22.jpg",
    persona: "Solo builder going agency",
  },
  {
    name: "Elena K.",
    role: "Founder, Northlight",
    location: "Berlin, DE",
    blurb:
      "Runs a marketing agency that now ships LLM content-ops agents to every retainer client.",
    photo: "https://randomuser.me/api/portraits/women/33.jpg",
    persona: "Marketing agency",
  },
  {
    name: "James O.",
    role: "Principal, Vane Consulting",
    location: "Manchester, UK",
    blurb:
      "Turned bespoke ops audits into a productized automation service clients renew quarter after quarter.",
    photo: "https://randomuser.me/api/portraits/men/46.jpg",
    persona: "Consultancy & operator",
  },
  {
    name: "Aisha B.",
    role: "Community Mentor",
    location: "Chicago, IL",
    blurb:
      "Runs build cohorts, helping new agencies scope, price, and ship their first client agent.",
    photo: "https://randomuser.me/api/portraits/women/57.jpg",
    persona: "Mentor",
  },
];

export const COMMUNITY_STATS = [
  { n: "2,400+", l: "builders in the community" },
  { n: "35+", l: "countries represented" },
  { n: "120+", l: "client projects posted" },
  { n: "4.9★", l: "average community rating" },
];

// Core values — the "Our Principles" section.
export type Principle = { icon: string; title: string; body: string };

export const PRINCIPLES: Principle[] = [
  {
    icon: "spark",
    title: "Ship over theory",
    body: "We optimize for agents in production for real clients — working software beats slide decks and demos every time.",
  },
  {
    icon: "shield",
    title: "Free playbooks, no gatekeeping",
    body: "The core guides, patterns, and starters are open to every member. No paywalls on how to build well.",
  },
  {
    icon: "users",
    title: "Builders who've shipped",
    body: "Real agency operators who've delivered agents to paying clients, sharing what actually worked and what broke.",
  },
];

// What SkyHunter offers — the "Services" section.
export type Offering = {
  icon: string;
  title: string;
  body: string;
  href: string;
  cta: string;
};

export const OFFERINGS: Offering[] = [
  {
    icon: "users",
    title: "Client projects & bounties",
    body: "Paid agent-build leads from companies and other agencies in our network — typically $2.5K–$3.5K per project or retainer month.",
    href: "/profile",
    cta: "See projects",
  },
  {
    icon: "briefcase",
    title: "Templates & blueprints",
    body: "Production-ready agent starters — RAG, support agent, workflow automation, and voice — with a note on what to reuse and what to swap.",
    href: "/work",
    cta: "Browse blueprints",
  },
  {
    icon: "book",
    title: "Free build playbooks",
    body: "Step-by-step guides to design, build, ship, and price AI agents — matched to the stack you already know.",
    href: "/services",
    cta: "Explore playbooks",
  },
  {
    icon: "lifebuoy",
    title: "Help when a build stalls",
    body: "Architecture reviews, debugging help, and real builders to talk to. You don't have to ship your first agent alone.",
    href: "/contact",
    cta: "Get build help",
  },
];

// Revenue paths — the core promise: here are the real, repeatable ways agencies
// and freelancers make money building AI agents. Shown on the dashboard (as action)
// and the community page (as mission). Intentionally concrete about earnings.
export type IncomePath = {
  icon: string;
  title: string;
  body: string;
  earn: string; // typical earnings
  effort: string; // time commitment
  href: string;
  cta: string;
};

export const INCOME_INTRO = {
  eyebrow: "Agency revenue",
  title: "Turn AI agents into agency revenue",
  body: "Clients want agents shipped, not explained. SkyHunter turns the tools you already build with into repeatable revenue. These are the ways our members earn building agents — on their own terms.",
};

export const INCOME_PATHS: IncomePath[] = [
  {
    icon: "users",
    title: "Monthly retainers",
    body: "Get introduced to companies and agencies in our network who need agents built and maintained on an ongoing basis.",
    earn: "$2.5K–$3.5K / mo",
    effort: "20–30 hrs / week",
    href: "/book-a-call",
    cta: "Request an intro",
  },
  {
    icon: "briefcase",
    title: "Per-build project bounties",
    body: "Scope, build, and hand off a defined agent — RAG bot, automation, or support agent — on short, paid engagements.",
    earn: "$3K–$12K / build",
    effort: "Project-based",
    href: "/work",
    cta: "Browse bounties",
  },
  {
    icon: "spark",
    title: "White-label for other agencies",
    body: "Build agents behind the scenes for shops that sell to the client. Steady work without the sales overhead.",
    earn: "$40–90 / hr",
    effort: "Flexible, part-time",
    href: "/work",
    cta: "See white-label work",
  },
  {
    icon: "book",
    title: "Productized services",
    body: "Package a repeatable agent — like an onboarding bot — into a fixed-scope offer clients buy off the shelf.",
    earn: "Recurring MRR",
    effort: "Build once, sell many",
    href: "/services",
    cta: "Package a service",
  },
];

// Client & lead sources — companies, agency operators, and expert mentors in the
// community who bring paid agent-build projects to members. Editable in Admin → Content.
export type Partner = {
  name: string;
  role: string;
  company: string;
  offer: string;
  initials: string;
  accent: "clay" | "sage" | "sky";
  photo?: string; // real portrait; falls back to initials if unset
};

export const PARTNERS: Partner[] = [
  {
    name: "Marcus Chen",
    role: "Senior Full-Stack Developer",
    company: "Vercel-backed startup",
    offer: "Paid contracts building RAG and internal-tooling agents — bring your stack, we bring the clients.",
    initials: "MC",
    accent: "sky",
    photo: "https://randomuser.me/api/portraits/men/52.jpg",
  },
  {
    name: "Elena Ruiz",
    role: "Agency Founder",
    company: "Northlight (Seed)",
    offer: "3–6 month white-label builds for support agents and content-ops automation.",
    initials: "ER",
    accent: "sage",
    photo: "https://randomuser.me/api/portraits/women/63.jpg",
  },
  {
    name: "David Osei",
    role: "Engineering Lead",
    company: "Fintech scale-up",
    offer: "Per-build bounties for workflow-automation and function-calling agents, $60–110/hr.",
    initials: "DO",
    accent: "clay",
    photo: "https://randomuser.me/api/portraits/men/67.jpg",
  },
  {
    name: "Priya Nair",
    role: "Founder & CEO",
    company: "Early-stage SaaS",
    offer: "Ongoing retainers to build and maintain an in-product support agent, flexible hours.",
    initials: "PN",
    accent: "sky",
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    name: "Tomás Vidal",
    role: "Mentor & Solutions Architect",
    company: "YC-backed startup",
    offer: "Paid project intros for agencies shipping RAG pipelines and voice agents.",
    initials: "TV",
    accent: "sage",
    photo: "https://randomuser.me/api/portraits/men/85.jpg",
  },
  {
    name: "Aisha Khan",
    role: "CTO",
    company: "Health-tech startup",
    offer: "Ongoing contracts for agent eval, guardrails, and LLM reliability work.",
    initials: "AK",
    accent: "clay",
    photo: "https://randomuser.me/api/portraits/women/12.jpg",
  },
];

// How it works — steps to join.
export const JOIN_STEPS = [
  {
    title: "Create your free account",
    body: "Sign up in under a minute. No cost, no commitment — just a door into the builder community.",
  },
  {
    title: "Tell us what you build",
    body: "Share your stack, your services, and where you are. It helps us route the right projects and playbooks to you.",
  },
  {
    title: "Get matched & ship",
    body: "Grab client bounties, clone a blueprint, and ship your first agent — with a community of builders behind you.",
  },
];
