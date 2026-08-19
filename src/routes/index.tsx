import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  FileText,
  FolderClosed,
  Plus,
  Send,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dot, GlassPanel, IconTile, SectionTitle } from "@/components/nexus/glass";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Nexus AI OS" },
      {
        name: "description",
        content:
          "Your Nexus dashboard: today's tasks, calendar, files, automations and the AI command centre in one glass interface.",
      },
      { property: "og:title", content: "Dashboard — Nexus AI OS" },
      {
        property: "og:description",
        content: "Today's tasks, calendar, files, automations and the Nexus AI command centre.",
      },
    ],
  }),
  component: Dashboard,
});

const stats = [
  {
    icon: Sparkles,
    tone: "violet" as const,
    value: "23",
    label: "Tasks for today",
    progress: 60,
    to: "/tasks",
    action: "Open tasks",
  },
  {
    icon: CalendarDays,
    tone: "azure" as const,
    value: "3",
    label: "Events today",
    to: "/calendar",
    action: "View calendar",
  },
  {
    icon: FolderClosed,
    tone: "mint" as const,
    value: "12",
    label: "Files uploaded",
    to: "/files",
    action: "View all",
  },
  {
    icon: Zap,
    tone: "amber" as const,
    value: "7",
    label: "Automations active",
    to: "/automations",
    action: "Manage",
  },
];

const upcoming = [
  { title: "Team standup", time: "9:00 – 9:30 AM", tone: "bg-violet" },
  { title: "Client call — Nexus Pro", time: "11:00 AM – 12:00 PM", tone: "bg-azure" },
  { title: "Product review", time: "3:00 – 4:30 PM", tone: "bg-mint" },
];

const activity = [
  { title: "Project roadmap updated", time: "2h ago" },
  { title: "Q2 report generated", time: "4h ago" },
  { title: "Invoice sent to Acme Corp.", time: "6h ago" },
  { title: "New automation created", time: "1d ago" },
];

const workspaces = [
  { name: "Nexus HQ", members: "12 members", progress: 72, tone: "bg-violet" },
  { name: "Product Launch", members: "8 members", progress: 48, tone: "bg-azure" },
  { name: "Personal Space", members: "Private", progress: 88, tone: "bg-mint" },
];

const knowledge = [
  { title: "Nexus documentation", meta: "Updated 2h ago" },
  { title: "Meeting notes — May 10", meta: "Updated 5h ago" },
  { title: "AI research paper", meta: "Updated 1d ago" },
];

const modes = ["Summarize", "Plan", "Generate", "Analyze"];
const suggestions = [
  "Summarise my meetings",
  "Plan my week",
  "Brainstorm ideas",
  "Analyse this data",
];

function Dashboard() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("Summarize");

  const send = () => {
    if (!prompt.trim()) {
      toast("Add a prompt first", { description: "Tell Nexus what you'd like to do." });
      return;
    }
    navigate({ to: "/assistant" });
    toast.success("Sent to the AI Assistant", { description: `${mode}: ${prompt.trim()}` });
    setPrompt("");
  };

  return (
    <div className="space-y-6 pb-4">
      <div>
        <h1 className="text-3xl font-semibold sm:text-4xl">Good evening, Aarav.</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Nexus is ready to help you build, plan and accomplish more.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <GlassPanel key={stat.label} interactive className="p-5">
                <IconTile tone={stat.tone}>
                  <stat.icon className="h-[1.05rem] w-[1.05rem]" />
                </IconTile>
                <p className="mt-5 text-3xl font-semibold tracking-tight">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                {typeof stat.progress === "number" ? (
                  <div className="mt-4 flex items-center gap-3">
                    <Progress value={stat.progress} className="h-1.5 bg-glass" />
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {stat.progress}%
                    </span>
                  </div>
                ) : (
                  <Link
                    to={stat.to}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground/90 transition-colors hover:text-violet"
                  >
                    {stat.action}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </GlassPanel>
            ))}
          </div>

          <GlassPanel className="p-5 sm:p-6">
            <SectionTitle title="AI Command Center" />
            <div className="glass mt-4 rounded-2xl p-4">
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={2}
                placeholder="What would you like to do today?"
                className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground sm:text-[0.95rem]"
              />
              <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
                <div className="flex min-w-0 flex-wrap gap-2">
                  {modes.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setMode(item)}
                      className={
                        item === mode
                          ? "rounded-lg border border-glass-border bg-glass-strong px-3 py-1.5 text-xs font-medium text-foreground"
                          : "rounded-lg border border-transparent px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-glass hover:text-foreground"
                      }
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <Button
                  size="icon"
                  onClick={send}
                  aria-label="Send to assistant"
                  className="brand-gradient shrink-0 rounded-xl text-primary-foreground hover:opacity-90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {suggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPrompt(item)}
                  className="glass glass-hover rounded-full px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  {item}
                </button>
              ))}
            </div>
          </GlassPanel>

          <div className="grid gap-5 lg:grid-cols-2">
            <GlassPanel className="p-5">
              <SectionTitle
                title="Workspaces"
                action={
                  <Link
                    to="/workspaces"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    View all <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                }
              />
              <div className="mt-4 grid grid-cols-2 gap-3 2xl:grid-cols-4">
                {workspaces.map((workspace) => (
                  <Link
                    key={workspace.name}
                    to="/workspaces"
                    className="glass glass-hover rounded-xl p-3"
                  >
                    <span className={`grid h-9 w-9 place-items-center rounded-lg ${workspace.tone}/20`}>
                      <Users className="h-4 w-4" />
                    </span>
                    <span className="mt-3 block truncate text-sm font-medium">
                      {workspace.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {workspace.members}
                    </span>
                    <span className="mt-3 block h-1 w-full overflow-hidden rounded-full bg-glass-border">
                      <span
                        className={`block h-full rounded-full ${workspace.tone}`}
                        style={{ width: `${workspace.progress}%` }}
                      />
                    </span>
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    toast.success("New workspace", {
                      description: "Naming and members come with the backend.",
                    })
                  }
                  className="glass glass-hover grid place-items-center rounded-xl p-3 text-center"
                >
                  <span>
                    <Plus className="mx-auto h-5 w-5 text-muted-foreground" />
                    <span className="mt-2 block text-xs text-muted-foreground">New workspace</span>
                  </span>
                </button>
              </div>
            </GlassPanel>

            <GlassPanel className="p-5">
              <SectionTitle
                title="Knowledge Hub"
                action={
                  <Link
                    to="/knowledge"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    View all <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                }
              />
              <ul className="mt-4 space-y-2">
                {knowledge.map((item) => (
                  <li key={item.title}>
                    <Link
                      to="/knowledge"
                      className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-glass"
                    >
                      <IconTile tone="azure" className="h-9 w-9">
                        <FileText className="h-4 w-4" />
                      </IconTile>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{item.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {item.meta}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </GlassPanel>
          </div>

          <GlassPanel className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-4 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <IconTile tone="violet">
                <Sparkles className="h-[1.05rem] w-[1.05rem]" />
              </IconTile>
              <p className="min-w-0 text-sm">
                <span className="font-medium">Nexus Pro</span>
                <span className="ml-2 text-muted-foreground">
                  You are using the Pro workspace
                </span>
              </p>
            </div>
            <Link
              to="/settings"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-medium transition-colors hover:text-violet"
            >
              Explore Pro features <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </GlassPanel>
        </div>

        <aside className="space-y-5">
          <GlassPanel className="p-5">
            <SectionTitle title="Upcoming" />
            <ul className="mt-4 space-y-4">
              {upcoming.map((event) => (
                <li key={event.title} className="flex gap-3">
                  <Dot className={`mt-1.5 ${event.tone}`} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              to="/calendar"
              className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              View calendar <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </GlassPanel>

          <GlassPanel className="p-5">
            <SectionTitle title="Recent Activity" />
            <ul className="mt-4 space-y-3">
              {activity.map((item) => (
                <li key={item.title} className="flex items-center gap-3">
                  <IconTile tone="violet" className="h-8 w-8 rounded-lg">
                    <FileText className="h-3.5 w-3.5" />
                  </IconTile>
                  <div className="min-w-0">
                    <p className="truncate text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              to="/analytics"
              className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              View all activity <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </GlassPanel>

          <GlassPanel className="p-5">
            <SectionTitle title="This week" />
            <div className="mt-4 space-y-4">
              {[
                { label: "Focus time", value: "18h 40m", progress: 76 },
                { label: "Tasks completed", value: "41 of 58", progress: 71 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                  <Progress value={item.progress} className="mt-2 h-1.5 bg-glass" />
                </div>
              ))}
            </div>
            <Link
              to="/analytics"
              className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <BarChart3 className="h-3.5 w-3.5" /> Open analytics
            </Link>
          </GlassPanel>
        </aside>
      </div>
    </div>
  );
}
