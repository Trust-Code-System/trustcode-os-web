import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { Alert } from "@/components/ui/feedback";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/navigation";
import { studioCatalog, type StudioKind } from "@/features/studios/catalog";
import { studioPageAccess } from "@/features/studios/server/access";

export async function StudioPage({ kind }: { kind: StudioKind }) {
  const studio = studioCatalog[kind];
  const access = await studioPageAccess(studio.href);
  if (!access.ok) return <><PageHeader title={studio.title} /><Alert variant="danger" title="Studio unavailable">Your session could not be verified. Try again shortly or sign in again.</Alert></>;

  return <div className="flex h-full min-h-[32rem] flex-col">
    <PageHeader title={studio.title} description="Prepare and download documents. Save your JSON file before closing the studio." actions={<>
      <Link href="/documents" className={buttonVariants({ variant: "secondary", size: "sm" })}><ArrowLeft aria-hidden className="size-3.5" /> Documents</Link>
      <a href={`/api/studios/${kind}/index.html`} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "secondary", size: "sm" })}>Open full screen <ExternalLink aria-hidden className="size-3.5" /></a>
    </>} />
    <iframe title={studio.title} src={`/api/studios/${kind}/index.html`} referrerPolicy="no-referrer" className="min-h-0 w-full flex-1 rounded-[var(--radius-lg)] border border-border bg-surface" />
  </div>;
}
