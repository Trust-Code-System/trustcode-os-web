"use client";

import { CircleCheck, CircleX, X } from "lucide-react";
import { useEffect, useState } from "react";

import { IconButton } from "@/components/ui/button";
import { subscribeToToasts, type ToastEvent } from "@/lib/feedback/toasts";

const visibleForMs = 5_000;

export function ToastViewport() {
  const [toasts, setToasts] = useState<ToastEvent[]>([]);

  useEffect(() => subscribeToToasts((toast) => {
    setToasts((current) => [...current, toast].slice(-4));
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== toast.id)), visibleForMs);
  }), []);

  const dismiss = (id: number) => setToasts((current) => current.filter((toast) => toast.id !== id));

  return <section aria-label="Notifications" aria-live="polite" className="pointer-events-none fixed inset-x-3 bottom-3 z-[100] grid justify-items-end gap-2 sm:left-auto sm:w-[24rem]">{toasts.map((toast) => <article key={toast.id} role={toast.tone === "error" ? "alert" : "status"} className="pointer-events-auto grid w-full grid-cols-[auto_1fr_auto] items-start gap-3 rounded-[var(--radius-lg)] border bg-surface-elevated p-3 shadow-[var(--shadow-2)]"><span className={toast.tone === "success" ? "text-success" : "text-danger"}>{toast.tone === "success" ? <CircleCheck aria-hidden className="size-5" /> : <CircleX aria-hidden className="size-5" />}</span><div className="min-w-0"><p className="text-sm font-semibold">{toast.title}</p>{toast.message ? <p className="mt-0.5 text-xs text-text-secondary">{toast.message}</p> : null}</div><IconButton aria-label="Dismiss notification" size="sm" onClick={() => dismiss(toast.id)}><X aria-hidden className="size-4" /></IconButton></article>)}</section>;
}
