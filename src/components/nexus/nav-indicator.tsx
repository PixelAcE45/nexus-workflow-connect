import { useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Box = { x: number; y: number; width: number; height: number };

/**
 * A single glass pill that travels to whichever nav item is active, so the
 * active state slides between tabs instead of snapping on/off.
 */
export function NavIndicator({
  containerRef,
  className,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  className?: string;
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [box, setBox] = useState<Box | null>(null);
  const settled = useRef(false);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const active = container.querySelector<HTMLElement>('[data-status="active"]');
    if (!active) {
      setBox(null);
      return;
    }
    const parent = container.getBoundingClientRect();
    const rect = active.getBoundingClientRect();
    setBox({
      x: rect.left - parent.left + container.scrollLeft,
      y: rect.top - parent.top + container.scrollTop,
      width: rect.width,
      height: rect.height,
    });
  }, [containerRef]);

  useLayoutEffect(() => {
    measure();
  }, [measure, pathname]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      measure();
      settled.current = true;
    });
    const container = containerRef.current;
    const observer = new ResizeObserver(() => measure());
    if (container) observer.observe(container);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, containerRef]);

  if (!box) return null;

  return (
    <span
      aria-hidden
      className={cn("nav-indicator", className)}
      style={{
        transform: `translate3d(${box.x}px, ${box.y}px, 0)`,
        width: box.width,
        height: box.height,
        opacity: 1,
      }}
    />
  );
}