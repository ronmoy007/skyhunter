import Link from "next/link";

// A slim top strip stating what the studio does, with a direct path to start a
// project. Rendered inside the sticky header so it's always visible.
export function LarkBar() {
  return (
    <div className="border-b border-blue-500/20 bg-blue-500/10">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-6 py-2 text-sm">
        <span className="text-center text-mist">
          We build <span className="font-semibold text-chrome">e-commerce, healthcare &amp; law</span>{" "}
          websites, AI agents, and LLM apps for startups and agencies.
        </span>
        <Link
          href="/start"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-400"
        >
          Start a project
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path
              d="M4 10h11m0 0-4-4m4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
