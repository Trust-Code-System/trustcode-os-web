import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/components/password-forms";

export const metadata: Metadata = { title: "Reset password" };
export default function ResetPasswordPage() { return <><h1 className="text-2xl font-semibold">Choose a new password</h1><p className="mb-6 mt-2 text-sm text-text-secondary">Use a unique password you do not use elsewhere.</p><Suspense><ResetPasswordForm /></Suspense></>; }
