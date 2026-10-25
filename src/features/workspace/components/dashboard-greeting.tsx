"use client";

import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useSyncExternalStore } from "react";
import { sessionKeys } from "@/features/auth/hooks/use-session";
import type { SessionUser } from "@/features/auth/types/auth";
import { useMotionPreference } from "@/lib/hooks/use-motion-preference";
import { greetingFor } from "../greetings";

let visit = 0;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  if (!listeners.size) { visit++; timer = setInterval(() => listeners.forEach((notify) => notify()), 60_000); }
  listeners.add(listener);
  return () => { listeners.delete(listener); if (!listeners.size) clearInterval(timer); };
}
function snapshot() { return Math.floor(Date.now() / 60_000) * 1000 + visit % 1000; }
function serverSnapshot() { return 0; }

export function DashboardGreeting() {
  const stamp = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const reduced = useMotionPreference();
  const user = useQueryClient().getQueryData<SessionUser>(sessionKeys.current());
  const date = new Date(Math.floor(stamp / 1000) * 60_000);
  const greeting = greetingFor(date, stamp % 1000 + date.getDate() * 7);
  const firstName = user?.name?.trim().split(/\s+/)[0];
  return <span data-testid="dashboard-greeting" className="block min-h-12"><AnimatePresence initial={false} mode="wait"><motion.span key={stamp ? `${greeting.period}-${greeting.note}` : "welcome"} className="block" initial={{ opacity: 0, y: reduced ? 0 : 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -3 }} transition={{ duration: reduced ? 0 : .35, ease: [.22,.68,0,1] }}><span className="block text-sm font-medium text-text-primary">{stamp ? greeting.title : "Welcome back"}{stamp && greeting.period === 7 ? "" : firstName ? `, ${firstName}.` : "."}</span><span className="mt-1 block text-xs text-text-secondary">{stamp ? greeting.note : "A little clarity for the work ahead."}</span></motion.span></AnimatePresence></span>;
}
