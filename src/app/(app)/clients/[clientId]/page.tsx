import type { Metadata } from "next";
import { ClientDetail } from "@/features/clients/components/client-detail";

export const metadata: Metadata = { title: "Client details" };
export default async function ClientPage({ params }: { params: Promise<{ clientId: string }> }) { const { clientId } = await params; return <ClientDetail clientId={clientId} />; }
