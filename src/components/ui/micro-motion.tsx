"use client";

import { useMotionPreference } from "@/lib/hooks/use-motion-preference";

// React Bits adaptations. Source revision and license: docs/reactbits-micro-interactions.md.
import { Bell } from "lucide-react";
import { animate, motion, useMotionValue, useSpring, useTransform, useVelocity } from "motion/react";
import { useEffect } from "react";

export const microSpring = { type: "spring" as const, stiffness: 280, damping: 27, mass: 0.8 };

/** Velocity-driven stretch from SquishSwitch, retaining the semantic switch. */
export function SquishThumb({ checked }: { checked: boolean }) {
  const reduce = useMotionPreference();
  const x = useMotionValue(checked ? 20 : 0);
  const flow = useSpring(useVelocity(x), { stiffness: 320, damping: 40, mass: 0.6 });
  const scaleX = useTransform(flow, (speed) => reduce ? 1 : 1 + Math.min(0.28, Math.abs(speed) / 600));
  const scaleY = useTransform(scaleX, (stretch) => 1 / stretch);
  useEffect(() => {
    if (reduce) { x.jump(checked ? 20 : 0); return; }
    const animation = animate(x, checked ? 20 : 0, { type: "spring", stiffness: 170, damping: 21.5, mass: 0.9 });
    return () => animation.stop();
  }, [checked, reduce, x]);
  return <motion.span aria-hidden className="block size-4 rounded-full bg-white shadow" style={{ x, scaleX, scaleY }} />;
}

/** Ring/check vocabulary bound to actual pending and result states. */
export function StatusMark({ status, className = "size-5" }: { status: "running" | "done" | "failed"; className?: string }) {
  const reduce = useMotionPreference();
  return <motion.svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} initial={false}>
    <circle cx="12" cy="12" r="9" opacity=".18" />
    {status === "running" ? <circle className="status-arc" cx="12" cy="12" r="9" strokeDasharray="38 19" /> : <motion.path key={status} d={status === "done" ? "M7.5 12.25 10.5 15.25 16.75 8.75" : "M8.5 8.5 15.5 15.5M15.5 8.5 8.5 15.5"} initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduce ? 0 : 0.32 }} />}
  </motion.svg>;
}

export function NotificationBell() {
  return <Bell aria-hidden className="notification-bell size-4" />;
}
