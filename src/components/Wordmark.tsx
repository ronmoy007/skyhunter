// The "SkyHunter" brand wordmark — its own distinctive font (Space Grotesk),
// two-tone: violet "Sky" + dark "Hunter". Use this anywhere the brand name
// appears so it stays consistent. Inherits font-size from its parent unless
// a size class is passed.
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-brand font-bold tracking-tight ${className}`}>
      <span className="sky-text">Sky</span>
      <span className="chrome-text">Hunter</span>
    </span>
  );
}
