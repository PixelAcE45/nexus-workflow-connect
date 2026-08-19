import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { navItems } from "./nav-items";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const navigate = useNavigate();

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Ask Nexus anything, or jump to…" />
      <CommandList className="scroll-slim">
        <CommandEmpty>No results. Try “tasks”, “calendar” or “automations”.</CommandEmpty>
        <CommandGroup heading="Ask Nexus">
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              navigate({ to: "/assistant" });
            }}
          >
            <Sparkles className="text-violet" />
            Open the AI Assistant
            <ArrowRight className="ml-auto h-4 w-4 opacity-50" />
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              toast.success("Weekly summary queued", {
                description: "Nexus will surface it once the backend is connected.",
              });
            }}
          >
            <Plus />
            Summarise my week
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Navigate">
          {navItems.map((item) => (
            <CommandItem
              key={item.to}
              value={item.label}
              onSelect={() => {
                onOpenChange(false);
                navigate({ to: item.to });
              }}
            >
              <item.icon />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
