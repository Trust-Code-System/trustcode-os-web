import { ArrowUpRight, Check, FileText, FolderKanban, LockKeyhole, UsersRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo, BrandMark } from "@/components/brand/brand-logo";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";

// Split authentication composition adapted from shadcn login-04, with the existing forms.
// MIT notice: public/licenses/shadcn-ui.txt. No demonstration OAuth actions are included.
export function AuthShell({ children }: { children: ReactNode }) {
  return <main id="main-content" className="auth-screen">
    <header className="auth-topbar"><Link href="https://trustcodesystem.tech/" aria-label="TrustCode company website"><BrandLogo /></Link><div className="flex items-center gap-3"><span className="hidden text-xs text-text-muted sm:block">TrustCode OS</span><ThemeSwitcher /></div></header>
    <div className="auth-composition">
      <section className="auth-form-panel" aria-label="Account access">
        <div className="auth-form-content"><span className="auth-kicker"><LockKeyhole aria-hidden className="size-3.5" />YOUR TEAM WORKSPACE</span>{children}</div>
        <p className="auth-help">Need access? Open the invitation sent to your email, or ask your workspace administrator.</p>
      </section>
      <aside className="auth-story" aria-label="About TrustCode OS">
        <div className="auth-story-heading"><span className="auth-story-kicker">A LITTLE CLARITY GOES A LONG WAY</span><h2>Good work.<br />All in one place.</h2><p>From the first conversation to the final handover. Give every detail a home.</p></div>
        <div className="auth-workflow" aria-label="Clients, delivery and documents in one workspace">
          <div className="auth-workflow-brand"><BrandMark className="size-10" /><div><strong>TrustCode OS</strong><span>Your team, connected</span></div><span className="auth-workflow-dot" /></div>
          {[{ Icon: UsersRound, step: "01", title: "Build the relationship", detail: "Clients & conversations" }, { Icon: FolderKanban, step: "02", title: "Move the work forward", detail: "Projects & milestones" }, { Icon: FileText, step: "03", title: "Make it official", detail: "Invoices & agreements" }].map(({ Icon, step, title, detail }) => <div key={step} className="auth-workflow-step"><span className="auth-workflow-icon"><Icon aria-hidden className="size-4" /></span><div><strong>{title}</strong><span>{detail}</span></div><span className="auth-workflow-number">{step}</span></div>)}
          <div className="auth-workflow-foot"><span><Check aria-hidden className="size-3" /> One shared workspace</span><ArrowUpRight aria-hidden className="size-3.5" /></div>
        </div>
        <div className="auth-story-footer"><span>Software you can stake<br />your business on.</span><span>TRUSTCODE<br />SYSTEM LIMITED</span></div>
      </aside>
    </div>
    <footer className="auth-footer"><span>© {new Date().getFullYear()} TrustCode System Limited</span><a href="mailto:hello@trustcodesystem.tech">Get in touch <ArrowUpRight aria-hidden className="size-3" /></a></footer>
  </main>;
}
