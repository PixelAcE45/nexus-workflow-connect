import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { GlassPanel, PageHeader, SectionTitle } from "@/components/nexus/glass";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Nexus AI OS" },
      {
        name: "description",
        content:
          "Analytics in Nexus: focus time, throughput and automation impact across your workspaces.",
      },
      { property: "og:title", content: "Analytics — Nexus AI OS" },
      { property: "og:description", content: "Focus time, throughput and automation impact." },
    ],
  }),
  component: AnalyticsPage,
});

const activity = [
  { day: "Mon", tasks: 12, focus: 3.5 },
  { day: "Tue", tasks: 18, focus: 4.2 },
  { day: "Wed", tasks: 9, focus: 2.8 },
  { day: "Thu", tasks: 22, focus: 5.1 },
  { day: "Fri", tasks: 16, focus: 3.9 },
  { day: "Sat", tasks: 6, focus: 1.2 },
  { day: "Sun", tasks: 4, focus: 0.8 },
];

const metrics = [
  { label: "Tasks completed", value: "87", change: "+12%", up: true },
  { label: "Focus time", value: "21.5h", change: "+8%", up: true },
  { label: "Automation runs", value: "242", change: "+34%", up: true },
  { label: "Response time", value: "1h 12m", change: "-6%", up: false },
];

function AnalyticsPage() {
  const [range, setRange] = useState("week");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="INTELLIGENCE"
        title="Analytics"
        description="How the work actually moved. Signals, not vanity numbers."
        actions={
          <Tabs value={range} onValueChange={setRange}>
            <TabsList className="bg-glass">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="quarter">Quarter</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <GlassPanel key={metric.label} interactive className="p-5">
            <p className="text-sm text-muted-foreground">{metric.label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{metric.value}</p>
            <p
              className={
                metric.up
                  ? "mt-2 flex items-center gap-1 text-xs text-mint"
                  : "mt-2 flex items-center gap-1 text-xs text-amber"
              }
            >
              {metric.up ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {metric.change} vs last {range}
            </p>
          </GlassPanel>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <GlassPanel className="p-5">
          <SectionTitle title="Focus time" />
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activity}>
                <defs>
                  <linearGradient id="focus-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--violet)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--violet)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--hairline)" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "var(--popover-foreground)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="focus"
                  stroke="var(--violet)"
                  strokeWidth={2}
                  fill="url(#focus-fill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <SectionTitle title="Tasks completed" />
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activity}>
                <CartesianGrid stroke="var(--hairline)" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "var(--glass-bg)" }}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "var(--popover-foreground)",
                  }}
                />
                <Bar dataKey="tasks" fill="var(--azure)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
