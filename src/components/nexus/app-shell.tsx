import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Bell, ChevronsUpDown, LifeBuoy, LogOut, Menu, Plus, Search, User } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import atmosphere from "@/assets/nexus-atmosphere.jpg";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { BootScreen } from "./boot-screen";
import { CommandPalette } from "./command-palette";
import { useLayoutPreview } from "./layout-provider";
import { mobileNavItems, navItems } from "./nav-items";
import { NavIndicator } from "./nav-indicator";
import { PageTransition } from "./page-transition";

import { NexusLogo, NexusMark } from "./nexus-logo";
import { QuickCreateDialog } from "./quick-create-dialog";

const groups = ["Workspace", "Intelligence", "System"] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const containerRef = useRef<HTMLElement | null>(null);

  return (
    <nav ref={containerRef} className="relative space-y-6">
      <NavIndicator containerRef={containerRef} />
      {groups.map((group) => (
        <div key={group}>
          <p className="px-3 pb-2 text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground">
            {group.toUpperCase()}
          </p>
          <ul className="space-y-1">
            {navItems
              .filter((item) => item.group === group)
              .map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    activeOptions={{ exact: item.to === "/" }}
                    className="tactile group relative z-10 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-glass/60 hover:text-foreground data-[status=active]:text-foreground motion-reduce:data-[status=active]:border motion-reduce:data-[status=active]:border-glass-border motion-reduce:data-[status=active]:bg-glass-strong"
                  >
                    <item.icon className="h-[1.05rem] w-[1.05rem] shrink-0 transition-[color,transform] duration-200 ease-[var(--ease-out-quick)] group-data-[status=active]:scale-[1.06] group-data-[status=active]:text-violet" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function ProfileCard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const email = user?.email ?? "";
  const name = (user?.user_metadata?.["full_name"] as string | undefined) ?? email.split("@")[0] ?? "Nexus user";
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="glass glass-hover grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-3 py-2.5 text-left"
        >
          <span className="brand-gradient grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold text-primary-foreground">
            {initials}
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              <span className="truncate text-sm font-medium">{name}</span>
              <span className="rounded-md border border-glass-border bg-glass px-1.5 py-0.5 text-[0.62rem] font-medium tracking-wide text-violet">
                Pro
              </span>
            </span>
            <span className="block truncate text-xs text-muted-foreground">{email}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="glass-strong w-56 border-glass-border">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Account</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <User className="mr-2 h-4 w-4" /> Profile & preferences
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast("Support is coming with the Nexus backend.")}>
          <LifeBuoy className="mr-2 h-4 w-4" /> Help & support
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={async () => {
            await signOut();
            toast.success("Signed out of Nexus");
            navigate({ to: "/auth" });
          }}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { preview } = useLayoutPreview();
  const forceMobile = preview === "mobile";
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const mainRef = useRef<HTMLElement | null>(null);
  const mobileNavRef = useRef<HTMLElement | null>(null);


  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setCommandOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-background">
      <BootScreen />

      {/* atmosphere */}
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <img
          src={atmosphere}
          alt=""
          width={1920}
          height={1088}
          className="h-full w-full object-cover transition-opacity duration-700"
          style={{ opacity: "var(--atmosphere-opacity)", filter: "var(--atmosphere-filter)" }}

        />
        <div className="veil absolute inset-0" />
      </div>

      <div className={cn("relative flex min-h-[100dvh] p-0 md:p-3 lg:p-4", forceMobile && "md:p-6")}>
        <div
          className={cn("glass-strong relative flex h-[100dvh] w-full overflow-hidden rounded-none md:h-[calc(100dvh-1.5rem)] md:rounded-3xl lg:h-[calc(100dvh-2rem)]", forceMobile && "mx-auto w-full max-w-[430px] rounded-3xl")}
          style={{
            backgroundImage:
              "linear-gradient(to bottom, var(--glass-sheen), transparent 38%), var(--gradient-veil)",
          }}
        >
          {/* desktop sidebar */}

          <aside className={cn("hidden w-[264px] shrink-0 flex-col border-r border-hairline p-4", forceMobile ? "lg:hidden" : "lg:flex")}>
            <Link to="/" className="px-2 py-2">
              <NexusLogo />
            </Link>
            <div className="scroll-slim mt-6 flex-1 overflow-y-auto pr-1">
              <NavList />
            </div>
            <div className="pt-4">
              <ProfileCard />
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            {/* top bar */}
            <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-hairline px-4 py-3 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:px-8">
              <div className={cn("flex min-w-0 items-center gap-2", !forceMobile && "lg:hidden")}>
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Open navigation">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="glass-strong w-[300px] border-glass-border p-4"
                  >
                    <SheetTitle className="sr-only">Nexus navigation</SheetTitle>
                    <div className="px-2 pb-6 pt-1">
                      <NexusLogo />
                    </div>
                    <div className="scroll-slim max-h-[calc(100dvh-13rem)] overflow-y-auto pr-1">
                      <NavList onNavigate={() => setMobileOpen(false)} />
                    </div>
                    <div className="absolute inset-x-4 bottom-4">
                      <ProfileCard />
                    </div>
                  </SheetContent>
                </Sheet>
                <Link to="/" className="flex items-center gap-2">
                  <NexusMark className="h-7 w-7" />
                  <span className="hidden text-sm font-semibold tracking-[0.14em] sm:inline">NEXUS</span>
                </Link>
              </div>

              <div className={cn("hidden", !forceMobile && "lg:block")} />

              <button
                type="button"
                onClick={() => setCommandOpen(true)}
                className={cn("glass glass-hover col-span-2 w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left", forceMobile ? "hidden" : "hidden sm:flex lg:col-span-1 lg:w-[420px]")}
              >
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                  Ask Nexus anything…
                </span>
                <kbd className="hidden shrink-0 rounded-md border border-glass-border bg-glass px-1.5 py-0.5 text-[0.7rem] text-muted-foreground sm:block">
                  ⌘K
                </kbd>
              </button>

              <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(forceMobile ? "" : "sm:hidden")}
                  aria-label="Search"
                  onClick={() => setCommandOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Notifications"
                  className="relative"
                  onClick={() =>
                    toast("3 new notifications", {
                      description: "Standup at 9:00, Q2 report ready, 1 automation finished.",
                    })
                  }
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-violet" />
                </Button>
                <Button
                  onClick={() => setCreateOpen(true)}
                  className="brand-gradient rounded-xl border border-glass-border px-3 text-primary-foreground shadow-[var(--shadow-glass)] hover:opacity-90 sm:px-4"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New</span>
                </Button>
              </div>
            </header>

            <main
              ref={mainRef}
              className={cn("scroll-slim flex-1 overflow-y-auto px-4 pb-28 pt-6 sm:px-6", !forceMobile && "lg:px-8 lg:pb-10")}
            >
              <PageTransition scrollRef={mainRef}>{children}</PageTransition>
            </main>
          </div>
        </div>
      </div>

      {/* mobile tab bar */}
      <nav
        ref={mobileNavRef}
        className={cn("glass-strong fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl px-2 py-2", forceMobile ? "mx-auto max-w-[406px]" : "lg:hidden")}
      >
        <NavIndicator containerRef={mobileNavRef} className="rounded-xl" />
        {mobileNavItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === "/" }}
            className="tactile group relative z-10 flex min-w-16 flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[0.68rem] font-medium text-muted-foreground data-[status=active]:text-foreground motion-reduce:data-[status=active]:bg-glass"
          >
            <item.icon className="h-5 w-5 transition-transform duration-200 ease-[var(--ease-out-quick)] group-data-[status=active]:scale-[1.06]" />
            {item.label.replace("AI ", "")}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className={cn(
            "tactile relative z-10 flex min-w-16 flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[0.68rem] font-medium text-muted-foreground",
          )}
        >
          <Menu className="h-5 w-5" />
          More
        </button>
      </nav>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      <QuickCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
