"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Alert, Skeleton } from "@/components/ui/feedback";
import { FormField, Input, Textarea } from "@/components/ui/form-controls";
import { Breadcrumb, PageHeader } from "@/components/ui/navigation";
import { toAppError } from "@/lib/errors/app-error";
import { refreshAppData } from "@/lib/query/cache";
import { createClient, updateClient } from "../api/clients";
import { useClient } from "../hooks/use-clients";
import type { Client, ClientInput } from "../types/client";

export function ClientForm({ clientId }: { clientId?: string }) {
  const existing = useClient(clientId ?? "");
  if (clientId && existing.isLoading) return <Skeleton className="h-96" />;
  if (clientId && existing.isError) return <Alert variant="danger" title="Client could not be loaded">{toAppError(existing.error).message}</Alert>;
  return <ClientFormFields {...(clientId ? { clientId } : {})} {...(existing.data ? { existing: existing.data } : {})} />;
}

function ClientFormFields({ clientId, existing }: { clientId?: string; existing?: Client }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const save = useMutation({ mutationFn: (input: ClientInput) => clientId ? updateClient(clientId, input) : createClient(input), onSuccess: async (client) => { await refreshAppData(queryClient); router.push(`/clients/${client.id}`); } });
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); save.mutate({ name: String(data.get("name") ?? "").trim(), ...optionalField("description", data), ...optionalField("email", data), ...optionalField("phone", data), ...optionalField("website", data) }); };
  return <><PageHeader title={clientId ? "Edit client" : "New client"} description="Fields and validation match the current backend client DTO." breadcrumb={<Breadcrumb items={[{ label: "Clients", href: "/clients" }, { label: clientId ? "Edit" : "New" }]} />} /><form onSubmit={submit} className="surface-panel grid max-w-3xl gap-4 p-5 sm:grid-cols-2"><div className="sm:col-span-2"><FormField label="Client name" required><Input name="name" defaultValue={existing?.name} required minLength={2} /></FormField></div><div className="sm:col-span-2"><FormField label="Description"><Textarea name="description" defaultValue={existing?.description ?? ""} /></FormField></div><FormField label="Email"><Input name="email" type="email" defaultValue={existing?.email ?? ""} /></FormField><FormField label="Phone"><Input name="phone" defaultValue={existing?.phone ?? ""} /></FormField><div className="sm:col-span-2"><FormField label="Website"><Input name="website" type="url" placeholder="https://example.com" defaultValue={existing?.website ?? ""} /></FormField></div>{save.error ? <div className="sm:col-span-2"><Alert variant="danger" title="Client could not be saved">{toAppError(save.error).message}</Alert></div> : null}<div className="flex gap-2 sm:col-span-2"><Button type="submit" loading={save.isPending}>{clientId ? "Save changes" : "Create client"}</Button><Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button></div></form></>;
}

function optionalField<Key extends string>(key: Key, data: FormData): Partial<Record<Key, string>> { const clean = String(data.get(key) ?? "").trim(); return clean ? { [key]: clean } as Partial<Record<Key, string>> : {}; }
