import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form-controls";
import { SectionHeader } from "@/components/ui/navigation";
import type { SessionUser } from "@/features/auth/types/auth";
import { ProfilePhotoManager } from "@/features/settings/components/profile-photo-manager";
import { readSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Settings" };

const unavailable =
  "This action will be enabled when its backend contract is implemented.";

export default async function SettingsProfilePage() {
  const user = await readSessionUser();
  if (!user) redirect("/login");
  return <ProfileSettingsPanel user={user} />;
}

function ProfileSettingsPanel({ user }: { user: SessionUser }) {
  const [firstName = "Admin", lastName = "User"] = (
    user.name ?? "Admin User"
  ).split(" ");

  return (
    <div className="grid gap-4">
      <section className="surface-panel p-3.5">
        <SectionHeader title="Profile information" />
        <p className="mb-5 text-sm text-text-secondary">
          Update your account profile information and email address.
        </p>
        {process.env.NEXT_PUBLIC_USE_MOCKS === "true" ? (
          <ProfilePhotoManager user={user} />
        ) : (
          <section className="mb-5 border-b pb-5" aria-labelledby="profile-photo-heading">
            <h3 id="profile-photo-heading" className="text-sm font-semibold">Profile photo</h3>
            <p className="mt-1 text-xs text-text-secondary">Profile-photo upload is unavailable because the current backend does not expose a profile avatar endpoint.</p>
          </section>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" value={firstName} />
          <Field label="Last name" value={lastName} />
          <div className="sm:col-span-2">
            <Field label="Email address" value={user.email} />
          </div>
          <div className="sm:col-span-2">
            <Field
              label="Role / title"
              value={
                user.role === "ADMIN"
                  ? "System administrator"
                  : "Team member"
              }
            />
          </div>
        </div>
        <Button
          className="mt-5 sm:ml-auto sm:flex"
          disabled
          title={unavailable}
        >
          Save changes
        </Button>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="grid gap-1.5 text-xs font-medium text-text-secondary">
      {label}
      <Input value={value} readOnly />
    </label>
  );
}
