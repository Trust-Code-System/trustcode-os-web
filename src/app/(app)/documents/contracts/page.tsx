import type { Metadata } from "next";
import { StudioWorkspace } from "@/features/studios/components/studio-workspace";

export const metadata: Metadata = { title: "Contract studio" };
export default function ContractStudioPage() { return <StudioWorkspace kind="contract" />; }
