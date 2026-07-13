import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { readSessionUser } from "@/lib/auth/session";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const user = await readSessionUser();
  if (!user) redirect("/login");
  return <AppShell initialUser={user}>{children}</AppShell>;
}
