import { AlertCircle, Inbox } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import { Button } from "./button";

export function Alert({ title, children, variant = "info", action }: { title: string; children?: ReactNode; variant?: "info" | "danger" | "success" | "warning"; action?: ReactNode }) {
  const styles = { info: "border-information/30 bg-information/5", danger: "border-danger/30 bg-danger/5", success: "border-success/30 bg-success/5", warning: "border-warning/30 bg-warning/5" };
  return <div role={variant === "danger" ? "alert" : "status"} className={cn("flex gap-3 rounded-[var(--radius-lg)] border p-4", styles[variant])}><AlertCircle aria-hidden className="mt-0.5 size-5 shrink-0" /><div className="min-w-0 flex-1"><p className="font-medium">{title}</p>{children ? <div className="mt-1 text-sm text-text-secondary">{children}</div> : null}</div>{action}</div>;
}

export function EmptyState({ title, description, action, icon }: { title: string; description: string; action?: ReactNode; icon?: ReactNode }) {
  return <div className="grid min-h-64 place-items-center rounded-[var(--radius-lg)] border border-dashed border-border-strong bg-surface p-8 text-center"><div>{icon ?? <Inbox aria-hidden className="mx-auto mb-4 size-8 text-text-muted" />}<h2 className="font-semibold">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">{description}</p>{action ? <div className="mt-5">{action}</div> : null}</div></div>;
}

export function Skeleton({ className }: { className?: string }) { return <div aria-hidden className={cn("animate-pulse rounded-[var(--radius-sm)] bg-surface-active", className)} />; }

export function ToastRegion({ messages, onDismiss }: { messages: { id: string; title: string; description?: string }[]; onDismiss: (id: string) => void }) {
  return <div aria-live="polite" aria-relevant="additions" className="fixed bottom-4 right-4 z-50 grid w-[min(24rem,calc(100vw-2rem))] gap-2">{messages.map((message) => <div key={message.id} className="rounded-[var(--radius-lg)] border bg-surface-elevated p-4 shadow-[var(--shadow-2)]"><div className="flex gap-3"><div className="flex-1"><p className="text-sm font-medium">{message.title}</p>{message.description ? <p className="mt-1 text-xs text-text-secondary">{message.description}</p> : null}</div><Button variant="ghost" size="sm" onClick={() => onDismiss(message.id)}>Dismiss</Button></div></div>)}</div>;
}
