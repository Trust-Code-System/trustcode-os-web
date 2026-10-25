"use client";

import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { Check, Laptop, Moon, Sun } from "lucide-react";
import { useRef } from "react";
import { IconButton } from "@/components/ui/button";
import { useTheme, type ThemePreference } from "./theme-provider";

export function ThemeSwitcher() {
  const { preference, setTheme } = useTheme();
  const pending = useRef<ThemePreference | null>(null);
  return <Dropdown.Root><Dropdown.Trigger asChild><IconButton aria-label="Color theme" data-preference={preference} className="theme-trigger"><Sun aria-hidden className="theme-icon-light size-4" /><Moon aria-hidden className="theme-icon-dark size-4" /></IconButton></Dropdown.Trigger><Dropdown.Portal><Dropdown.Content onCloseAutoFocus={() => { if (pending.current) { const next = pending.current; pending.current = null; setTheme(next); } }} aria-label="Color theme" align="end" sideOffset={8} collisionPadding={8} className="ui-floating z-[100] min-w-44 rounded-xl border bg-surface-elevated p-1.5 shadow-[var(--shadow-2)]"><Dropdown.Label className="px-3 pb-2 pt-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Appearance</Dropdown.Label><Dropdown.RadioGroup value={preference} onValueChange={(value) => { pending.current = value as ThemePreference; }}>{([{ value: "light", label: "Light", Icon: Sun }, { value: "dark", label: "Dark", Icon: Moon }, { value: "system", label: "Use device setting", Icon: Laptop }] as const).map(({ value, label, Icon }) => <Dropdown.RadioItem key={value} value={value} className="flex min-h-11 cursor-default items-center gap-3 rounded-lg px-3 text-sm outline-none data-[highlighted]:bg-surface-active data-[highlighted]:text-brand"><Icon aria-hidden className="size-4" />{label}<Dropdown.ItemIndicator className="ml-auto"><Check aria-hidden className="size-3.5" /></Dropdown.ItemIndicator></Dropdown.RadioItem>)}</Dropdown.RadioGroup></Dropdown.Content></Dropdown.Portal></Dropdown.Root>;
}
