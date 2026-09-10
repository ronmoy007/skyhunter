import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-5 py-28 text-center">
      <span className="sky-text font-display text-6xl font-semibold tracking-tight">
        Off course
      </span>
      <h1 className="mt-4 font-display text-3xl font-semibold text-chrome">
        This page drifted off the map — but you didn&apos;t.
      </h1>
      <p className="mt-3 text-mist">
        The link may be old or the page may have moved. Our services and recent
        work are still just a click away.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/start"
          className="rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-400"
        >
          Start a project
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-steel-line px-6 py-3 font-semibold text-chrome transition-colors hover:border-blue-500/50"
        >
          Back home
        </Link>
      </div>
    </section>
  );
}
