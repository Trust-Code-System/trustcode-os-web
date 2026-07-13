import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Sign in" };
export default function LoginPage() { return <><h1 className="text-2xl font-semibold">Welcome back</h1><p className="mb-6 mt-2 text-sm text-text-secondary">Sign in to continue to the TrustCode workspace.</p><Suspense><LoginForm /></Suspense></>; }
