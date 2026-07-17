import type { Metadata } from "next";

import { ChangePasswordForm } from "@/features/auth/components/password-forms";

export const metadata: Metadata = { title: "Security settings" };

export default function SecuritySettingsPage() {
  return (
    <section className="rounded-[var(--radius-lg)] border bg-surface p-5 md:p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-text-primary">Security</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Update the password used to access your account.
        </p>
      </div>
      <ChangePasswordForm />
    </section>
  );
}
