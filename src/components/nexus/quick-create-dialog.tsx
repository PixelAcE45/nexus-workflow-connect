import { useNavigate } from "@tanstack/react-router";
import { Bot, CalendarPlus, CheckSquare, FolderPlus, Workflow } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconTile } from "./glass";

const options = [
  {
    label: "New workspace",
    hint: "Spin up a shared space for a team or initiative",
    icon: FolderPlus,
    tone: "violet" as const,
    to: "/workspaces",
  },
  {
    label: "New task",
    hint: "Capture work with an owner and a due date",
    icon: CheckSquare,
    tone: "azure" as const,
    to: "/tasks",
  },
  {
    label: "New event",
    hint: "Block time or invite your collaborators",
    icon: CalendarPlus,
    tone: "mint" as const,
    to: "/calendar",
  },
  {
    label: "New automation",
    hint: "Chain triggers and actions across Nexus",
    icon: Workflow,
    tone: "amber" as const,
    to: "/automations",
  },
  {
    label: "Ask the assistant",
    hint: "Draft, summarise, plan or analyse",
    icon: Bot,
    tone: "rose" as const,
    to: "/assistant",
  },
];

export function QuickCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-w-lg border-glass-border">
        <DialogHeader>
          <DialogTitle className="text-lg">Create something new</DialogTitle>
          <DialogDescription>
            Pick a surface to start in. Nexus will keep everything in one place.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-1 space-y-2">
          {options.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => {
                onOpenChange(false);
                navigate({ to: option.to });
                toast.success(`${option.label} — draft started`, {
                  description: "This is a frontend placeholder for now.",
                });
              }}
              className="glass glass-hover flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left"
            >
              <IconTile tone={option.tone}>
                <option.icon className="h-[1.05rem] w-[1.05rem]" />
              </IconTile>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{option.label}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {option.hint}
                </span>
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
