"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { useMotionPreference } from "@/lib/hooks/use-motion-preference";
import { transitionView } from "@/lib/ui/view-transitions";

export function SoftNavigation({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const reduced = useMotionPreference();
  const pending = useRef<{ pathname: string; finish: () => void } | null>(null);
  useLayoutEffect(() => {
    if (pending.current?.pathname === pathname) {
      document.getElementById("main-content")?.scrollTo({ top: 0, behavior: "instant" });
      pending.current.finish();
      pending.current = null;
    }
  }, [pathname]);
  useEffect(() => {
    const follow = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.detail === 0 || reduced || !document.startViewTransition) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self") || link.dataset.softNavigation === "off") return;
      const destination = new URL(link.href, location.href);
      if (destination.origin !== location.origin || destination.pathname === pathname || destination.hash || /^\/(api|documents\/(invoices|contracts))(\/|$)/.test(destination.pathname)) return;
      event.preventDefault();
      pending.current?.finish();
      transitionView("navigation", () => new Promise<void>((resolve) => {
        const timeout = window.setTimeout(resolve, 4000);
        pending.current = { pathname: destination.pathname, finish: () => { clearTimeout(timeout); resolve(); } };
        router.push(destination.pathname + destination.search, { scroll: false });
      }), false);
    };
    document.addEventListener("click", follow, true);
    return () => { document.removeEventListener("click", follow, true); pending.current?.finish(); pending.current = null; };
  }, [pathname, reduced, router]);
  return children;
}

export function PageEntrance({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (document.documentElement.dataset.transitionKind !== "navigation") ref.current?.setAttribute("data-enter", "true");
  }, []);
  return <div ref={ref} className="route-enter min-w-0">{children}</div>;
}
