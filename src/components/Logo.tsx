import Image from "next/image";
import { Wordmark } from "./Wordmark";

// SkyHunter mark: a cloud with a rising arrow (recolored to the brand violet),
// paired with the Sora wordmark. Transparent PNG so it reads on any background.
export function Logo({
  className = "",
  size = 34,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/logo.png?v=sky"
        alt="SkyHunter"
        width={size}
        height={size}
        className="shrink-0"
      />
      <Wordmark className="text-2xl" />
    </span>
  );
}
