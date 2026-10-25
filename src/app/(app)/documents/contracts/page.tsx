import type { Metadata } from "next";
import { StudioPage } from "@/features/studios/components/studio-page";

export const metadata: Metadata = { title: "Contract studio", robots: { index: false, follow: false } };
export default function ContractStudioPage() { return <StudioPage kind="contract" />; }
