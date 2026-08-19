import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Plus, Workflow } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { GlassPanel, IconTile, PageHeader, SectionTitle } from "@/components/nexus/glass";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/automations")({
  head: () => ({
    meta: [
      { title: "Automations — Nexus AI OS" },
      {
        name: "description",
        content:
          "Automations in Nexus: chain triggers and actions across tasks, files, calendar and communications.",
      },
      { property: "og:title", content: "Automations — Nexus AI OS" },
      { property: "og:description", content: "Chain triggers and actions across your workspace." },
    ],
  }),
  component: AutomationsPage,
});

const seed = [
  {
    name: "Daily standup digest",
    trigger: "Every weekday at 8:45 AM",
    action: "Summarise open tasks and post to Nexus HQ",
    runs: "132 runs",
    active: true,
  },
  {
    name: "Client invoice follow-up",
    trigger: "Invoice unpaid after 7 days",
    action: "Draft a polite reminder for review",
    runs: "24 runs",
    active: true,
  },
  {
    name: "Meeting notes to tasks",
    trigger: "New meeting transcript",
    action: "Extract action items and assign owners",
    runs: "68 runs",
    active: true,
  },
  {
    name: "Weekly analytics report",
    trigger: "Every Friday at 5:00 PM",
    action: "Generate the performance summary",
    runs: "18 runs",
    active: false,
  },
];

function AutomationsPage() {
  const [automations, setAutomations] = useState(seed);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="INTELLIGENCE"
        title="Automations"
        description="Quiet background work. Nexus handles the repetition so you keep the judgement."
        actions={
          <Button
            onClick={() => toast.success("New automation", { description: "The builder arrives with the backend." })}
            className="brand-gradient rounded-xl text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New automation
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {automations.map((automation, index) => (
          <GlassPanel key={automation.name} className="p-5">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
              <IconTile tone={automation.active ? "violet" : "azure"}>
                <Workflow className="h-[1.05rem] w-[1.05rem]" />
              </IconTile>
              <div className="min-w-0">
                <SectionTitle title={automation.name} />
                <p className="mt-1 text-xs text-muted-foreground">{automation.runs}</p>
              </div>
              <Switch
                checked={automation.active}
                onCheckedChange={(checked) => {
                  setAutomations((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, active: checked } : item,
                    ),
                  );
                  toast(`${automation.name} ${checked ? "enabled" : "paused"}`);
                }}
                aria-label={`Toggle ${automation.name}`}
              />
            </div>
            <div className="glass mt-4 flex flex-wrap items-center gap-3 rounded-xl px-3.5 py-3 text-sm">
              <span className="text-muted-foreground">{automation.trigger}</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-violet" />
              <span className="min-w-0">{automation.action}</span>
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
