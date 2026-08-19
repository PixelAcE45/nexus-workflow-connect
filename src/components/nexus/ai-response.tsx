import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/** Progressively reveals text so responses stream in instead of dumping at once. */
export function useProgressiveText(text: string, enabled: boolean) {
  const [shown, setShown] = useState(enabled ? "" : text);

  useEffect(() => {
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (!enabled || reducedMotion || text.length === 0) {
      setShown(text);
      return;
    }

    // Keep the reveal under ~1.2s and cap the number of renders: markdown is
    // re-parsed on every commit, so a 16ms tick makes long answers janky.
    const TICK_MS = 45;
    const MAX_TICKS = 28;
    const step = Math.max(3, Math.ceil(text.length / MAX_TICKS));

    let index = 0;
    setShown("");
    const timer = window.setInterval(() => {
      index = Math.min(text.length, index + step);
      setShown(text.slice(0, index));
      if (index >= text.length) window.clearInterval(timer);
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [text, enabled]);

  return shown;
}


export function AiResponse({
  text,
  animate = false,
  className,
}: {
  text: string;
  animate?: boolean;
  className?: string;
}) {
  const shown = useProgressiveText(text, animate);

  return (
    <div
      className={cn(
        "space-y-3 text-sm leading-relaxed",
        "[&_a]:text-violet [&_a]:underline [&_a]:underline-offset-2",
        "[&_h1]:text-base [&_h1]:font-semibold [&_h2]:text-[0.95rem] [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold",
        "[&_h1]:mt-1 [&_h2]:mt-1 [&_h3]:mt-1",
        "[&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5",
        "[&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5",
        "[&_li]:marker:text-muted-foreground",
        "[&_strong]:font-semibold",
        "[&_blockquote]:border-l [&_blockquote]:border-glass-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
        "[&_hr]:border-glass-border",
        "[&_code]:rounded-md [&_code]:border [&_code]:border-glass-border [&_code]:bg-glass [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.8rem]",
        "[&_pre]:scroll-slim [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-glass-border [&_pre]:bg-glass [&_pre]:p-3 [&_pre]:text-[0.8rem]",
        "[&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "[&_table]:w-full [&_table]:text-left [&_th]:pr-3 [&_th]:font-medium [&_td]:pr-3",
        className,
      )}
    >
      <Markdown remarkPlugins={[remarkGfm]}>{shown}</Markdown>
    </div>
  );
}

export function ThinkingBubble() {
  return (
    <div className="glass inline-flex items-center gap-2.5 rounded-2xl px-4 py-3">
      <span className="relative grid h-4 w-4 place-items-center">
        <span className="absolute h-4 w-4 rounded-full bg-violet/30 nexus-thinking-pulse" />
        <span className="h-1.5 w-1.5 rounded-full bg-violet" />
      </span>
      <span className="text-sm text-muted-foreground">Nexus is thinking</span>
      <span className="flex items-center gap-1" aria-hidden>
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="nexus-thinking-dot h-1.5 w-1.5 rounded-full bg-muted-foreground/70"
            style={{ animationDelay: `${index * 0.18}s` }}
          />
        ))}
      </span>
    </div>
  );
}
