"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { Radio, Select } from "@/components/ui/form-controls";
import { useTheme } from "./theme-provider";

export function AppearancePreferences() {
  const { preference, setTheme } = useTheme();
  return <section className="rounded-[var(--radius-lg)] border bg-surface p-5 md:p-6"><h2 className="text-base font-semibold">Appearance</h2><p className="mt-1 text-sm text-text-secondary">A little more light, or a quieter workspace.</p>
    <fieldset className="mt-6"><legend className="text-sm font-medium">Color theme</legend><div className="mt-3 grid gap-3 sm:grid-cols-3">{([{ value: "light", label: "Light", Icon: Sun }, { value: "dark", label: "Dark", Icon: Moon }, { value: "system", label: "Device", Icon: Laptop }] as const).map(({ value, label, Icon }) => <div key={value} className={`theme-choice rounded-xl border p-3 ${preference === value ? "border-brand bg-surface-active" : "border-border"}`}><div aria-hidden data-preview={value} className="theme-preview"><span /><span /><span /></div><Radio name="color-theme" value={value} checked={preference === value} onChange={() => setTheme(value)} label={<span className="flex items-center gap-2"><Icon aria-hidden className="size-3.5" />{label}</span>} /></div>)}</div><p className="mt-3 text-xs leading-5 text-text-muted">Saved automatically on this browser. Device follows your system’s color setting.</p></fieldset>
    <div className="mt-7 border-t pt-5"><label className="grid max-w-xs gap-2 text-sm"><span className="font-medium">Density</span><Select aria-label="Density" disabled defaultValue="comfortable"><option value="comfortable">Comfortable</option><option value="compact">Compact</option></Select></label><p className="mt-2 text-xs text-text-muted">More density options are coming later.</p></div>
  </section>;
}
