import type { Metadata } from "next";
import { Suspense } from "react";
import { ClientList } from "@/features/clients/components/client-list";
import { Skeleton } from "@/components/ui/feedback";

export const metadata: Metadata = { title: "Clients" };
export default function ClientsPage() { return <Suspense fallback={<Skeleton className="h-[32rem]" />}><ClientList /></Suspense>; }
