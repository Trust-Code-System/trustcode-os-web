import type { Metadata } from "next";
import { AppsScreen } from "@/features/apps/components/apps-screen";

export const metadata: Metadata = { title: "Apps & subscriptions" };

export default function AppsPage() {
  return <AppsScreen />;
}
