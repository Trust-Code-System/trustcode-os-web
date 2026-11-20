"use client";

import Image from "next/image";
import { useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toAppError } from "@/lib/errors/app-error";
import { readSharedSubscriptions, saveSharedSubscriptions, subscriptionsQueryKey } from "../shared-subscriptions";
import { Check, Download, ExternalLink, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/data-display";
import { Alert, EmptyState } from "@/components/ui/feedback";
import { Input, Select } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/navigation";
import { Dialog } from "@/components/ui/overlays";
import { appCatalog } from "../catalog";
import { providers, subscriptionSchema, subscriptionsFileSchema, subscriptionStatus, type Subscription } from "../subscriptions";

const storageKey = "trustcode-app-subscriptions-v1";
const changedEvent = "trustcode-subscriptions-changed";
const emptyFile = { version: 1 as const, subscriptions: [] as Subscription[] };
const billingLabels = { MONTHLY: "Monthly", YEARLY: "Yearly", ONE_TIME: "One-time", USAGE: "Usage-based" };

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(changedEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(changedEvent, callback);
  };
}

function readStorage() {
  try { return localStorage.getItem(storageKey) ?? ""; }
  catch { return "unavailable"; }
}

function parseStorage(raw: string) {
  return subscriptionsFileSchema.parse(raw ? JSON.parse(raw) : emptyFile);
}

function displayDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(`${date}T12:00:00`));
}

export function AppsScreen() {
  const legacyRaw = useSyncExternalStore(subscribe, readStorage, () => "");
  const legacy = useMemo(() => {
    try { return parseStorage(legacyRaw); } catch { return null; }
  }, [legacyRaw]);
  const queryClient = useQueryClient();
  const shared = useQuery({
    queryKey: subscriptionsQueryKey,
    queryFn: ({ signal }) => readSharedSubscriptions(signal),
    refetchInterval: 15_000,
    refetchOnWindowFocus: "always",
    retry: 1,
  });
  const mutation = useMutation({
    mutationFn: ({ revision, subscriptions }: { revision: number; subscriptions: Subscription[] }) => saveSharedSubscriptions(revision, subscriptions),
    onSuccess: (saved) => queryClient.setQueryData(subscriptionsQueryKey, saved),
    onError: () => { void shared.refetch(); },
  });
  const file = shared.data ?? null;
  const busy = mutation.isPending;
  const [editing, setEditing] = useState<{ entry: Subscription | undefined; provider: Subscription["provider"]; revision: number } | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [view, setView] = useState("catalog");
  const [category, setCategory] = useState("All categories");
  const importInput = useRef<HTMLInputElement>(null);
  const today = new Date().toLocaleDateString("en-CA");
  const entries = file?.subscriptions ?? [];
  const visible = entries.filter((entry) => (type === "ALL" || entry.type === type) && entry.name.toLowerCase().includes(search.toLowerCase()));

  async function update(change: (current: Subscription[]) => Subscription[], message: string, revision = file?.revision) {
    if (!file || busy) return false;
    if (revision !== file.revision) {
      setError("A teammate updated subscriptions while this form was open. Reopen it to use the latest details.");
      return false;
    }
    try {
      await queryClient.cancelQueries({ queryKey: subscriptionsQueryKey });
      await mutation.mutateAsync({ revision: file.revision, subscriptions: change(file.subscriptions) });
      setError("");
      setNotice(message);
      return true;
    } catch (cause) {
      setError(toAppError(cause).message);
      return false;
    }
  }

  async function save(entry: Subscription) {
    const saved = await update((current) => [...current.filter((item) => item.id !== entry.id), entry], `${entry.name} saved for the workspace.`, editing?.revision);
    if (saved) { setEditing(null); setView("subscriptions"); setSearch(""); setType("ALL"); }
    return saved;
  }

  async function publishLegacy() {
    if (!legacy || !window.confirm("Share these browser records with everyone in this workspace? Existing workspace records with the same ID will be kept.")) return;
    const saved = await update((current) => [...current, ...legacy.subscriptions.filter((entry) => !current.some((item) => item.id === entry.id))], "Browser records shared with your workspace.");
    if (saved) {
      try { localStorage.removeItem(storageKey); window.dispatchEvent(new Event(changedEvent)); } catch { /* Shared save succeeded; retain local backup if storage is restricted. */ }
    }
  }

  function exportFile() {
    if (!file) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, subscriptions: file.subscriptions }, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `trustcode-subscriptions-${today}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importFile(upload: File) {
    try {
      if (upload.size > 10_000_000) throw new Error("File too large");
      const imported = subscriptionsFileSchema.parse(JSON.parse(await upload.text()));
      if (!window.confirm(`Share ${imported.subscriptions.length} imported entries with this workspace? Existing workspace records with the same ID will be kept.`)) return;
      const saved = await update((current) => [...current, ...imported.subscriptions.filter((entry) => !current.some((item) => item.id === entry.id))], "Subscriptions imported and shared with your workspace.");
      if (saved) setEditing(null);
    } catch {
      setError("Import failed. Choose a valid TrustCode subscriptions JSON backup under 10 MB.");
    }
  }

  return (
    <>
      <PageHeader title="Apps & subscriptions" description="Browse your tools, then track app plans, API costs, and renewal dates." actions={
        <>
          <Button variant="secondary" onClick={exportFile} disabled={!file || busy}><Download aria-hidden className="size-4" />Export</Button>
          <Button variant="secondary" disabled={!file || busy} onClick={() => importInput.current?.click()}><Upload aria-hidden className="size-4" />Import</Button>
          <Button onClick={() => { setEditing({ entry: undefined, provider: "custom", revision: file!.revision }); setNotice(""); }} disabled={!file || busy}><Plus aria-hidden className="size-4" />Add another app</Button>
        </>
      } />
      <input ref={importInput} type="file" accept="application/json,.json" aria-label="Import subscriptions backup" className="sr-only" tabIndex={-1} onChange={(event) => {
        const upload = event.target.files?.[0];
        if (upload) void importFile(upload);
        event.target.value = "";
      }} />
      <p className="mb-5 text-sm text-text-secondary">Shared with everyone in your company workspace. Updates refresh every 15 seconds and when you return to this window.</p>
      {shared.isPending ? <p role="status">Loading workspace subscriptions…</p> : null}
      {shared.isError ? <Alert variant="danger" title="Workspace subscriptions could not be loaded" action={<Button variant="secondary" onClick={() => { void shared.refetch(); }}>Retry</Button>}>{toAppError(shared.error).message}</Alert> : null}
      {legacy?.subscriptions.length ? <div className="mb-4"><Alert title="Records saved in this browser" action={<Button disabled={!file || busy} onClick={() => { void publishLegacy(); }}>Share browser records</Button>}>Share your existing plans and paid statuses with your company workspace. Existing shared records will be kept.</Alert></div> : null}
      {error ? <div className="mb-4"><Alert variant="danger" title="Subscription could not be saved">{error}</Alert></div> : null}
      <p role="status" className="mb-4 text-sm text-text-secondary">{notice}</p>
      {editing ? <Dialog open onOpenChange={(open) => { if (!open) setEditing(null); }} title={editing.entry ? "Edit subscription" : "Track an app or API"} description="Record your plan, cost, payment status, and dates.">
        <SubscriptionForm key={editing.entry?.id ?? editing.provider} entry={editing.entry} initialProvider={editing.provider} onSave={save} saving={busy} onCancel={() => setEditing(null)} />
      </Dialog> : null}
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="App views">
        <Button variant={view === "catalog" ? "primary" : "secondary"} aria-pressed={view === "catalog"} onClick={() => { setView("catalog"); setSearch(""); }}>App catalog ({appCatalog.length})</Button>
        <Button variant={view === "subscriptions" ? "primary" : "secondary"} aria-pressed={view === "subscriptions"} onClick={() => { setView("subscriptions"); setSearch(""); }}>Workspace subscriptions ({entries.length})</Button>
      </div>
      <div className="surface-panel mb-5 grid gap-3 p-3 sm:grid-cols-2">
        <Input type="search" aria-label="Search subscriptions" placeholder="Search apps and tools" value={search} onChange={(event) => setSearch(event.target.value)} />
        {view === "catalog" ? <Select aria-label="Filter app category" value={category} onValueChange={setCategory}>{["All categories", ...new Set(appCatalog.map((app) => app.category))].map((value) => <option key={value} value={value}>{value}</option>)}</Select> : <Select aria-label="Filter subscription type" value={type} onValueChange={setType}><option value="ALL">Apps & APIs</option><option value="APP">App plans</option><option value="API">API access</option></Select>}
      </div>
      {view === "catalog" ? <AppCatalog search={search} category={category} entries={entries} disabled={!file || busy} onAdd={(provider) => setEditing({ entry: undefined, provider, revision: file!.revision })} onEdit={(entry) => setEditing({ entry, provider: entry.provider, revision: file!.revision })} /> : visible.length ? <ul className="grid gap-4 xl:grid-cols-2">
        {visible.map((entry) => {
          const provider = providers.find((item) => item.id === entry.provider)!;
          const status = subscriptionStatus(entry, today);
          return <li key={entry.id} className="surface-panel min-w-0 p-5">
            <div className="flex items-start gap-3">
              <AppLogo name={entry.name} icon={provider.icon} logo={entry.logo} />
              <div className="min-w-0 flex-1">
                <h2 className="break-words font-semibold">{entry.name}</h2>
                <div className="mt-2 flex flex-wrap gap-2"><Badge>{entry.type === "API" ? "API access" : "App plan"}</Badge><Badge tone={status === "Expired" ? "danger" : status === "Expiring soon" ? "warning" : "neutral"}>{status}</Badge></div>
              </div>
            </div>
            <dl className="my-5 grid grid-cols-2 gap-4 text-sm">
              <div className="col-span-2"><dt className="text-text-secondary">Cost · {billingLabels[entry.billing]}</dt><dd className="mt-1 text-xl font-semibold">{new Intl.NumberFormat("en-GB", { style: "currency", currency: entry.currency }).format(entry.amount)} <span className="text-xs font-normal text-text-secondary">{entry.currency}</span></dd></div>
              <div><dt className="text-text-secondary">Started</dt><dd className="mt-1">{displayDate(entry.startsOn)}</dd></div>
              <div><dt className="text-text-secondary">Expires / renews</dt><dd className="mt-1">{entry.expiresOn ? displayDate(entry.expiresOn) : "No expiry set"}</dd></div>
            </dl>
            <div className="flex flex-wrap items-center gap-2 border-t pt-4">
              <Button size="sm" variant={entry.paid ? "secondary" : "primary"} aria-pressed={entry.paid} aria-label={`${entry.paid ? "Mark unpaid" : "Mark paid"} for ${entry.name}`} disabled={busy} onClick={() => void update((current) => current.map((item) => item.id === entry.id ? { ...item, paid: !item.paid } : item), `${entry.name} payment updated.`)}>{entry.paid ? "Paid" : "Mark paid"}</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing({ entry, provider: entry.provider, revision: file!.revision })} disabled={busy} aria-label={`Edit ${entry.name}`}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => {
                if (window.confirm(`Remove ${entry.name} from your subscriptions?`)) update((current) => current.filter((item) => item.id !== entry.id), `${entry.name} removed.`);
              }} disabled={busy} aria-label={`Remove ${entry.name}`}>Remove</Button>
              {provider.website ? <a href={provider.website} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-brand underline underline-offset-4">Open<span className="sr-only"> {entry.name} (opens in a new tab)</span><ExternalLink aria-hidden className="size-3" /></a> : null}
            </div>
          </li>;
        })}
      </ul> : file ? <EmptyState title={entries.length ? "No matching subscriptions" : "Track your first app or API"} description={entries.length ? "Try another search or type filter." : "Choose an app from the catalog to record its price and dates."} action={<Button onClick={() => { setView("catalog"); setSearch(""); }}>Browse app catalog</Button>} /> : null}
      <p className="mt-6 text-xs text-text-secondary">Logos from <a href="https://github.com/simple-icons/simple-icons" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Simple Icons<span className="sr-only"> (opens in a new tab)</span></a> and <a href="https://github.com/lobehub/lobe-icons" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Lobe Icons<span className="sr-only"> (opens in a new tab)</span></a>.</p>
    </>
  );
}

function AppLogo({ name, icon, logo }: { name: string; icon: string; logo?: string | undefined }) {
  const source = logo || (icon ? `/app-logos/${icon}.svg` : "");
  const [failedSource, setFailedSource] = useState("");
  return <span className="grid size-12 shrink-0 place-items-center rounded-xl border bg-white text-base font-semibold text-black">
    {source && source !== failedSource ? <Image src={source} alt="" width={28} height={28} unoptimized className="max-h-8 object-contain" onError={() => setFailedSource(source)} /> : name.slice(0, 2).toUpperCase()}
  </span>;
}

function AppCatalog({ search, category, entries, disabled, onAdd, onEdit }: {
  search: string;
  category: string;
  entries: Subscription[];
  disabled: boolean;
  onAdd: (provider: Subscription["provider"]) => void;
  onEdit: (entry: Subscription) => void;
}) {
  const query = search.trim().toLowerCase();
  const apps = appCatalog.filter((app) => (category === "All categories" || app.category === category) && app.name.toLowerCase().includes(query));
  const custom = entries.filter((entry) => entry.provider === "custom" && entry.name.toLowerCase().includes(query) && category === "All categories");
  if (!apps.length && !custom.length) return <EmptyState title="No matching apps" description="Try another name or category, or add your own app." />;
  return <div className="grid gap-7">
    {[...new Set(apps.map((app) => app.category))].map((group) => <section key={group} aria-label={`${group} apps`}>
      <h2 className="mb-3 text-sm font-semibold">{group}</h2>
      <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {apps.filter((app) => app.category === group).map((app) => {
          const plans = entries.filter((entry) => entry.provider === app.id);
          const count = plans.length;
          const paid = plans.filter((entry) => entry.paid).length;
          return <li key={app.id} className="min-w-0">
            <button type="button" disabled={disabled} onClick={() => plans[0] ? onEdit(plans[0]) : onAdd(app.id)} aria-label={`${count ? "View" : "Track"} ${app.name}`} className="flex h-full w-full items-center gap-3 rounded-xl border bg-surface p-3 text-left transition-colors hover:border-brand hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-50">
              <AppLogo name={app.name} icon={app.icon} />
              <span className="min-w-0 flex-1"><span className="block break-words text-sm font-semibold">{app.name}</span><span className="mt-1 block text-xs text-text-secondary">{count ? `${count} ${count === 1 ? "plan" : "plans"} · ${paid} paid` : "Add a plan or API"}</span></span>
              {count ? <Check aria-hidden className="size-4 shrink-0 text-brand" /> : <Plus aria-hidden className="size-4 shrink-0 text-text-secondary" />}
            </button>
          </li>;
        })}
      </ul>
    </section>)}
    {custom.length ? <section aria-label="Added apps"><h2 className="mb-3 text-sm font-semibold">Added apps</h2><ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">{custom.map((entry) => <li key={entry.id}><button type="button" disabled={disabled} onClick={() => onEdit(entry)} className="flex w-full items-center gap-3 rounded-xl border bg-surface p-3 text-left hover:bg-surface-hover"><AppLogo name={entry.name} icon="" logo={entry.logo} /><span className="min-w-0 break-words text-sm font-semibold">{entry.name}</span></button></li>)}</ul></section> : null}
  </div>;
}

function SubscriptionForm({ entry, initialProvider, onSave, saving, onCancel }: { entry: Subscription | undefined; initialProvider: Subscription["provider"]; onSave: (entry: Subscription) => Promise<boolean>; saving: boolean; onCancel: () => void }) {
  const [provider, setProvider] = useState<Subscription["provider"]>(entry?.provider ?? initialProvider);
  const [name, setName] = useState(entry?.name ?? (initialProvider === "custom" ? "" : providers.find((item) => item.id === initialProvider)!.name));
  const [error, setError] = useState("");
  const [logo, setLogo] = useState(entry?.logo ?? "");
  const [readingLogo, setReadingLogo] = useState(false);
  const logoRequest = useRef(0);
  const selected = providers.find((item) => item.id === provider)!;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = subscriptionSchema.safeParse({
      id: entry?.id ?? crypto.randomUUID(), name, provider, ...(logo ? { logo } : {}),
      type: data.get("type"), amount: Number(data.get("amount")), currency: data.get("currency"),
      billing: data.get("billing"), paid: data.get("paid") === "on",
      startsOn: data.get("startsOn"), expiresOn: data.get("expiresOn"),
    });
    if (!result.success) { setError(result.error.issues[0]?.message ?? "Check your subscription details."); return; }
    setError("");
    if (!await onSave(result.data)) setError("This subscription could not be saved. Check the message above. If a teammate changed it, cancel and reopen this form.");
  }

  return <form onSubmit={(event) => { void submit(event); }}>
    <div className="mb-5 flex items-center gap-3"><AppLogo name={name || "App"} icon={selected.icon} logo={logo} /><p className="font-semibold">{name || "Your app"}</p></div>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="grid gap-2 text-sm">Tool<Select aria-label="Tool" value={provider} onValueChange={(value) => {
        const next = providers.find((item) => item.id === value)!;
        setProvider(next.id);
        logoRequest.current += 1;
        setReadingLogo(false);
        setLogo("");
        setName(next.id === "custom" ? "" : next.name);
      }}>{providers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></label>
      <label className="grid gap-2 text-sm">App / plan name<Input required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Claude Pro" /></label>
      <label className="grid gap-2 text-sm">Access type<Select aria-label="Access type" name="type" defaultValue={entry?.type ?? "APP"}><option value="APP">App plan</option><option value="API">API access</option></Select></label>
      <label className="grid gap-2 text-sm">Billing<Select aria-label="Billing" name="billing" defaultValue={entry?.billing ?? "MONTHLY"}>{Object.entries(billingLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></label>
      <label className="grid gap-2 text-sm">Cost<Input name="amount" type="number" min="0" max="1000000000" step="0.01" required defaultValue={entry?.amount ?? ""} placeholder="0.00" /></label>
      <label className="grid gap-2 text-sm">Currency<Select aria-label="Currency" name="currency" defaultValue={entry?.currency ?? "USD"}>{["USD", "NGN", "GBP", "EUR"].map((currency) => <option key={currency} value={currency}>{currency}</option>)}</Select></label>
      <label className="grid gap-2 text-sm">Start date<Input name="startsOn" type="date" required defaultValue={entry?.startsOn ?? new Date().toLocaleDateString("en-CA")} /></label>
      <label className="grid gap-2 text-sm">Expiry / renewal date (optional)<Input name="expiresOn" type="date" defaultValue={entry?.expiresOn ?? ""} /></label>
    </div>
    {provider === "custom" ? <div className="mt-4">
      <label className="grid gap-2 text-sm">App logo<Input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const request = ++logoRequest.current;
        setReadingLogo(false);
        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 256_000) { setError("Choose a PNG, JPEG, or WebP logo under 256 KB."); return; }
        setReadingLogo(true);
        const reader = new FileReader();
        reader.onload = async () => {
          const image = new window.Image();
          image.src = String(reader.result);
          try {
            await image.decode();
            if (request === logoRequest.current) { setLogo(image.src); setError(""); }
          } catch {
            if (request === logoRequest.current) setError("The logo could not be read. Try another image.");
          } finally {
            if (request === logoRequest.current) setReadingLogo(false);
          }
        };
        reader.onerror = () => { if (request === logoRequest.current) { setReadingLogo(false); setError("The logo could not be read. Try another image."); } };
        reader.readAsDataURL(file);
      }} /></label>
      <p className="mt-2 text-xs text-text-secondary">PNG, JPEG, or WebP, up to 256 KB.</p>
      {logo ? <Button type="button" variant="ghost" size="sm" onClick={() => { logoRequest.current += 1; setReadingLogo(false); setLogo(""); }}>Remove logo</Button> : null}
    </div> : null}
    <label className="my-5 flex items-center gap-2 text-sm"><input name="paid" type="checkbox" defaultChecked={entry?.paid ?? false} className="size-4 accent-brand" />Paid for the current period</label>
    {error ? <p role="alert" className="mb-4 text-sm text-danger">{error}</p> : null}
    <div className="flex flex-wrap gap-2"><Button type="submit" disabled={readingLogo || saving}>{saving ? "Saving…" : readingLogo ? "Reading logo…" : "Save subscription"}</Button><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button></div>
  </form>;
}
