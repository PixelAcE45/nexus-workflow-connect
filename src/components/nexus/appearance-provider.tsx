import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Accent = "violet" | "azure" | "mint" | "amber" | "rose";
export type Density = "compact" | "comfortable" | "spacious";
export type Motion = "full" | "subtle" | "off";

/** The eight material knobs. All values are unitless multipliers (1 = base). */
export type MaterialKey =
  | "opacity"
  | "blur"
  | "border"
  | "brightness"
  | "depth"
  | "ambient"
  | "saturation"
  | "reflection";

export type Material = Record<MaterialKey, number>;

export type GlassPreset = "subtle" | "balanced" | "crystal" | "ultra";

export const MATERIAL_RANGE: Record<MaterialKey, { min: number; max: number; step: number }> = {
  opacity: { min: 0.3, max: 2.2, step: 0.05 },
  blur: { min: 0.2, max: 2.2, step: 0.05 },
  border: { min: 0, max: 2, step: 0.05 },
  brightness: { min: 0.4, max: 1.6, step: 0.02 },
  depth: { min: 0, max: 2, step: 0.05 },
  ambient: { min: 0, max: 2, step: 0.05 },
  saturation: { min: 0.4, max: 1.8, step: 0.05 },
  reflection: { min: 0, max: 2, step: 0.05 },
};

export const GLASS_PRESETS: Record<GlassPreset, Material> = {
  subtle: {
    opacity: 1.6,
    blur: 0.75,
    border: 1.15,
    brightness: 1.04,
    depth: 0.85,
    ambient: 0.8,
    saturation: 0.95,
    reflection: 0.9,
  },
  balanced: {
    opacity: 1,
    blur: 1,
    border: 1,
    brightness: 1,
    depth: 1,
    ambient: 1,
    saturation: 1,
    reflection: 1,
  },
  crystal: {
    opacity: 0.7,
    blur: 1.3,
    border: 0.9,
    brightness: 1.06,
    depth: 1.1,
    ambient: 1.15,
    saturation: 1.15,
    reflection: 1.2,
  },
  ultra: {
    opacity: 0.42,
    blur: 1.8,
    border: 0.75,
    brightness: 1.12,
    depth: 1.28,
    ambient: 1.4,
    saturation: 1.3,
    reflection: 1.4,
  },
};

export type Appearance = {
  accent: Accent;
  density: Density;
  motion: Motion;
  preset: GlassPreset | "custom";
  material: Material;
};

const DEFAULTS: Appearance = {
  accent: "violet",
  density: "comfortable",
  motion: "full",
  preset: "balanced",
  material: { ...GLASS_PRESETS.balanced },
};

const STORAGE_KEY = "nexus-appearance";

const CSS_VAR: Record<MaterialKey, string> = {
  opacity: "--g-opacity",
  blur: "--g-blur",
  border: "--g-border",
  brightness: "--g-brightness",
  depth: "--g-depth",
  ambient: "--g-ambient",
  saturation: "--g-saturation",
  reflection: "--g-reflection",
};

type AppearanceContextValue = Appearance & {
  set: <K extends "accent" | "density" | "motion">(key: K, value: Appearance[K]) => void;
  setMaterial: (key: MaterialKey, value: number) => void;
  applyPreset: (preset: GlassPreset) => void;
  reset: () => void;
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

function apply(value: Appearance) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset["accent"] = value.accent;
  root.dataset["density"] = value.density;
  root.dataset["motion"] = value.motion;
  root.dataset["glassPreset"] = value.preset;
  for (const key of Object.keys(CSS_VAR) as MaterialKey[]) {
    root.style.setProperty(CSS_VAR[key], String(value.material[key]));
  }
}

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearance] = useState<Appearance>(DEFAULTS);

  useEffect(() => {
    let next = DEFAULTS;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<Appearance>;
        next = {
          ...DEFAULTS,
          ...parsed,
          material: { ...DEFAULTS.material, ...(parsed.material ?? {}) },
        };
      }
    } catch {
      next = DEFAULTS;
    }
    setAppearance(next);
    apply(next);
  }, []);

  const commit = useCallback((next: Appearance) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — settings stay in-memory */
    }
    apply(next);
    return next;
  }, []);

  const set = useCallback<AppearanceContextValue["set"]>(
    (key, value) => setAppearance((current) => commit({ ...current, [key]: value })),
    [commit],
  );

  const setMaterial = useCallback(
    (key: MaterialKey, value: number) =>
      setAppearance((current) =>
        commit({
          ...current,
          preset: "custom",
          material: { ...current.material, [key]: value },
        }),
      ),
    [commit],
  );

  const applyPreset = useCallback(
    (preset: GlassPreset) =>
      setAppearance((current) =>
        commit({ ...current, preset, material: { ...GLASS_PRESETS[preset] } }),
      ),
    [commit],
  );

  const reset = useCallback(
    () => setAppearance(() => commit({ ...DEFAULTS, material: { ...DEFAULTS.material } })),
    [commit],
  );

  const value = useMemo(
    () => ({ ...appearance, set, setMaterial, applyPreset, reset }),
    [appearance, set, setMaterial, applyPreset, reset],
  );

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance() {
  const ctx = useContext(AppearanceContext);
  if (!ctx) throw new Error("useAppearance must be used inside AppearanceProvider");
  return ctx;
}
