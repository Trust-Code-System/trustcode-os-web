"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useMotionPreference } from "@/lib/hooks/use-motion-preference";
import { transitionView } from "@/lib/ui/view-transitions";

export type ThemePreference = "light" | "dark" | "system";
const storageKey = "trustcode-theme";
let fallbackPreference: ThemePreference = "system";
const listeners = new Set<() => void>();
function readPreference(): ThemePreference {
  try { const value = localStorage.getItem(storageKey); if (value === "light" || value === "dark" || value === "system") return value; } catch {}
  return fallbackPreference;
}
function notify() { listeners.forEach((listener) => listener()); }
function subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
function serverSnapshot(): ThemePreference { return "system"; }
function applyTheme(preference: ThemePreference) {
  document.documentElement.dataset.theme = preference === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : preference;
}
const ThemeContext = createContext<{ preference: ThemePreference; setTheme: (value: ThemePreference) => void }>({ preference: "system", setTheme: () => undefined });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const preference = useSyncExternalStore(subscribe, readPreference, serverSnapshot);
  const reduced = useMotionPreference();
  const setTheme = useCallback((value: ThemePreference) => {
    transitionView("theme", () => {
      fallbackPreference = value;
      try { localStorage.setItem(storageKey, value); } catch {}
      applyTheme(value);
      notify();
    }, reduced);
  }, [reduced]);
  useEffect(() => {
    applyTheme(readPreference());
    const media = matchMedia("(prefers-color-scheme: dark)");
    const systemChanged = () => { if (readPreference() === "system") applyTheme("system"); };
    const storageChanged = (event: StorageEvent) => { if (event.key === storageKey || event.key === null) { applyTheme(readPreference()); notify(); } };
    media.addEventListener("change", systemChanged);
    window.addEventListener("storage", storageChanged);
    return () => { media.removeEventListener("change", systemChanged); window.removeEventListener("storage", storageChanged); };
  }, []);
  return <ThemeContext.Provider value={{ preference, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() { return useContext(ThemeContext); }

