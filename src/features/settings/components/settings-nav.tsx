"use client";

import { useMotionPreference } from "@/lib/hooks/use-motion-preference";

import {
  Activity,
  Palette,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useId } from "react";
import { microSpring } from "@/components/ui/micro-motion";

const sections = [
  { label: "Profile", href: "/settings", icon: UsersRound, match: (path: string) => path === "/settings" || path === "/settings/profile" },
  { label: "Security", href: "/settings/security", icon: ShieldCheck, match: (path: string) => path.startsWith("/settings/security") },
  { label: "Appearance", href: "/settings/appearance", icon: Palette, match: (path: string) => path.startsWith("/settings/appearance") },
  { label: "Notifications", href: "/settings/notifications", icon: Activity, match: (path: string) => path.startsWith("/settings/notifications") },
] as const;

export function SettingsNav() {
  const pathname = usePathname();
  const id = useId();
  const reduce = useMotionPreference();

  return (
    <nav
      aria-label="Settings sections"
      className="relative isolate rounded-xl border bg-surface p-2 lg:self-start"
    >
      {sections.map((section) => {
        const Icon = section.icon;
        const active = section.match(pathname);

        return (
          <Link
            key={section.href}
            href={section.href}
            aria-current={active ? "page" : undefined}
            className={`relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors ${
              active
                ? "font-medium text-brand"
                : "text-text-secondary hover:bg-surface-hover"
            }`}
          >
            {active ? <motion.span aria-hidden layoutId={`${id}-settings`} className="micro-tab-thumb absolute inset-0 -z-10 rounded-lg bg-surface-active" transition={reduce ? { duration: 0 } : microSpring} /> : null}
            <Icon className="size-4 shrink-0" aria-hidden />
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
