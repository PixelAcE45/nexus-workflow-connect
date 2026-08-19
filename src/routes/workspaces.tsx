import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { GlassPanel, IconTile, PageHeader } from "@/components/nexus/glass";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/workspaces")({
  head: () => ({
    meta: [
      { title: "Workspaces — Nexus AI OS" },
      {
        name: "description",
        content:
          "Shared Nexus workspaces for teams and initiatives, each with members, progress and its own knowledge.",
      },
      { property: "og:title", content: "Workspaces — Nexus AI OS" },
      {
        property: "og:description",
        content: "Shared Nexus workspaces for teams and initiatives.",
      },
    ],
  }),
  component: WorkspacesPage,
});

const initialWorkspaces = [
  {
    name: "Nexus HQ",
    description: "Company operating cadence, planning and announcements.",
    members: 12,
    progress: 72,
    tone: "violet" as const,
  },
  {
    name: "Product Launch",
    description: "Everything shipping with the Nexus Pro release.",
    members: 8,
    progress: 48,
    tone: "azure" as const,
  },
  {
    name: "Personal Space",
    description: "Private notes, drafts and long-term ideas.",
    members: 1,
    progress: 88,
    tone: "mint" as const,
  },
  {
    name: "Client Success",
    description: "Onboarding, renewals and account health reviews.",
    members: 6,
    progress: 34,
    tone: "amber" as const,
  },
];

function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState(initialWorkspaces);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const filtered = workspaces.filter((workspace) =>
    workspace.name.toLowerCase().includes(query.toLowerCase()),
  );

  const create = () => {
    if (!name.trim()) {
      toast("Name your workspace to continue");
      return;
    }
    setWorkspaces((current) => [
      {
        name: name.trim(),
        description: description.trim() || "No description yet.",
        members: 1,
        progress: 0,
        tone: "violet" as const,
      },
      ...current,
    ]);
    setName("");
    setDescription("");
    setOpen(false);
    toast.success("Workspace created", { description: "Stored locally until the backend lands." });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="WORKSPACE"
        title="Workspaces"
        description="Group people, files and automations around the work they belong to."
        actions={
          <Button
            onClick={() => setOpen(true)}
            className="brand-gradient rounded-xl text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New workspace
          </Button>
        }
      />

      <GlassPanel className="flex items-center gap-3 rounded-xl px-4 py-2.5">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search workspaces"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </GlassPanel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((workspace) => (
          <GlassPanel key={workspace.name} interactive className="p-5">
            <div className="flex items-center justify-between gap-3">
              <IconTile tone={workspace.tone}>
                <Users className="h-[1.05rem] w-[1.05rem]" />
              </IconTile>
              <span className="text-xs text-muted-foreground">
                {workspace.members === 1 ? "Private" : `${workspace.members} members`}
              </span>
            </div>
            <h2 className="mt-5 truncate text-base font-semibold">{workspace.name}</h2>
            <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
              {workspace.description}
            </p>
            <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-glass-border">
              <div
                className="brand-gradient h-full rounded-full"
                style={{ width: `${workspace.progress}%` }}
              />
            </div>
            <button
              type="button"
              onClick={() => toast(`Opening ${workspace.name}`)}
              className="mt-4 text-sm font-medium transition-colors hover:text-violet"
            >
              Open workspace
            </button>
          </GlassPanel>
        ))}
        {filtered.length === 0 ? (
          <GlassPanel className="p-8 text-center text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">
            No workspaces match “{query}”.
          </GlassPanel>
        ) : null}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-strong border-glass-border">
          <DialogHeader>
            <DialogTitle>New workspace</DialogTitle>
            <DialogDescription>
              Give it a clear name so your team knows what belongs here.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Name</Label>
              <Input
                id="workspace-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Growth experiments"
                className="bg-glass"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace-description">Description</Label>
              <Textarea
                id="workspace-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What is this workspace for?"
                className="bg-glass"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={create}
              className="brand-gradient text-primary-foreground hover:opacity-90"
            >
              Create workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
