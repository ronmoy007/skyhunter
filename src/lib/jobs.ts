import REMOTE_JOBS_DATA from "./remote-jobs.json";

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  mode: "Remote" | "Hybrid" | "On-site";
  type: "Full-time" | "Part-time" | "Contract";
  salary: string;
  category: string;
  status?: string; // Hiring | Interviewing | Hired | Closed | Draft
  postedDaysAgo: number;
  // Why this role tends to hold up well alongside AI — written for a human, not a bot.
  humanEdge: string;
  summary: string;
  responsibilities: string[];
  broughtFrom: string; // a transferable-skills note: "You already do this if you were a ___"
  tags: string[];
};

export const JOB_STATUSES = [
  "Hiring",
  "Interviewing",
  "Hired",
  "Closed",
  "Draft",
] as const;

// Tailwind classes per status (defined here so cards + detail stay consistent).
export const JOB_STATUS_STYLE: Record<string, string> = {
  Hiring: "bg-cyan/10 text-cyan ring-1 ring-cyan/30",
  Interviewing: "bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/30",
  Hired: "bg-blue-500/15 text-blue-500 ring-1 ring-blue-500/40",
  Closed: "bg-steel text-fog ring-1 ring-steel-line",
  Draft: "bg-steel text-fog ring-1 ring-steel-line",
};

// Applications are only open for these statuses.
export function isJobOpen(status?: string): boolean {
  return !status || status === "Hiring" || status === "Interviewing";
}

export const CATEGORIES = [
  // NOTE: JobBoard.tsx hard-codes this first entry as its show-all sentinel —
  // keep the two in sync or the first filter tab returns zero results.
  "All projects",
  "Support agents",
  "RAG & Search",
  "Workflow automation",
  "Voice agents",
  "Data & Analytics",
  "Fine-tuning & Evals",
] as const;

// 30+ remote, hourly-paid roles live in remote-jobs.json so the data is a single
// source of truth (also used by the DB seed script). Spread in ahead of the
// originals so the newest remote listings surface first.
export const JOBS: Job[] = [
  {
    id: "ecommerce-ai-storefront-build",
    title: "AI Storefront + Shopping Agent for a DTC Brand",
    company: "Copperleaf Goods",
    location: "Remote (US)",
    mode: "Remote",
    type: "Contract",
    salary: "$18k fixed",
    category: "Support agents",
    postedDaysAgo: 1,
    humanEdge:
      "A full e-commerce site with a built-in shopping agent that recommends products, answers sizing and returns questions, and recovers carts — the whole storefront, not a bolt-on widget.",
    summary:
      "Design and build a modern e-commerce website with an embedded AI shopping assistant: natural-language product discovery, grounded answers from the catalog and policies, and checkout nudges that lift conversion.",
    responsibilities: [
      "Build the storefront — catalog, cart, and checkout — on a modern web stack",
      "Embed a shopping agent grounded in the product catalog and policies",
      "Wire recommendations and cart recovery with measurable conversion lift",
    ],
    broughtFrom:
      "Stack: Next.js/React, a commerce backend (Shopify/Medusa), an LLM, and retrieval over the catalog.",
    tags: ["E-commerce", "Storefront", "Fixed budget"],
  },
  {
    id: "healthcare-patient-portal-build",
    title: "Patient Portal + Intake Agent for a Clinic Group",
    company: "Cedar Point Health",
    location: "Remote (US)",
    mode: "Remote",
    type: "Contract",
    salary: "$22k fixed",
    category: "Voice agents",
    postedDaysAgo: 2,
    humanEdge:
      "A patient-facing website where people book, fill intake, and ask questions — with a guarded agent that collects history and hands a clean summary to the care team.",
    summary:
      "Build a HIPAA-conscious patient portal with an intake agent: appointment booking, structured history collection over chat or voice, and clinician-ready summaries — with strict guardrails and human escalation.",
    responsibilities: [
      "Build the patient portal — booking, forms, and secure messaging",
      "Add an intake agent that follows a clinical protocol safely",
      "Produce structured, clinician-ready summaries with escalation rules",
    ],
    broughtFrom:
      "Stack: a web stack, an LLM plus voice, structured output, and healthcare-grade guardrails.",
    tags: ["Healthcare", "Patient portal", "Fixed budget"],
  },
  {
    id: "law-firm-site-intake-search-build",
    title: "Law-Firm Website + Client-Intake & Case-Search Agents",
    company: "Hartwell & Cross LLP",
    location: "Remote (US)",
    mode: "Remote",
    type: "Contract",
    salary: "$20k fixed",
    category: "RAG & Search",
    postedDaysAgo: 3,
    humanEdge:
      "A polished firm website with a front-of-site intake agent that qualifies matters and books consults, plus an internal case-search agent that answers over documents with citations — marketing site and legal RAG in one build.",
    summary:
      "Build a law-firm website with two agents: a client-intake agent that qualifies matters and books consultations, and a case-search agent that answers questions over the firm's document corpus with citations.",
    responsibilities: [
      "Build the firm website — practice pages, booking, and intake",
      "Ship an intake agent that qualifies matters and books consults",
      "Add a cited case-search agent over the firm's document corpus",
    ],
    broughtFrom:
      "Stack: a web stack, an LLM, a vector DB, and citation-backed retrieval.",
    tags: ["Legal", "Client intake", "Fixed budget"],
  },
  ...(REMOTE_JOBS_DATA as Job[]),
  {
    id: "legal-rag-support-agent",
    title: "Build a RAG Support Agent for a Legal SaaS",
    company: "Northwind Legal Cloud",
    location: "Austin, TX",
    mode: "Hybrid",
    type: "Contract",
    salary: "$12k fixed",
    category: "RAG & Search",
    postedDaysAgo: 2,
    humanEdge:
      "The agent answers customer questions grounded in 4,000+ pages of contract law docs — with citations, so support reps trust every reply.",
    summary:
      "Ship a retrieval-augmented support agent over their document corpus: chunk and embed the knowledge base, wire up hybrid search, and return cited answers inside their existing help widget.",
    responsibilities: [
      "Stand up an ingestion pipeline for their docs, tickets, and policy PDFs",
      "Build hybrid (vector + keyword) retrieval with citation-backed responses",
      "Add eval harness + guardrails so the agent refuses when unsure",
    ],
    broughtFrom:
      "Stack: Python or TypeScript, a vector DB (pgvector/Pinecone), an LLM API, and solid RAG eval chops.",
    tags: ["RAG", "Citations", "Fixed budget"],
  },
  {
    id: "dental-voice-booking-agent",
    title: "Voice Booking Agent for a Dental Group",
    company: "Brightsmile Dental Partners",
    location: "Columbus, OH",
    mode: "Remote",
    type: "Contract",
    salary: "$8k fixed",
    category: "Voice agents",
    postedDaysAgo: 1,
    humanEdge:
      "A phone agent that books, reschedules, and confirms appointments across 6 clinics — so front-desk staff stop drowning in calls.",
    summary:
      "Build a natural-sounding voice agent that handles inbound scheduling end to end: understands intent, checks live availability, and writes the booking back to their practice-management system.",
    responsibilities: [
      "Design call flows for booking, rescheduling, and reminders",
      "Integrate speech-to-text, an LLM planner, and TTS with low latency",
      "Sync appointments to their PMS and handle graceful human handoff",
    ],
    broughtFrom:
      "Stack: a voice platform (Vapi/Twilio/LiveKit), an LLM, and calendar/PMS API integration experience.",
    tags: ["Voice", "Telephony", "Scheduling"],
  },
  {
    id: "leadgen-workflow-agent",
    title: "Automate Lead-Gen with an LLM Agent",
    company: "Lumen B2B Growth",
    location: "Remote (US)",
    mode: "Remote",
    type: "Contract",
    salary: "$6k/mo retainer",
    category: "Workflow automation",
    postedDaysAgo: 4,
    humanEdge:
      "An agent that researches inbound leads, drafts tailored outreach, and enriches the CRM — freeing the SDR team to actually close.",
    summary:
      "Design and run a multi-step agent workflow that enriches new leads, scores fit, and drafts personalized first-touch emails for human approval. Ongoing retainer to tune and expand it.",
    responsibilities: [
      "Orchestrate a tool-using agent across enrichment, scoring, and drafting steps",
      "Wire it into their CRM and email tooling with human-in-the-loop approval",
      "Monitor, evaluate, and iterate on prompt + tool performance monthly",
    ],
    broughtFrom:
      "Stack: an agent framework (LangGraph/CrewAI or custom), CRM APIs, and prompt-engineering discipline.",
    tags: ["Agents", "Retainer", "CRM"],
  },
  {
    id: "ecommerce-support-triage-agent",
    title: "Support Triage Agent for a DTC Brand",
    company: "Harbor Goods Co.",
    location: "Remote (US)",
    mode: "Remote",
    type: "Contract",
    salary: "$9k fixed",
    category: "Support agents",
    postedDaysAgo: 6,
    humanEdge:
      "The agent reads every incoming ticket, resolves the easy 60%, and routes the rest with a drafted reply — so a 3-person team handles 10x volume.",
    summary:
      "Build a support agent that auto-resolves order-status, returns, and FAQ tickets against their help center and order data, and hands complex cases to humans with context attached.",
    responsibilities: [
      "Classify and route inbound tickets by intent and urgency",
      "Auto-draft grounded replies using order data + help-center content",
      "Instrument deflection rate and CSAT so wins are measurable",
    ],
    broughtFrom:
      "Stack: a helpdesk API (Zendesk/Gorgias), an LLM, retrieval over order + KB data.",
    tags: ["Support agents", "Deflection", "Fixed budget"],
  },
  {
    id: "ops-analytics-agent",
    title: "Analytics Agent That Answers 'Why Did Revenue Dip?'",
    company: "Meridian Retail Analytics",
    location: "Remote (US)",
    mode: "Remote",
    type: "Contract",
    salary: "$140 / hr",
    category: "Data & Analytics",
    postedDaysAgo: 3,
    humanEdge:
      "A text-to-SQL agent that lets ops leads ask their warehouse plain-English questions and get charts back — no analyst in the loop.",
    summary:
      "Build a conversational analytics agent over their data warehouse: translate questions to safe SQL, run it, and return summarized answers with the chart and the query it used.",
    responsibilities: [
      "Build a schema-aware text-to-SQL agent with read-only guardrails",
      "Validate results and surface the SQL + a plain-English explanation",
      "Add an eval set of real business questions to catch regressions",
    ],
    broughtFrom:
      "Stack: SQL + a warehouse (Snowflake/BigQuery/Postgres), an LLM, and text-to-SQL eval experience.",
    tags: ["Text-to-SQL", "Hourly", "Analytics"],
  },
  {
    id: "domain-eval-harness-build",
    title: "Build an Eval Harness for a Medical LLM App",
    company: "Rosewood Health AI",
    location: "Remote (US)",
    mode: "Remote",
    type: "Contract",
    salary: "$10k fixed",
    category: "Fine-tuning & Evals",
    postedDaysAgo: 5,
    humanEdge:
      "Before they ship, they need to know the model is right — an eval suite that scores clinical accuracy and safety on every prompt change.",
    summary:
      "Stand up an automated evaluation pipeline for their patient-intake assistant: build a graded test set, wire LLM-as-judge scoring, and gate deploys on the results in CI.",
    responsibilities: [
      "Assemble a labeled eval set with domain experts and rubrics",
      "Implement LLM-as-judge + rule-based scoring for accuracy and safety",
      "Integrate the harness into CI so regressions block release",
    ],
    broughtFrom:
      "Stack: an eval framework (Braintrust/Promptfoo/custom), LLM-as-judge design, and CI integration.",
    tags: ["Evals", "LLM-as-judge", "Safety"],
  },
  {
    id: "docs-search-mcp-integration",
    title: "Internal Docs Search Agent + MCP Integration",
    company: "Foundry DevTools",
    location: "Remote (US/EU)",
    mode: "Remote",
    type: "Contract",
    salary: "$7.5k fixed",
    category: "RAG & Search",
    postedDaysAgo: 8,
    humanEdge:
      "Engineers ask questions in Slack and get answers pulled from Notion, GitHub, and Confluence — with an MCP server other tools can reuse.",
    summary:
      "Build a search agent over their scattered internal knowledge and expose it as an MCP server so their IDE and Slack bot can both query it. Freshness and access control matter.",
    responsibilities: [
      "Index Notion, GitHub, and Confluence with incremental sync",
      "Expose retrieval as an MCP server with per-user access scoping",
      "Ship a Slack entry point with cited, permission-aware answers",
    ],
    broughtFrom:
      "Stack: TypeScript, MCP server building, a vector store, and OAuth/permission handling.",
    tags: ["MCP", "RAG", "Internal tools"],
  },
  {
    id: "invoice-processing-workflow-agent",
    title: "Invoice Processing Agent for a Logistics Firm",
    company: "Tideline Freight",
    location: "Denver, CO",
    mode: "Hybrid",
    type: "Contract",
    salary: "$11k fixed",
    category: "Workflow automation",
    postedDaysAgo: 1,
    humanEdge:
      "An agent that reads messy PDF invoices, extracts line items, matches them to POs, and flags mismatches — killing hours of manual entry.",
    summary:
      "Build a document-processing agent that ingests supplier invoices, extracts structured data, reconciles against purchase orders, and pushes clean records into their accounting system.",
    responsibilities: [
      "Extract structured fields from varied invoice PDFs with an LLM + vision",
      "Reconcile line items against POs and flag exceptions for review",
      "Write validated records to their accounting API with an audit trail",
    ],
    broughtFrom:
      "Stack: document/vision extraction, an LLM, and accounting-system API integration.",
    tags: ["Document AI", "Automation", "Fixed budget"],
  },
];

export function getJob(id: string): Job | undefined {
  return JOBS.find((j) => j.id === id);
}
