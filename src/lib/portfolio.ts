// Portfolio data — the source of truth for both the /portfolio grid and each
// /portfolio/[slug] detail page. Every project ships with a short card body
// plus a full case-study payload (overview, highlights, metrics, the
// challenge/approach/outcome narrative, feature breakdown, stack, and a quote).

export type PortfolioProject = {
  name: string;
  slug: string;
  tagline: string;
  category: string;
  /** One-line card body on the grid. */
  body: string;

  // ---- Detail (case study) ----
  /** Longer hero paragraph on the detail page. */
  summary: string;
  client: string;
  timeline: string;
  role: string;
  platforms: string[];

  overviewTitle: string;
  overview: string;

  highlights: string[];
  metrics: { n: string; l: string }[];

  challenge: string;
  approach: string;
  outcome: string;

  features: { title: string; body: string }[];
  stack: string[];

  quote: string;
  quoteBy: string;
};

export const PROJECTS: PortfolioProject[] = [
  {
    name: "Aptivo AI",
    slug: "aptivo-ai",
    tagline: "An AI sales agent that never sleeps",
    category: "AI",
    body: "A production AI assistant platform with retrieval and evaluation built in — qualifying, answering, and following up around the clock.",
    summary:
      "We partnered with Aptivo to turn a promising demo into a production sales agent — one that qualifies, answers, and follows up around the clock, and can be trusted with real prospects.",
    client: "Aptivo",
    timeline: "14 weeks",
    role: "Product design, AI engineering, evals",
    platforms: ["Web widget", "Dashboard", "API"],
    overviewTitle: "A demo that dazzled, but couldn't be trusted at scale",
    overview:
      "The first prototype impressed everyone in the room and fell apart the moment real prospects arrived. Answers drifted, claims went uncited, and no one could tell a good response from a confident wrong one. Aptivo needed the same magic with production guardrails.",
    highlights: [
      "Rebuilt the agent core around retrieval for grounded, traceable answers",
      "Shipped an evaluation harness that scores every response against real tasks",
      "Delivered an embeddable widget that drops into any site in minutes",
      "Added validation and audit logging on every action the agent takes",
    ],
    metrics: [
      { n: "3.4×", l: "More qualified leads vs. static forms" },
      { n: "<2s", l: "Median response time" },
      { n: "24/7", l: "Coverage, no staffing" },
      { n: "92%", l: "Answer groundedness" },
    ],
    challenge:
      "A sales agent that invents a price, a policy, or a promise doesn't just lose the deal — it erodes trust in the whole product. Every answer had to be grounded, fast, and safe under messy, real-world questions.",
    approach:
      "We rebuilt the core around retrieval over Aptivo's own content, wrapped it in an eval harness tied to real sales tasks, and added guardrails plus human handoff for anything outside the agent's lane.",
    outcome:
      "Aptivo now runs a sales agent that qualifies leads, answers grounded questions in under two seconds, and hands off cleanly when it should — with dashboards that prove it's staying honest as traffic grows.",
    features: [
      { title: "Grounded answers", body: "Retrieval over live content so every reply is traceable to a source." },
      { title: "Eval harness", body: "Automated scoring against real tasks catches regressions before they ship." },
      { title: "Embeddable widget", body: "A drop-in script that matches any brand and loads instantly." },
      { title: "Lead qualification", body: "Structured capture that routes hot prospects to the right rep." },
      { title: "Human handoff", body: "Clean escalation the moment a query crosses the agent's boundary." },
      { title: "Audit logging", body: "Every action recorded, so the team can review and improve with confidence." },
    ],
    stack: ["Claude", "OpenAI", "RAG", "Vector search", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Evals", "Tracing"],
    quote:
      "The AI implementation quality exceeded our expectations — it finally feels like something we can put in front of customers.",
    quoteBy: "Adrian Cole, CEO",
  },
  {
    name: "Streamvue",
    slug: "streamvue",
    tagline: "Live television that scales to millions",
    category: "Streaming",
    body: "Scalable live and on-demand streaming with adaptive delivery that holds quality from a handful of viewers to millions.",
    summary:
      "We helped Streamvue build a live and on-demand video platform that keeps its picture crisp and its latency low whether a hundred people are watching or a million.",
    client: "Streamvue",
    timeline: "18 weeks",
    role: "Platform architecture, streaming, frontend",
    platforms: ["Web", "iOS", "Android", "TV apps"],
    overviewTitle: "Great content, buffering at the worst moment",
    overview:
      "Streamvue's audience was growing faster than its infrastructure could handle. Big live moments — exactly when it mattered most — meant buffering, drops, and refunds. They needed delivery that got stronger under load, not weaker.",
    highlights: [
      "Adaptive bitrate delivery that holds quality across every network",
      "A live pipeline engineered for sudden, spiky audience surges",
      "A unified player shared across web, mobile, and TV",
      "Real-time quality-of-experience monitoring on every stream",
    ],
    metrics: [
      { n: "1M+", l: "Concurrent viewers" },
      { n: "3s", l: "Glass-to-glass latency" },
      { n: "99.99%", l: "Stream uptime" },
      { n: "-46%", l: "Rebuffer rate" },
    ],
    challenge:
      "Live streaming punishes every weak link. A spike in viewers can't turn into a spike in buffering, and quality has to hold on a phone in a tunnel as well as a fiber connection at home.",
    approach:
      "We built an adaptive-bitrate pipeline with edge delivery and aggressive caching, a single cross-platform player, and QoE telemetry that lets the team see and fix problems in real time.",
    outcome:
      "Streamvue now carries seven-figure concurrent audiences with three-second latency and a fraction of the rebuffering — big live nights are a growth event, not an outage.",
    features: [
      { title: "Adaptive delivery", body: "Bitrate that adjusts per viewer to keep playback smooth on any network." },
      { title: "Live pipeline", body: "Ingest-to-edge architecture tuned for sudden audience surges." },
      { title: "Unified player", body: "One player codebase across web, mobile, and living-room apps." },
      { title: "Edge caching", body: "Content served close to viewers for low latency worldwide." },
      { title: "QoE monitoring", body: "Real-time quality metrics surface issues before viewers complain." },
      { title: "DVR & VOD", body: "Instant replay and on-demand libraries from the same pipeline." },
    ],
    stack: ["HLS", "WebRTC", "FFmpeg", "CDN", "Next.js", "React Native", "Go", "Redis", "Grafana"],
    quote:
      "Our biggest live night used to be our scariest. Now it's just another Tuesday that happens to break records.",
    quoteBy: "Mara Whitfield, VP Engineering",
  },
  {
    name: "Novalith Labs",
    slug: "novalith-labs",
    tagline: "On-chain trust, engineered to audit grade",
    category: "Blockchain",
    body: "A smart-contract platform with secure wallet integration and audit-grade controls baked in from day one.",
    summary:
      "We built Novalith a smart-contract platform where security and auditability aren't a final review step — they're designed into every layer from the first commit.",
    client: "Novalith Labs",
    timeline: "16 weeks",
    role: "Smart contracts, security, frontend",
    platforms: ["Web app", "Wallet integrations", "API"],
    overviewTitle: "In on-chain, one bug is one breach",
    overview:
      "Novalith was shipping contracts faster than they could review them, and in web3 an unreviewed line can drain a treasury. They needed a platform that made the secure path the default path.",
    highlights: [
      "Secure wallet integration with clear, human-readable signing",
      "Audit-grade controls and access policies baked into the core",
      "Automated contract checks in CI on every change",
      "Transparent on-chain activity with full traceability",
    ],
    metrics: [
      { n: "0", l: "Critical incidents post-launch" },
      { n: "100%", l: "Contracts covered by tests" },
      { n: "3", l: "External audits passed" },
      { n: "40%", l: "Faster safe shipping" },
    ],
    challenge:
      "Smart contracts are immutable and adversarial — attackers probe them the moment they're live. Every control, permission, and edge case had to be right before deploy, not patched after.",
    approach:
      "We designed least-privilege access into the contracts, added static analysis and property tests to CI, and built signing flows that show users exactly what they're approving.",
    outcome:
      "Novalith ships contracts through three external audits with zero critical incidents — and their team moves faster because the guardrails catch mistakes long before mainnet.",
    features: [
      { title: "Wallet integration", body: "Connect flows with clear, human-readable transaction signing." },
      { title: "Access controls", body: "Least-privilege permissions enforced at the contract level." },
      { title: "CI checks", body: "Static analysis and property tests gate every change." },
      { title: "Audit trail", body: "Full on-chain traceability for every action and approval." },
      { title: "Test coverage", body: "Comprehensive suites so behavior is verified before deploy." },
      { title: "Monitoring", body: "Live alerting on anomalous contract activity." },
    ],
    stack: ["Solidity", "Hardhat", "Ethers.js", "Slither", "Next.js", "TypeScript", "The Graph", "PostgreSQL"],
    quote:
      "They treated our contracts like production infrastructure from day one. Our auditors had almost nothing to flag.",
    quoteBy: "Devin Rao, Founder",
  },
  {
    name: "Peakline",
    slug: "peakline",
    tagline: "Infrastructure that never takes a night off",
    category: "Cloud",
    body: "A resilient cloud platform with automated CI/CD pipelines, so deploys are boring and uptime is the default.",
    summary:
      "We gave Peakline a cloud platform where deploys are boring, rollbacks are one click, and uptime is simply the default state — freeing their team to build instead of firefight.",
    client: "Peakline",
    timeline: "12 weeks",
    role: "Platform engineering, DevOps, tooling",
    platforms: ["Cloud", "CLI", "Dashboard"],
    overviewTitle: "Every deploy was a held breath",
    overview:
      "Peakline's releases were manual, risky, and mostly done at night to limit the blast radius. Fear of deploying had become a tax on every feature the team wanted to ship.",
    highlights: [
      "Automated CI/CD with safe, one-click rollbacks",
      "Infrastructure as code, reproducible across every environment",
      "Zero-downtime deploys with health-gated rollouts",
      "Observability wired into services from the start",
    ],
    metrics: [
      { n: "12×", l: "More frequent deploys" },
      { n: "99.99%", l: "Uptime" },
      { n: "90s", l: "Mean time to rollback" },
      { n: "0", l: "Midnight deploy windows" },
    ],
    challenge:
      "When shipping is scary, teams ship less and problems pile up. Peakline needed releases so safe and repeatable that anyone could deploy in the middle of the day without a second thought.",
    approach:
      "We codified their infrastructure, built a CI/CD pipeline with automated checks and health-gated rollouts, and added rollbacks and observability so failures are caught and reverted in seconds.",
    outcome:
      "Peakline deploys twelve times more often, in daylight, with a ninety-second path back if anything looks wrong — uptime went up while the stress went away.",
    features: [
      { title: "CI/CD pipeline", body: "Automated build, test, and release on every merge." },
      { title: "One-click rollback", body: "Revert a bad release in seconds, not an incident call." },
      { title: "Infra as code", body: "Reproducible environments with no snowflake servers." },
      { title: "Zero-downtime deploys", body: "Health-gated rollouts that never drop traffic." },
      { title: "Observability", body: "Metrics, logs, and traces baked into every service." },
      { title: "Autoscaling", body: "Capacity that follows demand without manual tuning." },
    ],
    stack: ["AWS", "Terraform", "Kubernetes", "Docker", "GitHub Actions", "Prometheus", "Grafana", "Go"],
    quote:
      "We went from deploying at midnight and hoping, to deploying at lunch and forgetting about it. That's the whole story.",
    quoteBy: "Priya Nandakumar, Head of Platform",
  },
  {
    name: "RetailHub",
    slug: "retailhub",
    tagline: "A storefront rebuilt for speed and scale",
    category: "E-commerce",
    body: "A high-volume storefront rebuilt for speed and conversion — faster pages, smoother checkout, more completed carts.",
    summary:
      "We rebuilt RetailHub's storefront from the ground up for speed and conversion — faster pages, a smoother checkout, and a search experience that actually finds what shoppers want.",
    client: "RetailHub",
    timeline: "14 weeks",
    role: "Frontend, commerce, performance",
    platforms: ["Web", "Mobile web", "PWA"],
    overviewTitle: "A fast-growing store on a slow foundation",
    overview:
      "RetailHub's traffic was climbing but its conversion rate wasn't. Heavy pages, a clunky checkout, and weak search meant shoppers bounced before they bought — especially on mobile.",
    highlights: [
      "Headless storefront rebuilt for Core Web Vitals",
      "A streamlined, fewer-step checkout tuned for mobile",
      "Semantic search and merchandising over a large catalog",
      "Live inventory and pricing surfaced everywhere it matters",
    ],
    metrics: [
      { n: "+28%", l: "Conversion rate" },
      { n: "0.9s", l: "Largest Contentful Paint" },
      { n: "-35%", l: "Cart abandonment" },
      { n: "50k", l: "SKUs, searchable instantly" },
    ],
    challenge:
      "At this scale, every hundred milliseconds and every extra checkout step costs real revenue. The rebuild had to be dramatically faster and easier without losing the catalog depth shoppers relied on.",
    approach:
      "We moved to a headless, edge-rendered storefront, rebuilt checkout around fewer steps and saved details, and layered semantic search plus merchandising over the full catalog.",
    outcome:
      "RetailHub's pages load in under a second, checkout abandons far less often, and conversion is up double digits — the same traffic now turns into meaningfully more completed carts.",
    features: [
      { title: "Headless storefront", body: "Edge-rendered pages that hit top Core Web Vitals scores." },
      { title: "Fast checkout", body: "Fewer steps, saved details, and mobile-first flows." },
      { title: "Semantic search", body: "Shoppers find the right product even with fuzzy queries." },
      { title: "Live inventory", body: "Real stock and pricing shown across the whole store." },
      { title: "Merchandising", body: "Rules and ranking that put the right items first." },
      { title: "Analytics", body: "Funnel insight that shows exactly where carts are won and lost." },
    ],
    stack: ["Next.js", "Shopify", "TypeScript", "Algolia", "Tailwind", "Vercel", "GraphQL"],
    quote:
      "Same traffic, a lot more revenue. The speed alone paid for the whole project in the first quarter.",
    quoteBy: "Julian Meyers, Director of E-commerce",
  },
  {
    name: "DataForge",
    slug: "dataforge",
    tagline: "Pipelines your whole team can trust",
    category: "Data",
    body: "A data platform that turns scattered sources into trusted, real-time pipelines the whole team can build on.",
    summary:
      "We built DataForge a platform that turns scattered, unreliable sources into trusted, real-time pipelines — so every team makes decisions on numbers they can actually believe.",
    client: "DataForge",
    timeline: "16 weeks",
    role: "Data engineering, platform, tooling",
    platforms: ["Cloud", "Dashboard", "API"],
    overviewTitle: "Three teams, three different truths",
    overview:
      "Every team at DataForge had its own copy of the numbers, and none of them agreed. Reports contradicted each other, trust in the data eroded, and simple questions took days to answer.",
    highlights: [
      "A unified pipeline from raw sources to trusted tables",
      "Data quality tests and freshness checks on every model",
      "Real-time streaming for the metrics that can't wait",
      "Self-serve access so teams answer their own questions",
    ],
    metrics: [
      { n: "1", l: "Source of truth" },
      { n: "-80%", l: "Time to a trusted answer" },
      { n: "99.5%", l: "Pipeline reliability" },
      { n: "200+", l: "Tested data models" },
    ],
    challenge:
      "When people can't trust the data, they stop using it — and start guessing. DataForge needed one reliable pipeline and the tests to prove, continuously, that it stayed correct.",
    approach:
      "We consolidated sources into a modeled warehouse, wrapped every model in quality and freshness tests, added streaming for time-sensitive metrics, and opened self-serve access with guardrails.",
    outcome:
      "DataForge now runs on a single source of truth that teams trust — answers that took days take minutes, and the pipeline proves its own reliability on every run.",
    features: [
      { title: "Unified pipeline", body: "Raw sources modeled into clean, trusted tables." },
      { title: "Quality tests", body: "Every model checked for correctness and freshness." },
      { title: "Streaming", body: "Real-time metrics for decisions that can't wait for a batch." },
      { title: "Self-serve", body: "Teams explore and answer their own questions safely." },
      { title: "Lineage", body: "Full traceability from a number back to its source." },
      { title: "Alerting", body: "Broken data pages the right owner before it spreads." },
    ],
    stack: ["Snowflake", "dbt", "Airflow", "Kafka", "Python", "BigQuery", "Looker", "PostgreSQL"],
    quote:
      "For the first time, every team is arguing about what to do — not about whose numbers are right.",
    quoteBy: "Nadia Okonkwo, Head of Data",
  },
  {
    name: "PulseCast",
    slug: "pulsecast",
    tagline: "Live audio that sounds like the room",
    category: "Streaming",
    body: "Live audio rooms and podcasts that keep studio quality for thousands of simultaneous listeners.",
    summary:
      "We built PulseCast a live-audio platform where thousands of listeners share a room in real time and it still sounds like everyone's in the same studio.",
    client: "PulseCast",
    timeline: "13 weeks",
    role: "Realtime audio, platform, frontend",
    platforms: ["Web", "iOS", "Android"],
    overviewTitle: "Great conversations, ruined by the connection",
    overview:
      "PulseCast's live rooms were compelling until they filled up — then latency climbed, audio dropped, and the magic of a real conversation fell apart. They needed studio quality that held at scale.",
    highlights: [
      "Low-latency live audio rooms for large audiences",
      "Studio-grade sound with noise suppression and leveling",
      "Recording and instant on-demand publishing",
      "Resilient playback that rides out shaky networks",
    ],
    metrics: [
      { n: "10k", l: "Listeners per room" },
      { n: "<200ms", l: "Speaker latency" },
      { n: "99.9%", l: "Session uptime" },
      { n: "4.8★", l: "Listener rating" },
    ],
    challenge:
      "Live audio is unforgiving — a half-second of latency or a dropped syllable breaks the conversation. Quality had to hold from a small room to a stadium-sized audience.",
    approach:
      "We built the rooms on a realtime audio stack with noise suppression and automatic leveling, added resilient buffering for weak networks, and wired recording straight into on-demand publishing.",
    outcome:
      "PulseCast now hosts ten-thousand-listener rooms with sub-200ms speaker latency and studio-clean sound — and every live session becomes an on-demand episode the moment it ends.",
    features: [
      { title: "Live rooms", body: "Real-time audio spaces that scale to large audiences." },
      { title: "Studio sound", body: "Noise suppression and leveling for clean, even audio." },
      { title: "Resilient playback", body: "Smart buffering that survives shaky connections." },
      { title: "Recording", body: "Every session captured for instant replay." },
      { title: "On-demand", body: "Live shows become podcasts the moment they end." },
      { title: "Moderation", body: "Host controls to keep rooms safe and on-topic." },
    ],
    stack: ["WebRTC", "Opus", "LiveKit", "Next.js", "React Native", "Go", "Redis"],
    quote:
      "It finally sounds the way the conversation feels. Our hosts stopped apologizing for the audio.",
    quoteBy: "Sasha Berg, Product Lead",
  },
  {
    name: "Veridex",
    slug: "veridex",
    tagline: "Answers pulled straight from your documents",
    category: "AI",
    body: "Document intelligence that turns messy files into structured, cited answers your team can actually trust.",
    summary:
      "We built Veridex a document-intelligence engine that turns piles of messy files into structured, cited answers — so teams stop searching and start trusting.",
    client: "Veridex",
    timeline: "15 weeks",
    role: "AI engineering, RAG, product",
    platforms: ["Web app", "API", "Integrations"],
    overviewTitle: "The answer exists — buried in ten thousand files",
    overview:
      "Veridex's users had the information they needed, somewhere, across contracts, PDFs, and scanned pages. Finding it meant hours of manual search, and generic AI tools answered confidently but without proof.",
    highlights: [
      "Retrieval over messy, mixed-format document sets",
      "Every answer cited back to the exact source passage",
      "Structured extraction from unstructured files",
      "Evals that keep answers honest as content grows",
    ],
    metrics: [
      { n: "94%", l: "Answer accuracy" },
      { n: "-85%", l: "Time to find an answer" },
      { n: "100%", l: "Answers with citations" },
      { n: "1M+", l: "Documents indexed" },
    ],
    challenge:
      "In document intelligence, an uncited answer is worthless — teams need to verify it. The system had to handle messy formats, scale to millions of files, and prove every claim it made.",
    approach:
      "We built a retrieval pipeline with layout-aware parsing, grounded every answer in cited passages, added structured extraction, and tied an eval suite to real user questions.",
    outcome:
      "Veridex users get accurate, cited answers in seconds instead of hours — and because every claim links to its source, they can trust the system enough to act on it.",
    features: [
      { title: "Document RAG", body: "Retrieval over mixed formats, including scanned files." },
      { title: "Citations", body: "Every answer links to the exact passage it came from." },
      { title: "Extraction", body: "Structured fields pulled from unstructured documents." },
      { title: "Eval suite", body: "Continuous scoring keeps accuracy from drifting." },
      { title: "Integrations", body: "Connect existing document stores in minutes." },
      { title: "Access control", body: "Answers respect who's allowed to see what." },
    ],
    stack: ["Claude", "RAG", "pgvector", "OCR", "Next.js", "TypeScript", "Python", "PostgreSQL", "Evals"],
    quote:
      "The citations are what sold our team. It's not a black box — we can check every answer in one click.",
    quoteBy: "Tomas Ligeti, VP Product",
  },
  {
    name: "MediKind",
    slug: "medikind",
    tagline: "Care that reaches every patient, safely",
    category: "Healthcare",
    body: "A compliant telehealth system connecting patients and providers, with guardrails and privacy built in.",
    summary:
      "We built MediKind a telehealth platform that connects patients and providers with compliance, privacy, and guardrails designed in — care that reaches further without cutting corners.",
    client: "MediKind",
    timeline: "20 weeks",
    role: "Product, compliance engineering, AI",
    platforms: ["Web", "iOS", "Android", "Provider portal"],
    overviewTitle: "More demand for care than hours to give it",
    overview:
      "MediKind's providers were overwhelmed, and patients waited days for simple answers. They needed to extend care with technology — including AI — without ever risking safety or privacy.",
    highlights: [
      "HIPAA-minded architecture with PHI protected end to end",
      "Triage and scheduling agents with clear escalation paths",
      "Human-in-the-loop review on anything clinical",
      "Accessible patient experience across web and mobile",
    ],
    metrics: [
      { n: "-63%", l: "Time to first response" },
      { n: "100%", l: "Clinical outputs reviewed" },
      { n: "4.9★", l: "Patient satisfaction" },
      { n: "0", l: "Privacy incidents" },
    ],
    challenge:
      "Healthcare punishes ambiguity — an agent can't guess at advice, diagnose, or leak PHI. Every automated step needed strict guardrails, audit trails, and a human wherever it counted.",
    approach:
      "We built a HIPAA-minded platform with PHI encryption throughout, triage and scheduling agents that escalate to staff for anything clinical, and audit logging on every interaction.",
    outcome:
      "MediKind now answers patients in a fraction of the time, routes urgent cases to the right provider, and keeps clinicians in the loop on everything that matters — with a clean privacy record.",
    features: [
      { title: "Secure messaging", body: "PHI-safe communication between patients and providers." },
      { title: "Triage agent", body: "Gathers symptoms and routes urgent cases to staff fast." },
      { title: "Scheduling", body: "Self-serve booking that respects provider availability." },
      { title: "Human review", body: "Clinicians sign off on anything clinical, always." },
      { title: "Audit trails", body: "Every interaction logged for compliance and review." },
      { title: "Accessibility", body: "A patient experience that works for everyone." },
    ],
    stack: ["Next.js", "TypeScript", "Claude", "PostgreSQL", "FHIR", "AWS", "Twilio"],
    quote:
      "They understood that in healthcare, safe is the feature. The guardrails were never an afterthought.",
    quoteBy: "Dr. Helena Voss, Chief Medical Officer",
  },
  {
    name: "Bazaar",
    slug: "bazaar",
    tagline: "A marketplace sellers actually stay on",
    category: "E-commerce",
    body: "A multi-vendor marketplace built for thousands of sellers and fast, frictionless checkout.",
    summary:
      "We built Bazaar a multi-vendor marketplace that thousands of sellers actually want to stay on — fast to list, fair to operate, and frictionless to buy from.",
    client: "Bazaar",
    timeline: "17 weeks",
    role: "Marketplace platform, payments, frontend",
    platforms: ["Web", "Mobile web", "Seller app"],
    overviewTitle: "Sellers signed up, then quietly left",
    overview:
      "Bazaar could attract sellers but couldn't keep them. Clumsy onboarding, slow payouts, and weak tools meant vendors listed a few items and drifted away, taking their catalog with them.",
    highlights: [
      "Fast seller onboarding and bulk listing tools",
      "Reliable split payments and transparent payouts",
      "Unified search and discovery across every vendor",
      "A checkout built for speed across mixed carts",
    ],
    metrics: [
      { n: "5k+", l: "Active sellers" },
      { n: "+41%", l: "Seller retention" },
      { n: "T+2", l: "Payout speed" },
      { n: "-30%", l: "Checkout drop-off" },
    ],
    challenge:
      "A marketplace lives or dies on both sides at once — buyers need selection and speed, sellers need tools and trust. Bazaar had to serve both without the platform buckling under thousands of vendors.",
    approach:
      "We rebuilt onboarding and listing for speed, added dependable split payments with clear payouts, unified search across vendors, and streamlined a checkout that handles mixed carts smoothly.",
    outcome:
      "Bazaar now retains far more of its sellers, moves payouts in two days, and converts shoppers through a checkout that stopped leaking — a marketplace both sides want to keep using.",
    features: [
      { title: "Seller onboarding", body: "List fast with bulk tools and guided setup." },
      { title: "Split payments", body: "Reliable payouts and transparent fees for every vendor." },
      { title: "Unified search", body: "Discovery across the whole marketplace, not per-store silos." },
      { title: "Fast checkout", body: "Smooth purchase flow even with mixed-vendor carts." },
      { title: "Seller analytics", body: "Vendors see what sells and why, in real time." },
      { title: "Trust & safety", body: "Reviews, ratings, and dispute handling built in." },
    ],
    stack: ["Next.js", "TypeScript", "Stripe Connect", "PostgreSQL", "Algolia", "Redis", "Vercel"],
    quote:
      "Our sellers stopped churning because the platform finally works for them, not just for buyers.",
    quoteBy: "Ren Takahashi, COO",
  },
  {
    name: "Aegis Protocol",
    slug: "aegis-protocol",
    tagline: "Every contract, adversarially reviewed",
    category: "Blockchain",
    body: "Automated smart-contract auditing that hunts down exploits before anything ships to mainnet.",
    summary:
      "We built Aegis an automated auditing platform that thinks like an attacker — hunting down smart-contract exploits before a single line reaches mainnet.",
    client: "Aegis Protocol",
    timeline: "15 weeks",
    role: "Security tooling, AI, platform",
    platforms: ["Web app", "CI integration", "API"],
    overviewTitle: "Manual audits couldn't keep up with the code",
    overview:
      "Aegis's clients shipped contracts faster than human auditors could review them, and each unreviewed deploy was a gamble. They needed automated, adversarial analysis that scaled with the code.",
    highlights: [
      "Automated adversarial analysis of every contract",
      "Exploit detection wired directly into CI",
      "Clear, prioritized findings with reproduction steps",
      "Continuous re-checks as contracts evolve",
    ],
    metrics: [
      { n: "1,200+", l: "Vulnerabilities caught" },
      { n: "-70%", l: "Manual review time" },
      { n: "0", l: "Exploits shipped to mainnet" },
      { n: "24/7", l: "Continuous scanning" },
    ],
    challenge:
      "Smart-contract exploits are subtle, adversarial, and expensive — one missed reentrancy bug can drain millions. Detection had to be thorough, fast, and trustworthy enough to gate real deploys.",
    approach:
      "We combined static analysis, symbolic execution, and AI-assisted review into a pipeline that runs in CI, produces prioritized findings with reproductions, and re-checks contracts as they change.",
    outcome:
      "Aegis catches over a thousand vulnerabilities before mainnet, cuts manual review time by seventy percent, and gives teams the confidence to ship — with an attacker's-eye review on every commit.",
    features: [
      { title: "Adversarial analysis", body: "Automated review that probes contracts like an attacker." },
      { title: "CI integration", body: "Exploit checks gate every pull request." },
      { title: "Prioritized findings", body: "Clear severity and reproduction steps for each issue." },
      { title: "Symbolic execution", body: "Explores edge-case paths humans miss." },
      { title: "Continuous scans", body: "Re-audits contracts automatically as they evolve." },
      { title: "Reporting", body: "Audit-ready reports for stakeholders and reviewers." },
    ],
    stack: ["Solidity", "Slither", "Mythril", "Claude", "Python", "Next.js", "TypeScript", "GitHub Actions"],
    quote:
      "It's like having a tireless red team on every commit. We ship with a confidence we didn't have before.",
    quoteBy: "Ivo Karlsson, Security Lead",
  },
  {
    name: "Learnly",
    slug: "learnly",
    tagline: "Learning that adapts to every student",
    category: "Education",
    body: "An adaptive learning platform that keeps students engaged and progressing at their own pace.",
    summary:
      "We built Learnly an adaptive learning platform that meets every student where they are — pacing lessons, filling gaps, and keeping motivation high the whole way through.",
    client: "Learnly",
    timeline: "16 weeks",
    role: "Product, AI, frontend",
    platforms: ["Web", "iOS", "Android"],
    overviewTitle: "One pace can't fit every learner",
    overview:
      "Learnly's fixed curriculum lost students at both ends — the ones who needed more time fell behind, and the ones who moved fast got bored. Engagement dropped and so did completion.",
    highlights: [
      "Adaptive pathways that adjust to each learner in real time",
      "AI tutoring that explains, hints, and encourages",
      "Mastery tracking that targets the next best lesson",
      "Engagement mechanics that keep students coming back",
    ],
    metrics: [
      { n: "+52%", l: "Course completion" },
      { n: "2.3×", l: "Time on platform" },
      { n: "+34%", l: "Assessment scores" },
      { n: "4.9★", l: "Student rating" },
    ],
    challenge:
      "Adaptive learning is hard to get right — push too fast and students give up, too slow and they disengage. The platform had to read each learner and adjust without feeling mechanical.",
    approach:
      "We built adaptive pathways driven by mastery signals, added an AI tutor that explains and encourages, and designed engagement mechanics that reward progress at every level.",
    outcome:
      "Learnly students complete far more of what they start, spend more time learning, and score higher — because the platform finally moves at each learner's own pace.",
    features: [
      { title: "Adaptive pathways", body: "Lessons that adjust in real time to each learner." },
      { title: "AI tutor", body: "On-demand explanations, hints, and encouragement." },
      { title: "Mastery tracking", body: "Targets the next best lesson from what a student knows." },
      { title: "Engagement", body: "Streaks and rewards that keep learners motivated." },
      { title: "Progress insight", body: "Clear dashboards for students and educators." },
      { title: "Content tools", body: "Authoring that makes adaptive courses easy to build." },
    ],
    stack: ["Next.js", "TypeScript", "Claude", "PostgreSQL", "React Native", "Redis", "Vercel"],
    quote:
      "Students who used to quit are finishing courses now. Meeting them at their pace changed everything.",
    quoteBy: "Amara Diallo, Head of Learning",
  },
];

export function getProject(slug: string): PortfolioProject | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

// Category → accent classes for the chips, kept in the brand's blue/cyan family.
export const CAT_STYLE: Record<string, string> = {
  AI: "bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/25",
  Streaming: "bg-cyan/10 text-cyan ring-1 ring-cyan/30",
  Blockchain: "bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/25",
  Cloud: "bg-cyan/10 text-cyan ring-1 ring-cyan/30",
  "E-commerce": "bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/25",
  Data: "bg-cyan/10 text-cyan ring-1 ring-cyan/30",
  Healthcare: "bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/25",
  Education: "bg-cyan/10 text-cyan ring-1 ring-cyan/30",
};
