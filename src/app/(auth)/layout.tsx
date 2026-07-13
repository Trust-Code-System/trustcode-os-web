import type { ReactNode } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main
      id="main-content"
      className="grid min-h-screen place-items-center bg-page p-4"
    >
      <div className="grid w-full max-w-3xl overflow-hidden rounded-[var(--radius-xl)] border border-white/80 bg-surface shadow-[0_28px_80px_rgb(33_47_77/0.16)] md:grid-cols-[0.82fr_1.18fr]">
        <aside className="relative hidden overflow-hidden bg-surface p-8 text-text-primary md:flex md:flex-col md:justify-between">
          <div>
            <BrandLogo />
            <h1 className="mt-8 text-3xl font-bold leading-tight tracking-[-0.045em] text-text-primary">
              Your agency,
              <br />
              in one calm view.
            </h1>
            <p className="mt-3 max-w-xs text-sm leading-6 text-text-secondary">
              Clients, delivery, meetings, documents, and team operations
              without the clutter.
            </p>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
            TrustCode System Limited
          </p>
        </aside>
        <section className="bg-brand p-5 text-white sm:p-8 [&_a]:text-white/85 [&_a:hover]:text-white [&_h1]:text-white [&_label]:text-white [&_input]:text-text-primary [&_textarea]:text-text-primary [&_.text-text-muted]:text-white/70 [&_.text-text-secondary]:text-white/80">
          <p className="mb-6 text-xs text-white/70">Secure agency workspace</p>
          {children}
          <p className="mt-6 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-white/70">
            Enterprise-grade security
          </p>
        </section>
      </div>
    </main>
  );
}
