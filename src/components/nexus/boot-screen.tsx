import { useEffect, useState } from "react";
import { NexusLogo } from "./nexus-logo";

export function BootScreen() {
  const [phase, setPhase] = useState<"loading" | "leaving" | "done">("loading");

  useEffect(() => {
    const leave = window.setTimeout(() => setPhase("leaving"), 1100);
    const done = window.setTimeout(() => setPhase("done"), 1750);
    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(done);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-100 grid place-items-center bg-background transition-opacity duration-600"
      style={{ opacity: phase === "leaving" ? 0 : 1 }}
    >
      <div className="veil absolute inset-0" />
      <div className="relative flex flex-col items-center gap-6 animate-fade">
        <NexusLogo size="lg" showWordmark={false} />
        <div className="text-center">
          <p className="text-sm font-semibold tracking-[0.32em] text-foreground">NEXUS</p>
          <p className="mt-2 text-xs tracking-[0.2em] text-muted-foreground">
            INITIALISING AI OS
          </p>
        </div>
        <div className="h-px w-40 overflow-hidden rounded-full bg-glass-border">
          <div className="brand-gradient h-full w-full animate-sheen" />
        </div>
      </div>
    </div>
  );
}
