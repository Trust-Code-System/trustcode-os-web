"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CircleHelp, Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Avatar } from "@/components/ui/data-display";
import { IconButton } from "@/components/ui/button";
import { CommandMenu } from "@/components/ui/navigation";
import { Dialog, DropdownMenu, Popover, Tooltip } from "@/components/ui/overlays";
import { authApi } from "@/features/auth/api/auth";
import { sessionKeys, useSession } from "@/features/auth/hooks/use-session";
import type { SessionUser } from "@/features/auth/types/auth";
import { primaryNavigation, quickLinks, secondaryNavigation, type NavigationItem } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";

export function AppShell({ initialUser, children }: { initialUser: SessionUser; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useSession(initialUser);
  const user = session.data;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => { if (session.error && "status" in session.error && session.error.status === 401) router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`); }, [pathname, router, session.error]);
  useEffect(() => {
    const listener = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setCommandOpen((value) => !value); } };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  const logout = useMutation({ mutationFn: authApi.logout, onSettled: async () => { queryClient.removeQueries(); await queryClient.cancelQueries({ queryKey: sessionKeys.all }); router.replace("/login"); router.refresh(); } });
  const allNavigation = [...primaryNavigation, ...secondaryNavigation];
  const topNavigation = primaryNavigation.filter((item) => ["/dashboard", "/clients", "/projects", "/meetings", "/documents"].includes(item.href));

  return <div className="app-viewport">
    <div className="app-frame">
      <aside className="hidden h-full w-[4.25rem] shrink-0 flex-col items-center bg-sidebar lg:flex">
        <Link href="/dashboard" aria-label="TrustCode OS dashboard" className="mt-3 grid size-10 place-items-center rounded-[0.85rem] bg-brand text-xs font-extrabold text-white shadow-[0_8px_18px_rgb(27_63_174/0.24)]">TC</Link>
        <nav aria-label="Primary navigation" className="mt-8 flex flex-1 flex-col items-center gap-1.5"><RailNavigation items={allNavigation} pathname={pathname} role={user.role} /></nav>
        <div className="mb-3 grid gap-2"><Tooltip content="Help and support"><IconButton aria-label="Help and support" className="text-text-muted"><CircleHelp aria-hidden className="size-4" /></IconButton></Tooltip><DropdownMenu label="User menu" trigger={<button type="button" className="rounded-full ring-offset-2 focus-visible:outline-2 focus-visible:outline-focus"><Avatar name={user.name ?? user.email} size="sm" /></button>} items={[{ label: user.email, disabled: true }, { label: "Profile settings", href: "/settings/profile" }, { label: logout.isPending ? "Signing out…" : "Sign out", onSelect: () => logout.mutate(), disabled: logout.isPending }]} /></div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="z-20 flex h-16 shrink-0 items-center gap-2 border-b border-border/70 bg-surface px-3 md:px-4">
          <Dialog open={mobileOpen} onOpenChange={setMobileOpen} side="left" title="TrustCode OS" description="Agency workspace" trigger={<IconButton aria-label="Open navigation" className="lg:hidden"><Menu aria-hidden className="size-5" /></IconButton>}><nav aria-label="Mobile navigation"><MobileNavigation items={allNavigation} pathname={pathname} role={user.role} onNavigate={() => setMobileOpen(false)} /></nav></Dialog>
          <Link href="/dashboard" aria-label="TrustCode OS dashboard" className="shrink-0"><BrandLogo className="w-24 sm:w-28" /></Link>
          <nav aria-label="Workspace navigation" className="hidden items-center gap-1 lg:flex">{topNavigation.map((item) => { const active = pathname === item.href || pathname.startsWith(`${item.href}/`); return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("rounded-full px-3 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary", active && "bg-text-primary text-white hover:bg-text-primary hover:text-white")}>{item.label}</Link>; })}</nav>
          <button type="button" onClick={() => setCommandOpen(true)} className="ml-auto flex min-h-9 min-w-0 items-center gap-2 rounded-full border bg-surface px-3 text-left text-xs text-text-muted shadow-[var(--shadow-inset)] hover:border-border-strong hover:bg-surface-hover sm:w-48 lg:ml-auto"><Search aria-hidden className="size-4 shrink-0" /><span className="hidden min-w-0 flex-1 truncate sm:inline">Search workspace</span><kbd className="ml-auto hidden rounded-md border px-1.5 py-0.5 font-mono text-[9px] xl:inline">⌘K</kbd></button>
          <Popover label="Notifications" trigger={<IconButton aria-label="Notifications"><Bell aria-hidden className="size-4" /></IconButton>}><p className="text-sm font-semibold">Notifications</p><p className="mt-2 text-sm text-text-secondary">You’re all caught up. New activity will appear here.</p></Popover>
          <DropdownMenu label="User menu" trigger={<button type="button" className="ml-1 rounded-full ring-offset-2 focus-visible:outline-2 focus-visible:outline-focus lg:hidden"><Avatar name={user.name ?? user.email} size="sm" /></button>} items={[{ label: user.email, disabled: true }, { label: "Profile settings", href: "/settings/profile" }, { label: logout.isPending ? "Signing out…" : "Sign out", onSelect: () => logout.mutate(), disabled: logout.isPending }]} />
        </header>
        <main id="main-content" className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-workspace px-3 py-4 md:px-5 md:py-5">{children}</main>
      </div>
      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} links={quickLinks} />
    </div>
  </div>;
}

function RailNavigation({ items, pathname, role }: { items: NavigationItem[]; pathname: string; role: SessionUser["role"] }) {
  return <ul className="grid gap-1.5">{items.filter((item) => !item.roles || item.roles.includes(role)).map((item) => { const active = pathname === item.href || pathname.startsWith(`${item.href}/`); const Icon = item.icon; return <li key={item.href}><Tooltip content={item.label}><Link href={item.href} aria-label={item.label} aria-current={active ? "page" : undefined} className={cn("grid size-10 place-items-center rounded-[0.8rem] text-text-muted transition-[color,background-color,box-shadow,transform] hover:-translate-y-0.5 hover:bg-surface-hover hover:text-text-primary", active && "bg-text-primary text-white shadow-[0_7px_16px_rgb(16_21_31/0.18)] hover:bg-text-primary hover:text-white")}><Icon aria-hidden className="size-[1.05rem]" /></Link></Tooltip></li>; })}</ul>;
}

function MobileNavigation({ items, pathname, role, onNavigate }: { items: NavigationItem[]; pathname: string; role: SessionUser["role"]; onNavigate: () => void }) {
  return <ul className="grid gap-1">{items.filter((item) => !item.roles || item.roles.includes(role)).map((item) => { const active = pathname === item.href || pathname.startsWith(`${item.href}/`); const Icon = item.icon; return <li key={item.href}><Link href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 items-center gap-3 rounded-[var(--radius-md)] px-3 text-sm font-semibold text-text-secondary hover:bg-surface-hover hover:text-text-primary", active && "bg-surface-active text-brand")}><Icon aria-hidden className="size-4" />{item.label}</Link></li>; })}</ul>;
}
