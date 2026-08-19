import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type LayoutPreview = "desktop" | "mobile";

const STORAGE_KEY = "nexus-layout-preview";

type LayoutContextValue = {
  preview: LayoutPreview;
  setPreview: (value: LayoutPreview) => void;
};

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [preview, setPreviewState] = useState<LayoutPreview>("desktop");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as LayoutPreview | null;
    if (stored === "mobile" || stored === "desktop") setPreviewState(stored);
  }, []);

  const setPreview = useCallback((value: LayoutPreview) => {
    setPreviewState(value);
    window.localStorage.setItem(STORAGE_KEY, value);
  }, []);

  const value = useMemo(() => ({ preview, setPreview }), [preview, setPreview]);

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayoutPreview() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayoutPreview must be used inside LayoutProvider");
  return ctx;
}
