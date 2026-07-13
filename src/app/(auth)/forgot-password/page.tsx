import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/components/password-forms";

export const metadata: Metadata = { title: "Forgot password" };
export default function ForgotPasswordPage() { return <><h1 className="text-2xl font-semibold">Reset your password</h1><p className="mb-6 mt-2 text-sm text-text-secondary">Enter your account email and we’ll send instructions if it exists.</p><ForgotPasswordForm /></>; }
