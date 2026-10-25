import type { Metadata } from "next";
import { StudioPage } from "@/features/studios/components/studio-page";

export const metadata: Metadata = { title: "Invoice studio", robots: { index: false, follow: false } };
export default function InvoiceStudioPage() { return <StudioPage kind="invoice" />; }
