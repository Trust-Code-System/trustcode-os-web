import type { Metadata } from "next";
import { PageHeader, Breadcrumb } from "@/components/ui/navigation";
import { ChangePasswordForm } from "@/features/auth/components/password-forms";

export const metadata: Metadata = { title: "Security settings" };
export default function SecuritySettingsPage() { return <><PageHeader title="Security" description="Update the password used to access your account." breadcrumb={<Breadcrumb items={[{ label: "Settings", href: "/settings" }, { label: "Security" }]} />} /><section className="rounded-[var(--radius-lg)] border bg-surface p-5 md:p-6"><ChangePasswordForm /></section></>; }
