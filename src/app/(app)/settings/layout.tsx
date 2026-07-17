import type { ReactNode } from "react";

import { PageHeader } from "@/components/ui/navigation";
import { SettingsNav } from "@/features/settings/components/settings-nav";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account preferences and security."
      />
      <div className="grid gap-4 lg:grid-cols-[13rem_1fr]">
        <SettingsNav />
        <div className="min-w-0">{children}</div>
      </div>
    </>
  );
}
