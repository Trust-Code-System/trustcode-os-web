import type { Metadata } from "next";
import { Suspense } from "react";

import { ResetPasswordForm } from "@/features/auth/components/password-forms";

export const metadata: Metadata = { title: "Accept invitation" };
export default function AcceptInvitePage() { return <><h1 className="text-2xl font-semibold">Accept your invitation</h1><p className="mb-6 mt-2 text-sm text-text-secondary">Choose a secure password to activate your TrustCode OS account.</p><Suspense><ResetPasswordForm /></Suspense></>; }
