import { createFileRoute } from "@tanstack/react-router";
import { CalendarPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dot, GlassPanel, PageHeader, SectionTitle } from "@/components/nexus/glass";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Nexus AI OS" },
      {
        name: "description",
        content:
          "A quiet week view in Nexus: meetings, focus blocks and reviews with the AI assistant one keystroke away.",
      },
      { property: "og:title", content: "Calendar — Nexus AI OS" },
      { property: "og:description", content: "Meetings, focus blocks and reviews in one week view." },
    ],
  }),
  component: CalendarPage,
});

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dates = [11, 12, 13, 14, 15, 16, 17];

const events = [
  { day: 0, title: "Team standup", time: "9:00 AM", tone: "bg-violet" },
  { day: 0, title: "Client call", time: "11:00 AM", tone: "bg-azure" },
  { day: 1, title: "Design review", time: "1:30 PM", tone: "bg-mint" },
  { day: 3, title: "Launch go/no-go", time: "3:00 PM", tone: "bg-amber" },
  { day: 4, title: "1:1 with Priya", time: "10:00 AM", tone: "bg-azure" },
];

function CalendarPage() {
  const [selected, setSelected] = useState(0);
  const dayEvents = events.filter((event) => event.day === selected);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="WORKSPACE"
        title="Calendar"
        description="Week of 11 – 17 August. Focus blocks are protected by default."
        actions={
          <Button
            onClick={() => toast.success("New event", { description: "Scheduling arrives with the backend." })}
            className="brand-gradient rounded-xl text-primary-foreground hover:opacity-90"
          >
            <CalendarPlus className="h-4 w-4" /> New event
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <GlassPanel className="p-4 sm:p-5">
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => (
              <button
                key={day}
                type="button"
                onClick={() => setSelected(index)}
                className={
                  index === selected
                    ? "glass-strong rounded-xl px-2 py-3 text-center transition-all"
                    : "rounded-xl px-2 py-3 text-center transition-colors hover:bg-glass"
                }
              >
                <span className="block text-[0.68rem] tracking-[0.12em] text-muted-foreground">
                  {day.toUpperCase()}
                </span>
                <span className="mt-1.5 block text-base font-semibold">{dates[index]}</span>
                <span className="mt-2 flex justify-center gap-1">
                  {events
                    .filter((event) => event.day === index)
                    .map((event) => (
                      <Dot key={event.title} className={`h-1.5 w-1.5 ${event.tone}`} />
                    ))}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-2">
            {Array.from({ length: 9 }).map((_, index) => {
              const hour = 8 + index;
              const event = dayEvents.find(
                (item) => Number(item.time.split(":")[0]) + (item.time.includes("PM") && !item.time.startsWith("12") ? 12 : 0) === hour,
              );
              return (
                <div key={hour} className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                  </span>
                  {event ? (
                    <button
                      type="button"
                      onClick={() => toast(event.title, { description: `${event.time} · 30 min` })}
                      className="glass glass-hover flex items-center gap-3 rounded-xl px-3 py-2.5 text-left"
                    >
                      <Dot className={event.tone} />
                      <span className="min-w-0 truncate text-sm font-medium">{event.title}</span>
                    </button>
                  ) : (
                    <div className="hairline-t h-8" />
                  )}
                </div>
              );
            })}
          </div>
        </GlassPanel>

        <aside className="space-y-5">
          <GlassPanel className="p-5">
            <SectionTitle title={`${days[selected]} ${dates[selected]} August`} />
            <ul className="mt-4 space-y-4">
              {dayEvents.length === 0 ? (
                <li className="text-sm text-muted-foreground">No events. A good day for deep work.</li>
              ) : (
                dayEvents.map((event) => (
                  <li key={event.title} className="flex gap-3">
                    <Dot className={`mt-1.5 ${event.tone}`} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.time}</p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </GlassPanel>

          <GlassPanel className="p-5">
            <SectionTitle title="Focus blocks" />
            <p className="mt-3 text-sm text-muted-foreground">
              Nexus reserved 2 hours of deep work each morning this week.
            </p>
            <Button
              variant="ghost"
              className="mt-3 px-0 text-sm hover:bg-transparent hover:text-violet"
              onClick={() => toast("Focus preferences will live in Settings.")}
            >
              Adjust preferences
            </Button>
          </GlassPanel>
        </aside>
      </div>
    </div>
  );
}
