// Non-job content: builder resources and agency case studies.

export type Resource = {
  title: string;
  provider: string;
  cost: "Free" | "Free + paid" | "Low-cost";
  blurb: string;
  href: string;
  // "Framework" & "Playbook" show on /reskill (Playbooks); the rest on /support.
  kind: "Framework" | "Playbook" | "Models" | "Data" | "Deploy";
};

export const RESOURCES: Resource[] = [
  {
    title: "LangGraph",
    provider: "LangChain",
    cost: "Free + paid",
    blurb:
      "The go-to framework for building stateful, multi-step agents with explicit control flow, retries, and human-in-the-loop.",
    href: "https://langchain-ai.github.io/langgraph/",
    kind: "Framework",
  },
  {
    title: "LlamaIndex",
    provider: "LlamaIndex",
    cost: "Free",
    blurb:
      "Data framework for RAG — connect client documents and databases to an LLM with clean ingestion and retrieval.",
    href: "https://docs.llamaindex.ai/",
    kind: "Framework",
  },
  {
    title: "Claude & OpenAI APIs",
    provider: "Anthropic / OpenAI",
    cost: "Low-cost",
    blurb:
      "The model providers behind most production agents — tool use, structured output, and long context for real client work.",
    href: "https://docs.anthropic.com/",
    kind: "Models",
  },
  {
    title: "Pinecone",
    provider: "Pinecone",
    cost: "Free + paid",
    blurb:
      "Managed vector database for retrieval at scale. Start on the free tier, grow into production without re-architecting.",
    href: "https://docs.pinecone.io/",
    kind: "Data",
  },
  {
    title: "Vercel AI SDK",
    provider: "Vercel",
    cost: "Free",
    blurb:
      "Ship agent UIs fast — streaming, tool calls, and generative interfaces you can deploy to a client in an afternoon.",
    href: "https://sdk.vercel.ai/docs",
    kind: "Deploy",
  },
  {
    title: "Pricing AI Services",
    provider: "SkyHunter Playbook",
    cost: "Free",
    blurb:
      "How to scope, quote, and package agent builds — retainers, per-build, and productized offers that hold their margin.",
    href: "https://www.anthropic.com/pricing",
    kind: "Playbook",
  },
];

export type Story = {
  name: string;
  was: string;
  now: string;
  quote: string;
  monthsToRehire: number; // repurposed: weeks from kickoff to a shipped v1
  initials: string;
  accent: "clay" | "sage" | "sky";
  avatar?: string; // real portrait; falls back to initials if unset
};

export const STORIES: Story[] = [
  {
    name: "Nadia K.",
    was: "Head of Growth, Copperleaf Goods (e-commerce)",
    now: "AI storefront + shopping agent",
    quote:
      "SkyHunter rebuilt our storefront and dropped in a shopping agent that answers sizing and returns questions and nudges carts to checkout. Conversion is up 22% and support tickets are down by half.",
    monthsToRehire: 6,
    initials: "NK",
    accent: "sky",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Dr. Alan M.",
    was: "Clinical Director, Cedar Point Health",
    now: "Patient portal + intake agent",
    quote:
      "They built us a patient portal with a guarded intake agent that collects history before every visit and hands the clinician a clean summary. Our front desk got hours back each day — and the guardrails held.",
    monthsToRehire: 8,
    initials: "AM",
    accent: "sage",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Rachel S.",
    was: "Partner, Hartwell & Cross LLP",
    now: "Firm site + intake & case-search agents",
    quote:
      "Our new site qualifies and books consultations on its own, and the case-search agent answers questions across our documents with citations we trust. It paid for itself in the first quarter.",
    monthsToRehire: 7,
    initials: "RS",
    accent: "clay",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
];

export const STEPS = [
  {
    title: "Scope it right",
    body: "We start with a short discovery — your goal, your users, your constraints — then a fixed scope and a price. No surprises later.",
  },
  {
    title: "Design the system",
    body: "Architecture, data, and UX up front. For AI builds that means the model, the retrieval, the tools, and the evals before a line of glue code.",
  },
  {
    title: "Build in the open",
    body: "You see working software on a clear cadence — staging links, demos, and honest status — not a black box that appears at the end.",
  },
  {
    title: "Ship and run it",
    body: "We launch, harden, and hand off — with an optional retainer to monitor, evaluate, and improve it as real usage comes in.",
  },
];
