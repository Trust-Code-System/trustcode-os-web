"use client";

import { format } from "date-fns";
import { ArrowUpRight, Plus, RotateCw, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { Button, IconButton } from "@/components/ui/button";
import { Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/data-display";
import { Alert, EmptyState, Skeleton } from "@/components/ui/feedback";
import { SearchField, Select } from "@/components/ui/form-controls";
import { PageHeader, Pagination } from "@/components/ui/navigation";
import { toAppError } from "@/lib/errors/app-error";
import { useClients } from "../hooks/use-clients";
import { clientStatuses, pipelineStages, type ClientListFilters, type ClientStatus } from "../types/client";

const pageSize = 8;

export function ClientList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const filters: ClientListFilters = {
    q: searchParams.get("q") ?? "",
    status: parseStatus(searchParams.get("status")),
    pipeline: parsePipeline(searchParams.get("pipeline")),
    sort: parseSort(searchParams.get("sort")),
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
  const hasFilters = Boolean(filters.q || filters.status || filters.pipeline);

  return (
    <>
      <PageHeader
        title="Clients"
        description="Search and review client relationships from one operational view."
        actions={<Button onClick={() => router.push("/clients/new")}><Plus aria-hidden className="size-4" />New client</Button>}
      />
      <section aria-label="Client filters" className="mb-4 grid gap-3 rounded-[var(--radius-lg)] border bg-surface p-4 sm:grid-cols-2 xl:grid-cols-[minmax(16rem,1fr)_12rem_12rem_11rem_auto]">
        <DebouncedSearch key={filters.q} initialValue={filters.q} onCommit={(q) => update({ q, page: 1 })} />
        <Select aria-label="Filter by status" value={filters.status} onChange={(event) => update({ status: event.target.value, page: 1 })}>
          <option value="">All statuses</option>
          {clientStatuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}
        </Select>
        <Select aria-label="Filter by pipeline stage" value={filters.pipeline} onChange={(event) => update({ pipeline: event.target.value, page: 1 })}>
          <option value="">All pipeline stages</option>
          {pipelineStages.map((stage) => <option key={stage} value={stage}>{label(stage)}</option>)}
        </Select>
        <Select aria-label="Sort clients" value={filters.sort} onChange={(event) => update({ sort: event.target.value, page: 1 })}>
          <option value="updated-desc">Recently updated</option>
          <option value="created-desc">Recently created</option>
          <option value="name-asc">Name A–Z</option>
        </Select>
        {hasFilters ? <IconButton aria-label="Clear all filters" onClick={() => update({ q: null, status: null, pipeline: null, page: 1 })}><X aria-hidden className="size-4" /></IconButton> : <span />}
      </section>
      <ClientListContent query={query} filters={filters} onPageChange={(page) => update({ page })} />
    </>
  );
}

function ClientListContent({ query, filters, onPageChange }: { query: ReturnType<typeof useClients>; filters: ClientListFilters; onPageChange: (page: number) => void }) {
  if (query.isLoading) return <ListSkeleton />;
  if (query.isError) {
    const error = toAppError(query.error);
    return <Alert variant="danger" title="Clients could not be loaded" action={<Button variant="secondary" size="sm" onClick={() => void query.refetch()}><RotateCw aria-hidden className="size-4" />Retry</Button>}>{error.message}</Alert>;
  }
  if (!query.data?.items.length) {
    const filtered = Boolean(filters.q || filters.status || filters.pipeline);
    return <EmptyState title={filtered ? "No clients match these filters" : "No clients yet"} description={filtered ? "Adjust or clear the current search and filters." : "Client records will appear here once they are available."} />;
  }

  const { items, meta } = query.data;
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border bg-surface">
      <div className="hidden md:block">
        <Table>
          <TableHead><tr><TableHeader>Client</TableHeader><TableHeader>Status</TableHeader><TableHeader>Pipeline</TableHeader><TableHeader>Owner</TableHeader><TableHeader>Updated</TableHeader><TableHeader><span className="sr-only">Open</span></TableHeader></tr></TableHead>
          <TableBody>
            {items.map((client) => (
              <TableRow key={client.id}>
                <TableCell><Link className="font-medium hover:underline" href={`/clients/${client.id}`}>{client.name}</Link><p className="mt-1 text-xs text-text-muted">{client.industry} · {client.primaryEmail}</p></TableCell>
                <TableCell><StatusBadge status={client.status} /></TableCell>
                <TableCell>{label(client.pipelineStage)}</TableCell>
                <TableCell>{client.owner.name}</TableCell>
                <TableCell><time dateTime={client.updatedAt}>{format(new Date(client.updatedAt), "d MMM yyyy")}</time></TableCell>
                <TableCell className="text-right"><Link aria-label={`Open ${client.name}`} className="inline-grid size-10 place-items-center rounded-[var(--radius-md)] hover:bg-surface-hover" href={`/clients/${client.id}`}><ArrowUpRight aria-hidden className="size-4" /></Link></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="divide-y md:hidden">
        {items.map((client) => <Link key={client.id} href={`/clients/${client.id}`} className="block p-4 hover:bg-surface-hover"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{client.name}</p><p className="mt-1 text-xs text-text-muted">{client.industry}</p></div><StatusBadge status={client.status} /></div><dl className="mt-4 grid grid-cols-2 gap-3 text-xs"><div><dt className="text-text-muted">Pipeline</dt><dd className="mt-1 text-text-secondary">{label(client.pipelineStage)}</dd></div><div><dt className="text-text-muted">Owner</dt><dd className="mt-1 text-text-secondary">{client.owner.name}</dd></div></dl></Link>)}
      </div>
      <Pagination page={meta.page} pageSize={meta.pageSize} total={meta.total} onPageChange={onPageChange} />
    </div>
  );
}

function DebouncedSearch({ initialValue, onCommit }: { initialValue: string; onCommit: (value: string) => void }) {
  const [value, setValue] = useState(initialValue);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return <SearchField label="Search clients" placeholder="Search name, email, industry…" value={value} onChange={(event) => { const next = event.target.value; setValue(next); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => onCommit(next.trim()), 350); }} />;
}

function ListSkeleton() { return <div aria-label="Loading clients" role="status" className="overflow-hidden rounded-[var(--radius-lg)] border bg-surface"><span className="sr-only">Loading clients</span>{Array.from({ length: 6 }, (_, index) => <div key={index} className="grid grid-cols-5 gap-6 border-b p-4 last:border-0"><Skeleton className="col-span-2 h-10" /><Skeleton className="h-7" /><Skeleton className="h-7" /><Skeleton className="h-7" /></div>)}</div>; }
function StatusBadge({ status }: { status: ClientStatus }) { const tone = status === "ACTIVE" ? "success" : status === "PROSPECT" ? "info" : status === "PAUSED" ? "warning" : "neutral"; return <Badge tone={tone}>{label(status)}</Badge>; }
function label(value: string) { return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase()); }
function parseStatus(value: string | null): ClientListFilters["status"] { return clientStatuses.some((status) => status === value) ? value as ClientListFilters["status"] : ""; }
function parsePipeline(value: string | null): ClientListFilters["pipeline"] { return value && pipelineStages.some((stage) => stage === value) ? value as ClientListFilters["pipeline"] : ""; }
function parseSort(value: string | null): ClientListFilters["sort"] { return value === "created-desc" || value === "name-asc" ? value : "updated-desc"; }
