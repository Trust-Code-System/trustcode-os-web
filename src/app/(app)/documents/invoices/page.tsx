import type { Metadata } from "next";
import { StudioWorkspace } from "@/features/studios/components/studio-workspace";

export const metadata: Metadata = { title: "Invoice studio" };
export default function InvoiceStudioPage() { return <StudioWorkspace kind="invoice" />; }
