import { createFileRoute } from "@tanstack/react-router";
import { Mail, PenLine, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dot, GlassPanel, IconTile, PageHeader, SectionTitle } from "@/components/nexus/glass";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/communications")({
  head: () => ({
    meta: [
      { title: "Communications — Nexus AI OS" },
      {
        name: "description",
        content:
          "One inbox in Nexus for threads, mentions and client updates, with AI drafting built in.",
      },
      { property: "og:title", content: "Communications — Nexus AI OS" },
      { property: "og:description", content: "Threads, mentions and client updates in one inbox." },
    ],
  }),
  component: CommunicationsPage,
});

const threads = [
  {
    from: "Priya Menon",
    subject: "Launch checklist review",
    preview: "I moved the pricing copy to Thursday so design has time to sign off.",
    time: "12m",
    unread: true,
  },
  {
    from: "Acme Corp.",
    subject: "Invoice #2481 received",
    preview: "Thanks — payment is scheduled for the 20th.",
    time: "2h",
    unread: true,
  },
  {
    from: "Daniel Ortiz",
    subject: "Analytics dashboard feedback",
    preview: "The retention view is much clearer now. Two small notes inside.",
    time: "5h",
    unread: false,
  },
  {
    from: "Nexus Digest",
    subject: "Your week in review",
    preview: "41 tasks completed, 18h of focus time, 3 automations triggered.",
    time: "1d",
    unread: false,
  },
];

function CommunicationsPage() {
  const [active, setActive] = useState(0);
  const thread = threads[active] ?? threads[0]!;
  const [reply, setReply] = useState("");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="WORKSPACE"
        title="Communications"
        description="Threads, mentions and client updates in one calm inbox."
        actions={
          <Button
            onClick={() => toast.success("New message", { description: "Sending arrives with the backend." })}
            className="brand-gradient rounded-xl text-primary-foreground hover:opacity-90"
          >
            <PenLine className="h-4 w-4" /> Compose
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
        <GlassPanel className="p-2">
          <ul className="divide-y divide-[var(--hairline)]">
            {threads.map((item, index) => (
              <li key={item.subject}>
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  className={
                    index === active
                      ? "w-full rounded-xl bg-glass-strong px-3 py-3.5 text-left"
                      : "w-full rounded-xl px-3 py-3.5 text-left transition-colors hover:bg-glass"
                  }
                >
                  <span className="flex items-center gap-2">
                    {item.unread ? <Dot className="bg-violet" /> : null}
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.from}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
                  </span>
                  <span className="mt-1 block truncate text-sm">{item.subject}</span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {item.preview}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </GlassPanel>

        <GlassPanel className="flex min-h-[420px] flex-col p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <IconTile tone="azure">
              <Mail className="h-[1.05rem] w-[1.05rem]" />
            </IconTile>
            <div className="min-w-0">
              <SectionTitle title={thread.subject} />
              <p className="text-xs text-muted-foreground">
                {thread.from} · {thread.time} ago
              </p>
            </div>
          </div>

          <p className="mt-6 flex-1 text-sm leading-relaxed text-muted-foreground">
            {thread.preview} Nexus will thread the full conversation here once messaging is
            connected, along with suggested replies drawn from your workspace context.
          </p>

          <div className="glass mt-5 rounded-2xl p-3">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
              <textarea
                rows={2}
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder={`Reply to ${thread.from.split(" ")[0]}…`}
                className="min-w-0 resize-none bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
              />
              <Button
                size="icon"
                aria-label="Send reply"
                onClick={() => {
                  if (!reply.trim()) {
                    toast("Write a reply first");
                    return;
                  }
                  setReply("");
                  toast.success("Reply queued");
                }}
                className="brand-gradient shrink-0 rounded-xl text-primary-foreground hover:opacity-90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
