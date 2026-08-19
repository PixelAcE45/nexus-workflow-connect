import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dot, GlassPanel, PageHeader } from "@/components/nexus/glass";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createTask,
  listTasks,
  toggleTask,
  type TaskDto,
} from "@/lib/tasks.functions";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Nexus AI OS" },
      {
        name: "description",
        content:
          "Track today's work in Nexus: priorities, owners, due dates and progress across every workspace.",
      },
      { property: "og:title", content: "Tasks — Nexus AI OS" },
      { property: "og:description", content: "Priorities, owners and due dates across Nexus." },
    ],
  }),
  component: TasksPage,
});

const priorityTone: Record<TaskDto["priority"], string> = {
  High: "bg-rose",
  Medium: "bg-amber",
  Low: "bg-mint",
};

function formatDue(due: string | null) {
  if (!due) return "No date";
  const date = new Date(due);
  const today = new Date();
  const startOf = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const diff = Math.round((startOf(date) - startOf(today)) / 86_400_000);
  const time = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (diff === 0) return `Today · ${time}`;
  if (diff === 1) return `Tomorrow · ${time}`;
  if (diff === -1) return `Yesterday · ${time}`;
  return `${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${time}`;
}

function TasksPage() {
  const [filter, setFilter] = useState("open");
  const [title, setTitle] = useState("");
  const queryClient = useQueryClient();

  const fetchTasks = useServerFn(listTasks);
  const addTask = useServerFn(createTask);
  const toggle = useServerFn(toggleTask);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchTasks(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["tasks"] });

  const addMutation = useMutation({
    mutationFn: (value: string) => addTask({ data: { title: value } }),
    onSuccess: () => {
      setTitle("");
      toast.success("Task added");
      void invalidate();
    },
    onError: (error: unknown) =>
      toast.error(error instanceof Error ? error.message : "Could not add the task"),
  });

  const toggleMutation = useMutation({
    mutationFn: (input: { id: string; done: boolean }) => toggle({ data: input }),
    onSuccess: () => void invalidate(),
    onError: (error: unknown) =>
      toast.error(error instanceof Error ? error.message : "Could not update the task"),
  });

  const visible = tasks.filter((task) =>
    filter === "all" ? true : filter === "done" ? task.done : !task.done,
  );

  const add = () => {
    if (!title.trim()) {
      toast("Describe the task first");
      return;
    }
    addMutation.mutate(title.trim());
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="WORKSPACE"
        title="Tasks"
        description="Everything on your plate, grouped by urgency instead of by tool."
        actions={
          <Button
            onClick={add}
            disabled={addMutation.isPending}
            className="brand-gradient rounded-xl text-primary-foreground hover:opacity-90"
          >
            {addMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}{" "}
            Add task
          </Button>
        }
      />

      <GlassPanel className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && add()}
          placeholder="What needs to get done?"
          className="border-glass-border bg-glass"
        />
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="bg-glass">
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="done">Done</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </GlassPanel>

      <GlassPanel className="divide-y divide-[var(--hairline)] p-2">
        {visible.map((task) => (
          <div key={task.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3.5">
            <Checkbox
              checked={task.done}
              onCheckedChange={() => toggleMutation.mutate({ id: task.id, done: !task.done })}
              aria-label={`Toggle ${task.title}`}
            />
            <div className="min-w-0">
              <p
                className={
                  task.done
                    ? "truncate text-sm text-muted-foreground line-through"
                    : "truncate text-sm font-medium"
                }
              >
                {task.title}
              </p>
              <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate">{task.workspace}</span>
                <span aria-hidden>·</span>
                <span>{formatDue(task.due_at)}</span>
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
              <Dot className={priorityTone[task.priority]} />
              {task.priority}
            </span>
          </div>
        ))}
        {isLoading ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">Loading your tasks…</p>
        ) : visible.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            Nothing here. Enjoy the quiet.
          </p>
        ) : null}
      </GlassPanel>
    </div>
  );
}
