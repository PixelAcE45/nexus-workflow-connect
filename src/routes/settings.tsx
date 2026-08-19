import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  Check,
  Laptop,
  Monitor,
  Moon,
  Layers,
  Palette,
  Shield,
  Smartphone,
  Sun,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAppearance,
  type Accent,
  type Density,
  type GlassPreset,
  type MaterialKey,
  MATERIAL_RANGE,
  type Motion,
} from "@/components/nexus/appearance-provider";
import { GlassPanel, IconTile, PageHeader, SectionTitle } from "@/components/nexus/glass";

import { useLayoutPreview, type LayoutPreview } from "@/components/nexus/layout-provider";
import { useTheme, type ThemePreference } from "@/components/nexus/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Nexus AI OS" },
      {
        name: "description",
        content:
          "Manage your Nexus profile, appearance, layout preview and notification preferences.",
      },
      { property: "og:title", content: "Settings — Nexus AI OS" },
      {
        property: "og:description",
        content: "Profile, appearance, layout preview and notification preferences for Nexus.",
      },
    ],
  }),
  component: SettingsPage,
});

const themeOptions: { value: ThemePreference; label: string; hint: string; icon: typeof Moon }[] = [
  { value: "dark", label: "Dark", hint: "The default Nexus surface", icon: Moon },
  { value: "light", label: "Light", hint: "Bright paper glass", icon: Sun },
  { value: "system", label: "System", hint: "Follow your device", icon: Laptop },
];

const layoutOptions: { value: LayoutPreview; label: string; hint: string; icon: typeof Monitor }[] =
  [
    { value: "desktop", label: "Desktop", hint: "Full sidebar composition", icon: Monitor },
    { value: "mobile", label: "Mobile", hint: "Preview the mobile shell", icon: Smartphone },
  ];

const accents: { value: Accent; label: string; swatch: string }[] = [
  { value: "violet", label: "Violet", swatch: "bg-violet" },
  { value: "azure", label: "Azure", swatch: "bg-azure" },
  { value: "mint", label: "Mint", swatch: "bg-mint" },
  { value: "amber", label: "Amber", swatch: "bg-amber" },
  { value: "rose", label: "Rose", swatch: "bg-rose" },
];

const glassPresets: { value: GlassPreset; label: string; hint: string }[] = [
  { value: "subtle", label: "Subtle Glass", hint: "Denser panes, gentle blur" },
  { value: "balanced", label: "Balanced Glass", hint: "The Nexus default material" },
  { value: "crystal", label: "Crystal Glass", hint: "Clearer panes, brighter edges" },
  { value: "ultra", label: "Ultra Glass", hint: "Maximum see-through, deep blur" },
];

const materialControls: { key: MaterialKey; label: string; hint: string }[] = [
  { key: "opacity", label: "Glass opacity", hint: "Density of the pane tint" },
  { key: "blur", label: "Background blur", hint: "How far the backdrop diffuses" },
  { key: "border", label: "Border intensity", hint: "Weight of edges and hairlines" },
  { key: "brightness", label: "Surface brightness", hint: "Lightness of the pane tint" },
  { key: "depth", label: "Depth / shadow", hint: "Ambient shadow spread" },
  { key: "ambient", label: "Ambient lighting", hint: "Background glow bleeding through" },
  { key: "saturation", label: "Glass saturation", hint: "Colour richness of the backdrop" },
  { key: "reflection", label: "Reflection / highlight", hint: "Internal sheen and edge light" },
];

const densityOptions: { value: Density; label: string }[] = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Default" },
  { value: "spacious", label: "Spacious" },
];

const motionOptions: { value: Motion; label: string }[] = [
  { value: "full", label: "Full" },
  { value: "subtle", label: "Subtle" },
  { value: "off", label: "Off" },
];

function SegmentedRow<T extends string>({
  title,
  hint,
  value,
  options,
  onChange,
}: {
  title: string;
  hint: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="grid gap-3 border-t border-hairline pt-5 @md:grid-cols-[minmax(0,1fr)_auto] @md:items-center">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      </div>
      <div className="glass inline-flex items-center gap-1 rounded-xl p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "tactile rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              value === option.value &&
                "border border-glass-border bg-glass-strong text-foreground shadow-[var(--shadow-glass)]",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}



function OptionCard({
  active,
  label,
  hint,
  icon: Icon,
  onSelect,
}: {
  active: boolean;
  label: string;
  hint: string;
  icon: typeof Moon;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "glass glass-hover group relative flex items-start gap-3 rounded-2xl p-4 text-left",
        active && "border-glass-highlight bg-glass-strong shadow-[var(--shadow-float)]",
      )}
    >
      <IconTile tone={active ? "violet" : "azure"} className="h-9 w-9">
        <Icon className="h-4 w-4" />
      </IconTile>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
      </span>
      {active ? <Check className="mt-1 h-4 w-4 shrink-0 text-violet" /> : null}
    </button>
  );
}

function ToggleRow({
  title,
  description,
  defaultChecked,
}: {
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(Boolean(defaultChecked));
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t border-hairline py-4 first:border-t-0 first:pt-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={(value) => {
          setChecked(value);
          toast(`${title} ${value ? "enabled" : "disabled"}`);
        }}
      />
    </div>
  );
}

function GlassMaterialSection() {
  const { preset, material, setMaterial, applyPreset } = useAppearance();

  return (
    <GlassPanel strong className="@container p-6">
      <SectionTitle
        title="Glass / Material"
        action={
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg text-xs text-muted-foreground"
            onClick={() => {
              applyPreset("balanced");
              toast("Material reset to Balanced Glass");
            }}
          >
            Reset
          </Button>
        }
      />
      <p className="mt-1 text-sm text-muted-foreground">
        Tune the physical qualities of every Nexus surface. Changes apply live across the whole
        interface, in both dark and light.
      </p>

      <div className="mt-5 grid gap-3 @sm:grid-cols-2 @xl:grid-cols-4">
        {glassPresets.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={preset === option.value}
            onClick={() => {
              applyPreset(option.value);
              toast(`${option.label} applied`);
            }}
            className={cn(
              "glass glass-hover relative flex flex-col items-start gap-1 rounded-2xl p-4 text-left",
              preset === option.value &&
                "border-glass-highlight bg-glass-strong shadow-[var(--shadow-float)]",
            )}
          >
            <span className="flex w-full items-center justify-between gap-2">
              <IconTile tone={preset === option.value ? "violet" : "azure"} className="h-8 w-8">
                <Layers className="h-4 w-4" />
              </IconTile>
              {preset === option.value ? <Check className="h-4 w-4 text-violet" /> : null}
            </span>
            <span className="mt-2 block text-sm font-medium">{option.label}</span>
            <span className="block text-xs text-muted-foreground">{option.hint}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-x-8 gap-y-5 border-t border-hairline pt-6 @xl:grid-cols-2">
        {materialControls.map((control) => {
          const range = MATERIAL_RANGE[control.key];
          const value = material[control.key];
          return (
            <div key={control.key} className="min-w-0">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-medium">{control.label}</p>
                <span className="tabular-nums text-xs text-muted-foreground">
                  {Math.round(value * 100)}%
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{control.hint}</p>
              <Slider
                className="mt-3"
                aria-label={control.label}
                min={range.min}
                max={range.max}
                step={range.step}
                value={[value]}
                onValueChange={([next]) => setMaterial(control.key, next ?? value)}
              />
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-xs text-muted-foreground">
        Current material:{" "}
        <span className="text-foreground">
          {preset === "custom"
            ? "Custom"
            : (glassPresets.find((option) => option.value === preset)?.label ?? "Balanced Glass")}
        </span>
      </p>
    </GlassPanel>
  );
}

function SettingsPage() {
  const { preference, setPreference } = useTheme();
  const { preview, setPreview } = useLayoutPreview();
  const { accent, density, motion, set, reset } = useAppearance();



  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        eyebrow="SYSTEM"
        title="Settings"
        description="Tune how Nexus looks, behaves and notifies you. Preferences are stored on this device."
      />

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="glass h-auto rounded-xl p-1">
          <TabsTrigger value="appearance" className="rounded-lg px-4 py-2 text-sm">
            <Palette className="mr-2 h-4 w-4" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="profile" className="rounded-lg px-4 py-2 text-sm">
            <User className="mr-2 h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg px-4 py-2 text-sm">
            <Bell className="mr-2 h-4 w-4" /> Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <GlassPanel strong className="@container p-6">
            <SectionTitle title="Theme" />
            <p className="mt-1 text-sm text-muted-foreground">
              Dark is the canonical Nexus environment. Light is a separately designed bright glass
              surface.
            </p>
            <div className="mt-5 grid gap-3 @md:grid-cols-3">
              {themeOptions.map((option) => (
                <OptionCard
                  key={option.value}
                  active={preference === option.value}
                  label={option.label}
                  hint={option.hint}
                  icon={option.icon}
                  onSelect={() => setPreference(option.value)}
                />
              ))}
            </div>
          </GlassPanel>

          <GlassPanel strong className="@container p-6">
            <SectionTitle title="View & layout" />
            <p className="mt-1 text-sm text-muted-foreground">
              Switch the shell between the desktop composition and the mobile layout to inspect both
              experiences.
            </p>
            <div className="mt-5 grid gap-3 @md:grid-cols-2">
              {layoutOptions.map((option) => (
                <OptionCard
                  key={option.value}
                  active={preview === option.value}
                  label={option.label}
                  hint={option.hint}
                  icon={option.icon}
                  onSelect={() => setPreview(option.value)}
                />
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="@container p-6">
            <SectionTitle
              title="Interface"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-xs text-muted-foreground"
                  onClick={() => {
                    reset();
                    toast("Interface reset to defaults");
                  }}
                >
                  Reset
                </Button>
              }
            />
            <p className="mt-1 text-sm text-muted-foreground">
              These settings apply across every Nexus surface.
            </p>

            <div className="mt-5 space-y-5">
              <div className="grid gap-3 @md:grid-cols-[minmax(0,1fr)_auto] @md:items-center">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Accent</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Tints highlights, controls and the brand gradient.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {accents.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => set("accent", option.value)}
                      aria-label={option.label}
                      aria-pressed={accent === option.value}
                      className={cn(
                        "tactile grid h-8 w-8 place-items-center rounded-full border border-glass-border bg-glass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        accent === option.value && "border-glass-highlight shadow-[var(--shadow-glass)]",
                      )}
                    >
                      <span className={cn("h-3.5 w-3.5 rounded-full", option.swatch)} />
                    </button>
                  ))}
                </div>
              </div>

              <SegmentedRow
                title="Density"
                hint="Overall scale of spacing, radius and type."
                value={density}
                options={densityOptions}
                onChange={(value) => set("density", value)}
              />

              <SegmentedRow
                title="Motion"
                hint="Intensity of transitions and page animations."
                value={motion}
                options={motionOptions}
                onChange={(value) => set("motion", value)}
              />
            </div>
          </GlassPanel>

          <GlassMaterialSection />

        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <GlassPanel strong className="p-6">
            <SectionTitle title="Profile" />
            <div className="mt-5 flex items-center gap-4">
              <span className="brand-gradient grid h-14 w-14 shrink-0 place-items-center rounded-full text-base font-semibold text-primary-foreground">
                AS
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">Aarav Sharma</p>
                <p className="truncate text-xs text-muted-foreground">Nexus Pro workspace owner</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" defaultValue="Aarav Sharma" className="bg-glass" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue="aarav@nexus.ai" className="bg-glass" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" defaultValue="Head of Product" className="bg-glass" />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => toast("Profile saved locally", {
                  description: "Persistence arrives with the Nexus backend.",
                })}
                className="brand-gradient rounded-xl border border-glass-border text-primary-foreground hover:opacity-90"
              >
                Save changes
              </Button>
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <SectionTitle title="Security" />
            <div className="mt-4">
              <ToggleRow
                title="Two-factor authentication"
                description="Require a second factor when signing in."
                defaultChecked
              />
              <ToggleRow
                title="Device sessions"
                description="Keep this device signed in for 30 days."
                defaultChecked
              />
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-mint" />
              Authentication will be connected in a later release.
            </div>
          </GlassPanel>
        </TabsContent>

        <TabsContent value="notifications">
          <GlassPanel strong className="p-6">
            <SectionTitle title="Notifications" />
            <p className="mt-1 text-sm text-muted-foreground">
              Choose what Nexus surfaces to you and when.
            </p>
            <div className="mt-4">
              <ToggleRow
                title="Task reminders"
                description="Nudge me before a task is due."
                defaultChecked
              />
              <ToggleRow
                title="Calendar alerts"
                description="Notify me 10 minutes before meetings."
                defaultChecked
              />
              <ToggleRow
                title="Automation reports"
                description="Send a daily summary of automation runs."
              />
              <ToggleRow
                title="Weekly digest"
                description="A Monday morning overview of your workspaces."
                defaultChecked
              />
            </div>
          </GlassPanel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
