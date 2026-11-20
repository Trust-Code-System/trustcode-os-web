"use client";

import { useMotionPreference } from "@/lib/hooks/use-motion-preference";

import {
  Activity,
  Palette,
  ShieldCheck,
  UsersRound,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useId } from "react";
import { microSpring } from "@/components/ui/micro-motion";

const sections = [
  { label: "General", href: "/settings", icon: Building2, match: (path: string) => path === "/settings" || path === "/settings/profile" },
  { label: "Team & roles", href: "/settings/team", icon: UsersRound, match: (path: string) => path.startsWith("/settings/team") },
  { label: "Security", href: "/settings/security", icon: ShieldCheck, match: (path: string) => path.startsWith("/settings/security") },
  { label: "Appearance", href: "/settings/appearance", icon: Palette, match: (path: string) => path.startsWith("/settings/appearance") },
  { label: "Notifications", href: "/settings/notifications", icon: Activity, match: (path: string) => path.startsWith("/settings/notifications") },
] as const;

export function SettingsNav({ showTeam = false }: { showTeam?: boolean }) {
  const pathname = usePathname();
  const id = useId();
  const reduce = useMotionPreference();

  return (
    <nav
      aria-label="Settings sections"
      className="settings-section-nav relative isolate"
    >
      <p className="settings-nav-group">Workspace</p>
      {sections.filter((section) => section.href !== "/settings/team" || showTeam).map((section) => {
        const Icon = section.icon;
        const active = section.match(pathname);

        return (
          <Link
            key={section.href}
            href={section.href}
            aria-current={active ? "page" : undefined}
            className={`settings-section-link relative flex items-center gap-3 rounded-lg px-3 text-sm transition-colors ${
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
      <div className="settings-nav-footer"><Building2 size={20} aria-hidden /><div><strong>TrustCode System</strong><span>Agency workspace</span></div></div>
    </nav>
  );
}
