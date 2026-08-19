import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils";

const EXIT_MS = 130;

/**
 * Keeps the outgoing screen on stage for a beat while the incoming screen
 * rises into position, so tab switches read as one continuous move instead
 * of two separate pages. Only this region animates — the shell stays put.
 */
export function PageTransition({
  children,
  scrollRef,
  className,
}: {
  children: ReactNode;
  scrollRef?: RefObject<HTMLElement | null>;
  className?: string;
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const latest = useRef<ReactNode>(children);
  latest.current = children;

  const [stage, setStage] = useState<{ path: string; node: ReactNode; phase: "in" | "out" }>({
    path: pathname,
    node: children,
    phase: "in",
  });

  useEffect(() => {
    if (stage.path === pathname) return;
    setStage((current) => ({ ...current, phase: "out" }));
    const timer = window.setTimeout(() => {
      scrollRef?.current?.scrollTo({ top: 0 });
      setStage({ path: pathname, node: latest.current, phase: "in" });
    }, EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [pathname, stage.path, scrollRef]);

  // While settled on a route, keep rendering fresh children (state updates, etc.).
  const node = stage.phase === "in" && stage.path === pathname ? children : stage.node;

  return (
    <div
      key={`${stage.path}-${stage.phase}`}
      className={cn(stage.phase === "in" ? "page-enter" : "page-exit", className)}
    >
      {node}
    </div>
  );
}