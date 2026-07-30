import type { Metadata } from "next";
import { Suspense } from "react";

import { VerifyEmailForm } from "@/features/auth/components/password-forms";

export const metadata: Metadata = { title: "Verify email" };
export default function VerifyEmailPage() { return <><h1 className="text-2xl font-semibold">Verify your email</h1><p className="mb-6 mt-2 text-sm text-text-secondary">Confirming the address on your TrustCode OS account.</p><Suspense><VerifyEmailForm /></Suspense></>; }
