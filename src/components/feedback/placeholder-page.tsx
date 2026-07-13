import { Construction } from "lucide-react";
import { PageHeader } from "@/components/ui/navigation";
import { EmptyState } from "@/components/ui/feedback";

export function PlaceholderPage({ title, description }: { title: string; description: string }) { return <><PageHeader title={title} description={description} /><EmptyState icon={<Construction aria-hidden className="mx-auto mb-4 size-8 text-text-muted" />} title="Typed route placeholder" description="This module is intentionally deferred in the first implementation session. Its route and navigation contract are reserved without speculative business logic." /></>; }
