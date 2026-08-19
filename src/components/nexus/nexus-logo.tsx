import { cn } from "@/lib/utils";

/**
 * The Nexus brand mark: an outlined monogram "N" built from two rounded
 * uprights crossed by a rounded diagonal, filled with the brand gradient.
 */
export function NexusMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="Nexus"
      className={cn("h-8 w-8", className)}
    >
      <defs>
        <linearGradient id="nexus-mark-gradient" x1="6" y1="44" x2="42" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="oklch(0.72 0.13 292)" />
          <stop offset="55%" stopColor="oklch(0.86 0.07 288)" />
          <stop offset="100%" stopColor="oklch(0.99 0.01 280)" />
        </linearGradient>
      </defs>
      <g
        fill="none"
        stroke="url(#nexus-mark-gradient)"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* left upright */}
        <rect x="6.4" y="12.6" width="8.6" height="31" rx="4.3" />
        {/* right upright */}
        <rect x="33" y="4.4" width="8.6" height="31" rx="4.3" />
        {/* diagonal */}
        <path d="M13.2 8.6a4.3 4.3 0 0 1 6.1.5l18 24.9a4.3 4.3 0 0 1-1 6 4.3 4.3 0 0 1-6-1L12.4 14.6a4.3 4.3 0 0 1 .8-6Z" />
      </g>
    </svg>
  );
}

export function NexusLogo({
  className,
  showWordmark = true,
  size = "md",
}: {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const marks = { sm: "h-7 w-7", md: "h-9 w-9", lg: "h-14 w-14" } as const;
  const titles = { sm: "text-base", md: "text-xl", lg: "text-3xl" } as const;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <NexusMark className={marks[size]} />
      {showWordmark ? (
        <div className="min-w-0 leading-none">
          <div
            className={cn(
              "font-semibold tracking-[0.14em] text-foreground",
              titles[size],
            )}
          >
            NEXUS
          </div>
          <div className="mt-1 text-[0.7rem] font-medium tracking-[0.2em] text-muted-foreground">
            AI OS
          </div>
        </div>
      ) : null}
    </div>
  );
}
