import type { ReactNode } from "react";
import Link from "next/link";
import { ScrollText } from "lucide-react";
import { SettingsNav } from "@/features/settings/components/settings-nav";
import { readSessionUser } from "@/lib/auth/session";

export default async function SettingsLayout({ children }: { children: ReactNode }) {
  const user = await readSessionUser();
  return (
    <section className="settings-workspace">
      <header className="settings-workspace-heading"><div><h1 aria-label="Settings">Workspace settings</h1><p>Manage your TrustCode profile, team, and workspace preferences.</p></div><Link href="/activity" className="settings-audit-link"><ScrollText size={14} aria-hidden />View audit log</Link></header>
      <div className="settings-workspace-grid">
        <SettingsNav showTeam={user?.role === "ADMIN"} />
        <div className="settings-workspace-content">{children}</div>
      </div>
    </section>
  );
}
