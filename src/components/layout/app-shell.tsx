"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, CircleHelp, Menu, PanelLeft, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { BrandMark, BrandWordmark } from "@/components/brand/brand-logo";
import { Avatar } from "@/components/ui/data-display";
import { IconButton } from "@/components/ui/button";
import { NotificationBell } from "@/components/ui/micro-motion";
import { CommandMenu } from "@/components/ui/navigation";
import {
  Dialog,
  DropdownMenu,
  Popover,
  Tooltip,
} from "@/components/ui/overlays";
import { authApi } from "@/features/auth/api/auth";
import { useSession } from "@/features/auth/hooks/use-session";
import type { SessionUser } from "@/features/auth/types/auth";
import {
  primaryNavigation,
  secondaryNavigation,
  type NavigationItem,
} from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";
import { clearAppCache } from "@/lib/query/cache";
import { useFoldingSidebar } from "./use-folding-sidebar";

export function AppShell({
  initialUser,
  children,
}: {
  initialUser: SessionUser;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const session = useSession(initialUser);
  const user = session.data;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const { frameRef, toggleRef, folded, toggle, handleProps } = useFoldingSidebar();

  useEffect(() => {
    if (session.error && "status" in session.error && session.error.status === 401) {
      void clearAppCache(queryClient).then(() => window.location.replace(`/login?returnTo=${encodeURIComponent(pathname)}`));
    }
  }, [pathname, queryClient, session.error]);
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  const logout = useMutation({
    mutationFn: authApi.logout,
    onSettled: async () => {
      await clearAppCache(queryClient);
      window.location.replace("/login");
    },
  });
  const allNavigation = [...primaryNavigation, ...secondaryNavigation];
  const currentSection = allNavigation.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.label ?? "Workspace";

  return (
    <div className="app-viewport">
      <div className="app-frame" ref={frameRef}>
        <aside id="os-desktop-navigation" className="fold-sidebar" aria-label="Workspace sidebar" aria-hidden={folded} inert={folded}>
          <div className="fold-sidebar-leaf">
            <div className="fold-sidebar-contents">
              <Link href="/dashboard" aria-label="TrustCode OS dashboard" className="sidebar-brand">
                <BrandMark className="size-10" />
                <span><BrandWordmark className="h-7 w-auto" /><span className="sidebar-brand-caption">TEAM WORKSPACE</span></span>
              </Link>
              <button type="button" className="sidebar-search" onClick={() => setCommandOpen(true)} aria-label="Search workspace">
                <Search aria-hidden className="size-4" /><span>Find a page...</span><kbd>⌘K</kbd>
              </button>
              <nav aria-label="Primary navigation" className="sidebar-navigation">
                <p className="sidebar-group-label">Workspace</p>
                <RailNavigation items={primaryNavigation} pathname={pathname} role={user.role} />
                <p className="sidebar-group-label mt-7">Manage</p>
                <RailNavigation items={secondaryNavigation} pathname={pathname} role={user.role} />
              </nav>
              <div className="sidebar-footer">
                <a href="mailto:hello@trustcodesystem.tech" className="sidebar-help"><CircleHelp aria-hidden className="size-4" />Help and support<ChevronRight aria-hidden className="ml-auto size-3.5" /></a>
                <Link href="/settings/profile" className="sidebar-profile">
                  <Avatar name={user.name ?? user.email} {...(user.avatarUrl ? { src: user.avatarUrl } : {})} size="sm" />
                  <span className="min-w-0"><strong className="block truncate text-xs font-semibold">{user.name ?? user.email}</strong><span className="mt-0.5 block text-[11px] text-text-muted">{user.role === "ADMIN" ? "Administrator" : "Team member"}</span></span>
                  <ChevronRight aria-hidden className="ml-auto size-3.5 shrink-0 text-text-muted" />
                </Link>
              </div>
            </div>
          </div>
        </aside>
        <button type="button" className="sidebar-fold-handle" aria-label={folded ? "Expand sidebar by dragging" : "Collapse sidebar by dragging"} aria-controls="os-desktop-navigation" aria-expanded={!folded} title="Click to toggle or drag to fold" {...handleProps}><span /></button>
        <div className="app-content flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="workspace-toolbar z-20 flex h-[4.5rem] shrink-0 items-center gap-2 border-b border-border/70 bg-surface px-3 md:px-6">
            <Dialog
              open={mobileOpen}
              onOpenChange={setMobileOpen}
              side="left"
              title="TrustCode OS"
              description="Agency workspace"
              trigger={
                <IconButton aria-label="Open navigation" className="size-11 lg:hidden">
                  <Menu aria-hidden className="size-5" />
                </IconButton>
              }
            >
              <nav aria-label="Mobile navigation">
                <MobileNavigation
                  items={allNavigation}
                  pathname={pathname}
                  role={user.role}
                  onNavigate={() => setMobileOpen(false)}
                />
              </nav>
            </Dialog>
            <Tooltip content={folded ? "Expand sidebar · Ctrl+B" : "Collapse sidebar · Ctrl+B"}>
              <IconButton ref={toggleRef} aria-label={folded ? "Expand sidebar" : "Collapse sidebar"} aria-controls="os-desktop-navigation" aria-expanded={!folded} onClick={toggle} className="desktop-sidebar-toggle">
                <PanelLeft aria-hidden className="size-[1.1rem]" />
              </IconButton>
            </Tooltip>
            <div className="hidden min-w-0 items-center gap-3 text-xs lg:flex"><span className="text-text-muted">Workspace</span><span aria-hidden className="text-border-strong">/</span><span className="truncate font-semibold">{currentSection}</span></div>
            <Link
              href="/dashboard"
              aria-label="TrustCode OS dashboard"
              className="inline-flex shrink-0 items-center gap-1.5 lg:hidden"
            >
              <BrandMark className="lg:hidden" />
              <BrandWordmark className="h-8 w-auto sm:h-9" />
            </Link>
            <button
              type="button"
              aria-label="Search workspace"
              onClick={() => setCommandOpen(true)}
              className="ml-auto flex min-h-9 min-w-0 items-center gap-2 rounded-full border bg-surface px-3 text-left text-xs text-text-muted shadow-[var(--shadow-inset)] hover:border-border-strong hover:bg-surface-hover sm:w-48 lg:ml-auto"
            >
              <Search aria-hidden className="size-4 shrink-0" />
              <span className="hidden min-w-0 flex-1 truncate sm:inline">
                Search workspace
              </span>
              <kbd className="ml-auto hidden rounded-md border px-1.5 py-0.5 font-mono text-[9px] xl:inline">
                ⌘K
              </kbd>
            </button>
            <Popover
              label="Notifications"
              trigger={
                <IconButton aria-label="Notifications">
                  <NotificationBell />
                </IconButton>
              }
            >
              <p className="text-sm font-semibold">Notifications</p>
              <p className="mt-2 text-sm text-text-secondary">
                You’re all caught up. New activity will appear here.
              </p>
            </Popover>
            <DropdownMenu
              label="User menu"
              trigger={
                <button
                  type="button"
                  aria-label="User menu" className="ml-1 rounded-full ring-offset-2 focus-visible:outline-2 focus-visible:outline-focus"
                >
                  <Avatar name={user.name ?? user.email} {...(user.avatarUrl ? { src: user.avatarUrl } : {})} size="sm" />
                </button>
              }
              items={[
                { label: user.email, disabled: true },
                { label: "Profile settings", href: "/settings/profile" },
                {
                  label: logout.isPending ? "Signing out…" : "Sign out",
                  onSelect: () => logout.mutate(),
                  disabled: logout.isPending,
                },
              ]}
            />
          </header>
          <main
            id="main-content"
            className="workspace-main min-h-0 flex-1 overflow-y-auto overscroll-contain bg-workspace px-4 py-6 md:px-7 md:py-7"
          >
            {children}
          </main>
        </div>
        <CommandMenu
          open={commandOpen}
          onOpenChange={setCommandOpen}
          links={allNavigation.filter((item) => !item.roles || item.roles.includes(user.role)).map(({ label, href }) => ({ label, href }))}
        />
      </div>
    </div>
  );
}

function RailNavigation({
  items,
  pathname,
  role,
}: {
  items: NavigationItem[];
  pathname: string;
  role: SessionUser["role"];
}) {
  return (
    <ul className="grid gap-1">
      {items.filter((item) => !item.roles || item.roles.includes(role)).map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return <li key={item.href}><Link href={item.href} aria-label={item.label} aria-current={active ? "page" : undefined} className={cn("sidebar-link", active && "is-active")}><Icon aria-hidden className="size-[1.1rem] shrink-0" /><span>{item.label}</span>{active ? <span className="sidebar-active-dot" aria-hidden /> : null}</Link></li>;
      })}
    </ul>
  );
}

function MobileNavigation({
  items,
  pathname,
  role,
  onNavigate,
}: {
  items: NavigationItem[];
  pathname: string;
  role: SessionUser["role"];
  onNavigate: () => void;
}) {
  return (
    <ul className="grid gap-1">
      {items
        .filter((item) => !item.roles || item.roles.includes(role))
        .map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-[var(--radius-md)] px-3 text-sm font-semibold text-text-secondary hover:bg-surface-hover hover:text-text-primary",
                  active && "bg-surface-active text-brand",
                )}
              >
                <Icon aria-hidden className="size-4" />
                {item.label}
              </Link>
            </li>
          );
        })}
    </ul>
  );
}
