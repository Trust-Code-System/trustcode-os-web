import type { Metadata } from "next";
import { AppearancePreferences } from "@/components/theme/appearance-preferences";
export const metadata: Metadata = { title: "Appearance settings" };
export default function AppearanceSettingsPage() { return <AppearancePreferences />; }
