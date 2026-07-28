"use client";

import { format } from "date-fns";
import { ArrowUpRight, Plus, RotateCw, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { Button, IconButton } from "@/components/ui/button";
import { Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/data-display";
import { Alert, EmptyState, Skeleton } from "@/components/ui/feedback";
import { Select } from "@/components/ui/form-controls";
import { PageHeader, Pagination } from "@/components/ui/navigation";
import { toAppError } from "@/lib/errors/app-error";
import { useClients } from "../hooks/use-clients";
import { clientStages, clientStatuses, type ClientListFilters, type ClientStatus } from "../types/client";

const pageSize = 20;

export function ClientList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const filters: ClientListFilters = {
    status: parseStatus(searchParams.get("status")),
    stage: parseStage(searchParams.get("stage")),
    page: Math.max(1, Number(searchParams.get("page") ?? 1) || 1),
    pageSize,
  };
  const query = useClients(filters);
  const update = (changes: Record<string, string | number | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "" || value === 1) next.delete(key);
      else next.set(key, String(value));
    }
    startTransition(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  };
  const hasFilters = Boolean(filters.status || filters.stage);

  return (
    <>
      <PageHeader title="Clients" description="Live client records from the TrustCode API." actions={<Button onClick={() => router.push("/clients/new")}><Plus aria-hidden className="size-4" />New client</Button>} />
      <section aria-label="Client filters" className="surface-panel mb-3 grid gap-2.5 p-2.5 sm:grid-cols-[12rem_12rem_auto]">
        <Select aria-label="Filter by status" value={filters.status} onValueChange={(status) => update({ status, page: 1 })}>
          <option value="">All statuses</option>
          {clientStatuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}
        </Select>
        <Select aria-label="Filter by pipeline stage" value={filters.stage} onValueChange={(stage) => update({ stage, page: 1 })}>
          <option value="">All pipeline stages</option>
          {clientStages.map((stage) => <option key={stage} value={stage}>{label(stage)}</option>)}
        </Select>
        {hasFilters ? <IconButton aria-label="Clear all filters" onClick={() => update({ status: null, stage: null, page: 1 })}><X aria-hidden className="size-4" /></IconButton> : <span />}
      </section>
      <ClientListContent query={query} filters={filters} onPageChange={(page) => update({ page })} />
    </>
  );
}

function ClientListContent({ query, filters, onPageChange }: { query: ReturnType<typeof useClients>; filters: ClientListFilters; onPageChange: (page: number) => void }) {
  if (query.isLoading) return <ListSkeleton />;
  if (query.isError) { const error = toAppError(query.error); return <Alert variant="danger" title="Clients could not be loaded" action={<Button variant="secondary" size="sm" onClick={() => void query.refetch()}><RotateCw aria-hidden className="size-4" />Retry</Button>}>{error.message}</Alert>; }
  if (!query.data?.items.length) { const filtered = Boolean(filters.status || filters.stage); return <EmptyState title={filtered ? "No clients match these filters" : "No clients yet"} description={filtered ? "Adjust or clear the current filters." : "Create the first client to begin using the CRM."} />; }

  const { items, meta } = query.data;
  return <div className="surface-panel overflow-hidden"><Table><TableHead><tr><TableHeader>Client</TableHeader><TableHeader>Status</TableHeader><TableHeader>Pipeline</TableHeader><TableHeader>Updated</TableHeader><TableHeader><span className="sr-only">Open</span></TableHeader></tr></TableHead><TableBody>{items.map((client) => <TableRow key={client.id}><TableCell><Link className="font-medium hover:underline" href={`/clients/${client.id}`}>{client.name}</Link><p className="mt-1 text-xs text-text-muted">{client.email ?? client.phone ?? "No contact details"}</p></TableCell><TableCell><StatusBadge status={client.status} /></TableCell><TableCell>{label(client.stage)}</TableCell><TableCell><time dateTime={client.updatedAt}>{format(new Date(client.updatedAt), "d MMM yyyy")}</time></TableCell><TableCell className="text-right"><Link aria-label={`Open ${client.name}`} className="inline-grid size-10 place-items-center rounded-[var(--radius-md)] hover:bg-surface-hover" href={`/clients/${client.id}`}><ArrowUpRight aria-hidden className="size-4" /></Link></TableCell></TableRow>)}</TableBody></Table><Pagination page={meta.page} pageSize={meta.pageSize} total={meta.total} onPageChange={onPageChange} /></div>;
}

function ListSkeleton() { return <div aria-label="Loading clients" role="status" className="surface-panel overflow-hidden"><span className="sr-only">Loading clients</span>{Array.from({ length: 6 }, (_, index) => <div key={index} className="grid grid-cols-4 gap-4 border-b p-3 last:border-0"><Skeleton className="h-9" /><Skeleton className="h-7" /><Skeleton className="h-7" /><Skeleton className="h-7" /></div>)}</div>; }
function StatusBadge({ status }: { status: ClientStatus }) { return <Badge tone={status === "ACTIVE" ? "success" : "neutral"}>{label(status)}</Badge>; }
function label(value: string) { return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase()); }
function parseStatus(value: string | null): ClientListFilters["status"] { return clientStatuses.some((status) => status === value) ? value as ClientListFilters["status"] : ""; }
function parseStage(value: string | null): ClientListFilters["stage"] { return value && clientStages.some((stage) => stage === value) ? value as ClientListFilters["stage"] : ""; }
