import {
  BarChart3,
  Bot,
  CalendarDays,
  CheckSquare,
  FolderClosed,
  LayoutGrid,
  Library,
  MessageSquare,
  Settings,
  Sparkles,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  group: "Workspace" | "Intelligence" | "System";
};

export const navItems: NavItem[] = [
  { label: "Dashboard", to: "/", icon: LayoutGrid, group: "Workspace" },
  { label: "AI Assistant", to: "/assistant", icon: Bot, group: "Intelligence" },
  { label: "Workspaces", to: "/workspaces", icon: Sparkles, group: "Workspace" },
  { label: "Tasks", to: "/tasks", icon: CheckSquare, group: "Workspace" },
  { label: "Knowledge", to: "/knowledge", icon: Library, group: "Intelligence" },
  { label: "Calendar", to: "/calendar", icon: CalendarDays, group: "Workspace" },
  { label: "Communications", to: "/communications", icon: MessageSquare, group: "Workspace" },
  { label: "Files", to: "/files", icon: FolderClosed, group: "Workspace" },
  { label: "Automations", to: "/automations", icon: Workflow, group: "Intelligence" },
  { label: "Analytics", to: "/analytics", icon: BarChart3, group: "Intelligence" },
  { label: "Settings", to: "/settings", icon: Settings, group: "System" },
];

export const mobileNavItems = navItems.filter((item) =>
  ["/", "/assistant", "/tasks", "/calendar"].includes(item.to),
);
