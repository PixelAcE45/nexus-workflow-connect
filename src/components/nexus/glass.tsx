import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GlassPanel({
  className,
  strong,
  interactive,
  children,
  ...props
}: ComponentProps<"div"> & { strong?: boolean; interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl",
        strong ? "glass-strong" : "glass",
        interactive && "glass-hover",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-2 text-xs font-medium tracking-[0.16em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-[0.95rem]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function SectionTitle({
  title,
  action,
  className,
}: {
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <h2 className="truncate text-base font-semibold">{title}</h2>
      {action}
    </div>
  );
}

export function IconTile({
  children,
  tone = "violet",
  className,
}: {
  children: ReactNode;
  tone?: "violet" | "azure" | "mint" | "amber" | "rose";
  className?: string;
}) {
  const tones = {
    violet: "text-violet",
    azure: "text-azure",
    mint: "text-mint",
    amber: "text-amber",
    rose: "text-rose",
  } as const;

  return (
    <div
      className={cn(
        "grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-glass-border bg-glass",
        tones[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Dot({ className }: { className?: string }) {
  return <span className={cn("inline-block h-2 w-2 shrink-0 rounded-full", className)} />;
}
