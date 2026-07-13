import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <main id="main-content" className="grid min-h-screen place-items-center bg-page px-4 py-10"><div className="w-full max-w-md"><div className="mb-6 text-center"><BrandLogo className="mx-auto w-44" /><p className="mt-3 font-semibold">TrustCode OS</p><p className="mt-1 text-xs text-text-muted">Sign in to your mission control.</p></div><div className="rounded-[var(--radius-lg)] border bg-surface p-6 shadow-[var(--shadow-1)] sm:p-8">{children}</div><p className="mt-5 text-center font-mono text-[10px] uppercase tracking-wider text-text-muted">Enterprise-grade security</p></div></main>;
}
