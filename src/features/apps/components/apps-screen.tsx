"use client";

import Image from "next/image";
import { useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { Download, ExternalLink, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/data-display";
import { Alert, EmptyState } from "@/components/ui/feedback";
import { Input, Select } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/navigation";
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
  const raw = useSyncExternalStore(subscribe, readStorage, () => "");
  const file = useMemo(() => {
    try { return parseStorage(raw); }
    catch { return null; }
  }, [raw]);
  const [editing, setEditing] = useState<Subscription | "new" | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const importInput = useRef<HTMLInputElement>(null);
  const today = new Date().toLocaleDateString("en-CA");
  const entries = file?.subscriptions ?? [];
  const visible = entries.filter((entry) => (type === "ALL" || entry.type === type) && entry.name.toLowerCase().includes(search.toLowerCase()));

  function persist(next: Subscription[]) {
    const validated = subscriptionsFileSchema.parse({ version: 1, subscriptions: next });
    localStorage.setItem(storageKey, JSON.stringify(validated));
    window.dispatchEvent(new Event(changedEvent));
    setError("");
  }

  function update(change: (current: Subscription[]) => Subscription[], message: string) {
    try {
      persist(change(parseStorage(readStorage()).subscriptions));
      setNotice(message);
      return true;
    } catch {
      setError("Changes could not be saved. Check browser storage access or import a valid backup.");
      return false;
    }
  }

  function save(entry: Subscription) {
    const saved = update((current) => [...current.filter((item) => item.id !== entry.id), entry], `${entry.name} saved.`);
    if (saved) setEditing(null);
  }

  function exportFile() {
    if (!file) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `trustcode-subscriptions-${today}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importFile(upload: File) {
    try {
      if (upload.size > 2_000_000) throw new Error("File too large");
      const imported = subscriptionsFileSchema.parse(JSON.parse(await upload.text()));
      if (!window.confirm(`Replace this browser's subscriptions with ${imported.subscriptions.length} imported entries?`)) return;
      persist(imported.subscriptions);
      setEditing(null);
      setNotice("Subscriptions imported and saved in this browser.");
    } catch {
      setError("Import failed. Choose a valid TrustCode subscriptions JSON backup under 2 MB.");
    }
  }

  return (
    <>
      <PageHeader title="Apps & subscriptions" description="Track software plans, API spending, payments, and renewal dates." actions={
        <>
          <Button variant="secondary" onClick={exportFile} disabled={!file}><Download aria-hidden className="size-4" />Export</Button>
          <Button variant="secondary" onClick={() => importInput.current?.click()}><Upload aria-hidden className="size-4" />Import</Button>
          <Button onClick={() => { setEditing("new"); setNotice(""); }} disabled={!file}><Plus aria-hidden className="size-4" />Add subscription</Button>
        </>
      } />
      <input ref={importInput} type="file" accept="application/json,.json" aria-label="Import subscriptions backup" className="sr-only" tabIndex={-1} onChange={(event) => {
        const upload = event.target.files?.[0];
        if (upload) void importFile(upload);
        event.target.value = "";
      }} />
      <p className="mb-5 text-sm text-text-secondary">Saved in this browser. Export a backup to move these records to another device.</p>
      {!file ? <Alert variant="danger" title="Saved subscriptions could not be read">Browser storage is unavailable or the saved data is invalid. Import a valid backup to restore your records.</Alert> : null}
      {error ? <div className="mb-4"><Alert variant="danger" title="Subscription could not be saved">{error}</Alert></div> : null}
      <p role="status" className="mb-4 text-sm text-text-secondary">{notice}</p>
      {editing ? <SubscriptionForm key={editing === "new" ? "new" : editing.id} entry={editing === "new" ? undefined : editing} onSave={save} onCancel={() => setEditing(null)} /> : null}
      <div className="surface-panel mb-5 grid gap-3 p-3 sm:grid-cols-2">
        <Input type="search" aria-label="Search subscriptions" placeholder="Search apps and tools" value={search} onChange={(event) => setSearch(event.target.value)} />
        <Select aria-label="Filter subscription type" value={type} onValueChange={setType}><option value="ALL">Apps & APIs</option><option value="APP">App plans</option><option value="API">API access</option></Select>
      </div>
      {visible.length ? <ul className="grid gap-4 xl:grid-cols-2">
        {visible.map((entry) => {
          const provider = providers.find((item) => item.id === entry.provider)!;
          const status = subscriptionStatus(entry, today);
          return <li key={entry.id} className="surface-panel min-w-0 p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl border bg-white text-base font-semibold text-black">
                {provider.icon ? <Image src={`/app-logos/${provider.icon}.svg`} alt="" width={26} height={26} unoptimized /> : entry.name.slice(0, 2).toUpperCase()}
              </span>
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
              <Button size="sm" variant={entry.paid ? "secondary" : "primary"} aria-pressed={entry.paid} aria-label={`${entry.paid ? "Mark unpaid" : "Mark paid"} for ${entry.name}`} onClick={() => update((current) => current.map((item) => item.id === entry.id ? { ...item, paid: !item.paid } : item), `${entry.name} payment updated.`)}>{entry.paid ? "Paid" : "Mark paid"}</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(entry)} aria-label={`Edit ${entry.name}`}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => {
                if (window.confirm(`Remove ${entry.name} from your subscriptions?`)) update((current) => current.filter((item) => item.id !== entry.id), `${entry.name} removed.`);
              }} aria-label={`Remove ${entry.name}`}>Remove</Button>
              {provider.website ? <a href={provider.website} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-brand underline underline-offset-4">Open<span className="sr-only"> {entry.name} (opens in a new tab)</span><ExternalLink aria-hidden className="size-3" /></a> : null}
            </div>
          </li>;
        })}
      </ul> : file ? <EmptyState title={entries.length ? "No matching subscriptions" : "Track your first app or API"} description={entries.length ? "Try another search or type filter." : "Add Codex, Claude, or another tool with its actual price and dates."} /> : null}
      <p className="mt-6 text-xs text-text-secondary">Logos from <a href="https://github.com/simple-icons/simple-icons" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Simple Icons<span className="sr-only"> (opens in a new tab)</span></a> and <a href="https://github.com/lobehub/lobe-icons" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Lobe Icons<span className="sr-only"> (opens in a new tab)</span></a>.</p>
    </>
  );
}

function SubscriptionForm({ entry, onSave, onCancel }: { entry: Subscription | undefined; onSave: (entry: Subscription) => void; onCancel: () => void }) {
  const [provider, setProvider] = useState<Subscription["provider"]>(entry?.provider ?? "codex");
  const [name, setName] = useState(entry?.name ?? "Codex");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = subscriptionSchema.safeParse({
      id: entry?.id ?? crypto.randomUUID(), name, provider,
      type: data.get("type"), amount: Number(data.get("amount")), currency: data.get("currency"),
      billing: data.get("billing"), paid: data.get("paid") === "on",
      startsOn: data.get("startsOn"), expiresOn: data.get("expiresOn"),
    });
    if (!result.success) { setError(result.error.issues[0]?.message ?? "Check your subscription details."); return; }
    setError("");
    onSave(result.data);
  }

  return <form onSubmit={submit} className="surface-panel mb-5 p-5" aria-labelledby="subscription-form-heading">
    <h2 id="subscription-form-heading" className="mb-4 font-semibold">{entry ? "Edit subscription" : "Add subscription"}</h2>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="grid gap-2 text-sm">Tool<Select aria-label="Tool" value={provider} onValueChange={(value) => {
        const next = providers.find((item) => item.id === value)!;
        setProvider(next.id);
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
    <label className="my-5 flex items-center gap-2 text-sm"><input name="paid" type="checkbox" defaultChecked={entry?.paid ?? false} className="size-4 accent-brand" />Paid for the current period</label>
    {error ? <p role="alert" className="mb-4 text-sm text-danger">{error}</p> : null}
    <div className="flex flex-wrap gap-2"><Button type="submit">Save subscription</Button><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button></div>
  </form>;
}
