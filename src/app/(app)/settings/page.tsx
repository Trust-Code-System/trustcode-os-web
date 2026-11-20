import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Input } from "@/components/ui/form-controls";
import { ProfilePhotoManager } from "@/features/settings/components/profile-photo-manager";
import { WorkspaceUrl } from "@/features/settings/components/workspace-url";
import { readSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsProfilePage() {
  const user = await readSessionUser();
  if (!user) redirect("/login");
  return <section className="settings-general-panel">
    <header className="settings-panel-header"><div><h2>General</h2><p>Your workspace identity and personal account details.</p></div><span><ShieldCheck size={13} aria-hidden />Secure workspace</span></header>
    <SettingsRow title="Workspace name" description="The team workspace for clients, projects, and delivery."><div className="settings-name-field"><span className="settings-workspace-avatar">T</span><Input aria-label="Workspace name" value="TrustCode System Limited" readOnly /></div></SettingsRow>
    <SettingsRow title="Workspace URL" description="Where your team signs in. Keep this link close."><WorkspaceUrl /></SettingsRow>
    <SettingsRow title="Brand colour" description="The TrustCode blue used for buttons, links, and selected states."><div className="settings-brand-row"><span className="settings-color-token"><i />#1B3FAE</span><span className="settings-brand-preview">TrustCode blue</span></div></SettingsRow>
    <SettingsRow title="Profile information" description="Your name and email identify you throughout the workspace."><div className="settings-profile-fields"><label><span>Full name</span><Input aria-label="Full name" value={user.name ?? ""} readOnly /></label><label><span>Email address</span><Input aria-label="Email address" type="email" value={user.email} readOnly /></label></div></SettingsRow>
    <SettingsRow title="Account access" description="Your role determines the workspace areas you can manage."><div className="settings-access-row"><span className="settings-role-badge">{user.role === "ADMIN" ? "Administrator" : "Team member"}</span><p>Contact an administrator to change account details.</p></div></SettingsRow>
    {process.env.NEXT_PUBLIC_USE_MOCKS === "true" ? <div className="settings-photo-row"><ProfilePhotoManager user={user} /></div> : null}
    <footer className="settings-panel-footer"><span>TrustCode System Limited</span><span>Account details are managed by your administrator.</span></footer>
  </section>;
}

function SettingsRow({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <div className="settings-form-row"><div><h3>{title}</h3><p>{description}</p></div><div>{children}</div></div>;
}