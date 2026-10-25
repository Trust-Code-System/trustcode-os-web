import type { Metadata } from "next";
import { ArrowUpRight, FileSignature, ReceiptText } from "lucide-react";

import { Alert } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/navigation";
import { buttonVariants } from "@/components/ui/button";
import { studioCatalog } from "@/features/studios/catalog";
import { studioPageAccess } from "@/features/studios/server/access";

export const metadata: Metadata = { title: "Documents", robots: { index: false, follow: false } };

export default async function DocumentsPage() {
  const access = await studioPageAccess("/documents");
  if (!access.ok) return <><PageHeader title="Documents" /><Alert variant="danger" title="Document tools unavailable">Your session could not be verified. Try again shortly or sign in again.</Alert></>;
  return <>
    <PageHeader eyebrow="Client documents" title="Prepare your next engagement" description="Create branded invoices and agreements inside your TrustCode workspace." />
    <div className="grid gap-4 lg:grid-cols-2">
      {Object.entries(studioCatalog).map(([kind, studio]) => {
        const Icon = kind === "invoice" ? ReceiptText : FileSignature;
        return <section key={kind} className="surface-panel flex flex-col gap-5 p-5 md:p-7">
          <div className="flex items-start justify-between"><div className="grid size-11 place-items-center rounded-xl bg-brand/10 text-brand"><Icon className="size-5" aria-hidden /></div><span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-medium text-text-muted">Team workspace</span></div>
          <div><h2 className="text-xl font-semibold tracking-tight">{studio.title}</h2><p className="mt-2 max-w-lg text-sm leading-6 text-text-secondary">{studio.description}</p></div>
          <p className="text-xs text-text-muted">{kind === "invoice" ? "PDF, Word and Excel templates · Flexible payment terms" : "PDF and editable Word · Service agreements and NDAs"}</p>
          <a href={studio.href} className={buttonVariants({ className: "mt-auto w-fit min-h-11" })}>Open {studio.title.toLowerCase()} <ArrowUpRight className="size-4" aria-hidden /></a>
        </section>;
      })}
    </div>
    <section className="surface-panel mt-4 p-5"><h2 className="text-sm font-semibold">Your documents, your workflow</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">Entries stay in the studio tab until you download them. Save a JSON file to continue editing later, or export a finished document to share with your customer. These tools do not send documents, collect signatures or store client records on the server.</p></section>
  </>;
}
