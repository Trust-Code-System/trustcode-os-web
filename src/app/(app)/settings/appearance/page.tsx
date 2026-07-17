import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form-controls";

export const metadata: Metadata = { title: "Appearance settings" };

const unavailable =
  "This action will be enabled when its backend contract is implemented.";

export default function AppearanceSettingsPage() {
  return (
    <section className="rounded-[var(--radius-lg)] border bg-surface p-5 md:p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-text-primary">Appearance</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Choose how TrustCode looks across your workspace.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-text-primary">Theme</span>
          <Select
            aria-label="Theme"
            disabled
            defaultValue="light"
            onValueChange={() => undefined}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </Select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-text-primary">Density</span>
          <Select
            aria-label="Density"
            disabled
            defaultValue="comfortable"
            onValueChange={() => undefined}
          >
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </Select>
        </label>
      </div>
      <p className="mt-3 text-xs text-text-muted">{unavailable}</p>
      <Button className="mt-5 sm:ml-auto sm:flex" disabled title={unavailable}>
        Save appearance
      </Button>
    </section>
  );
}
