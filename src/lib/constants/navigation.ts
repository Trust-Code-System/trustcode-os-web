import { Activity, BriefcaseBusiness, FileText, FolderKanban, LayoutDashboard, Settings, Users, UsersRound, Video } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { Role } from "@/features/auth/types/auth";

export type NavigationItem = { label: string; href: string; icon: LucideIcon; roles?: Role[] };

export const primaryNavigation: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clients", href: "/clients", icon: BriefcaseBusiness },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Meetings", href: "/meetings", icon: Video },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Activity", href: "/activity", icon: Activity },
];

export const secondaryNavigation: NavigationItem[] = [
  { label: "Team", href: "/team", icon: UsersRound, roles: ["ADMIN"] },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const quickLinks = [...primaryNavigation, ...secondaryNavigation].map(({ label, href }) => ({ label, href }));

export const workspaceIcon = Users;
