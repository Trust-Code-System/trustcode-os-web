import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <main id="main-content" className="grid min-h-screen place-items-center px-4 py-10"><div className="w-full max-w-md"><div className="mb-8 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-[var(--radius-md)] bg-brand font-bold text-brand-contrast">TC</span><div><p className="font-semibold">TrustCode OS</p><p className="text-xs text-text-muted">Agency workspace</p></div></div><div className="rounded-[var(--radius-lg)] border bg-surface p-6 shadow-[var(--shadow-1)] sm:p-8">{children}</div></div></main>;
}
