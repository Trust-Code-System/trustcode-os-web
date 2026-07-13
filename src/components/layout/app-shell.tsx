"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, ChevronsLeft, ChevronsRight, Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { Avatar } from "@/components/ui/data-display";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button, IconButton } from "@/components/ui/button";
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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => { const frame = window.requestAnimationFrame(() => setCollapsed(window.localStorage.getItem("tc_sidebar_collapsed") === "true")); return () => window.cancelAnimationFrame(frame); }, []);
  useEffect(() => { if (session.error && "status" in session.error && session.error.status === 401) router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`); }, [pathname, router, session.error]);
  useEffect(() => {
    const listener = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setCommandOpen((value) => !value); } };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  const logout = useMutation({ mutationFn: authApi.logout, onSettled: async () => { queryClient.removeQueries(); await queryClient.cancelQueries({ queryKey: sessionKeys.all }); router.replace("/login"); router.refresh(); } });
  const toggleCollapsed = () => setCollapsed((value) => { window.localStorage.setItem("tc_sidebar_collapsed", String(!value)); return !value; });

  return <div className="min-h-screen bg-page">
    <aside className={cn("fixed inset-y-0 left-0 z-30 hidden bg-sidebar text-white transition-[width] lg:flex lg:flex-col", collapsed ? "w-16" : "w-56")}>
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-3">{collapsed ? <span className="grid size-9 shrink-0 place-items-center rounded-[var(--radius-md)] bg-brand text-xs font-bold">TC</span> : <BrandLogo inverse className="w-40" />}</div>
      <nav aria-label="Primary navigation" className="flex-1 overflow-y-auto p-2"><NavigationList items={primaryNavigation} pathname={pathname} role={user.role} collapsed={collapsed} inverse /><div className="my-3 border-t border-white/10" /><NavigationList items={secondaryNavigation} pathname={pathname} role={user.role} collapsed={collapsed} inverse /></nav>
      <div className="border-t border-white/10 p-2"><Tooltip content={collapsed ? "Expand sidebar" : "Collapse sidebar"}><Button variant="ghost" className={cn("w-full text-white/70 hover:bg-white/10 hover:text-white", collapsed ? "px-0" : "justify-start")} onClick={toggleCollapsed}>{collapsed ? <ChevronsRight aria-hidden className="size-4" /> : <><ChevronsLeft aria-hidden className="size-4" />Collapse</>}</Button></Tooltip></div>
    </aside>

    <div className={cn("min-w-0", collapsed ? "lg:pl-16" : "lg:pl-56")}>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b bg-surface/95 px-4 backdrop-blur md:px-6">
        <Dialog open={mobileOpen} onOpenChange={setMobileOpen} side="left" title="TrustCode OS" description="Agency workspace" trigger={<IconButton aria-label="Open navigation" className="lg:hidden"><Menu aria-hidden className="size-5" /></IconButton>}><nav aria-label="Mobile navigation"><NavigationList items={[...primaryNavigation, ...secondaryNavigation]} pathname={pathname} role={user.role} onNavigate={() => setMobileOpen(false)} /></nav></Dialog>
        <button type="button" onClick={() => setCommandOpen(true)} className="ml-1 flex min-h-10 min-w-0 flex-1 items-center gap-2 rounded-[var(--radius-md)] border bg-surface px-3 text-left text-sm text-text-muted hover:bg-surface-hover md:max-w-sm"><Search aria-hidden className="size-4 shrink-0" /><span className="hidden min-w-0 flex-1 truncate sm:inline">Search navigation</span><kbd className="ml-auto hidden shrink-0 rounded border px-1.5 py-0.5 text-[10px] md:inline">Ctrl K</kbd></button>
        <div className="ml-auto flex items-center gap-1"><Popover label="Notifications" trigger={<IconButton aria-label="Notifications"><Bell aria-hidden className="size-5" /></IconButton>}><p className="text-sm font-medium">Notifications</p><p className="mt-2 text-sm text-text-secondary">You’re all caught up. New activity will appear here.</p></Popover><DropdownMenu label="User menu" trigger={<button type="button" className="ml-1 rounded-full"><Avatar name={user.name ?? user.email} size="sm" /></button>} items={[{ label: user.email, disabled: true }, { label: "Profile settings", href: "/settings/profile" }, { label: logout.isPending ? "Signing out…" : "Sign out", onSelect: () => logout.mutate(), disabled: logout.isPending }]} /></div>
      </header>
      <main id="main-content" className="mx-auto w-full max-w-[90rem] px-4 py-6 md:px-6">{children}</main>
    </div>
    <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} links={quickLinks} />
  </div>;
}

function NavigationList({ items, pathname, role, collapsed = false, onNavigate, inverse = false }: { items: NavigationItem[]; pathname: string; role: SessionUser["role"]; collapsed?: boolean; onNavigate?: () => void; inverse?: boolean }) {
  return <ul className="grid gap-1">{items.filter((item) => !item.roles || item.roles.includes(role)).map((item) => { const active = pathname === item.href || pathname.startsWith(`${item.href}/`); const Icon = item.icon; const link = <Link href={item.href} {...(onNavigate ? { onClick: onNavigate } : {})} aria-current={active ? "page" : undefined} className={cn("relative flex min-h-11 items-center gap-3 rounded-[var(--radius-md)] px-3 text-sm font-medium", inverse ? "text-white/65 hover:bg-white/10 hover:text-white" : "text-text-secondary hover:bg-surface-hover hover:text-text-primary", active && (inverse ? "bg-white/10 text-white before:absolute before:-left-2 before:h-6 before:w-1 before:rounded-r before:bg-[#6f8eff]" : "bg-surface-active text-text-primary"), collapsed && "justify-center px-0")}><Icon aria-hidden className="size-4.5 shrink-0" />{collapsed ? null : <span className="truncate">{item.label}</span>}</Link>; return <li key={item.href}>{collapsed ? <Tooltip content={item.label}>{link}</Tooltip> : link}</li>; })}</ul>;
}
