"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowUpRight, Search, X } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { IconButton } from "./button";

export function CommandMenu({ open, onOpenChange, links }: { open: boolean; onOpenChange: (open: boolean) => void; links: { label: string; href: string }[] }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const results = links.filter((link) => link.label.toLowerCase().includes(query.trim().toLowerCase()));
  return <DialogPrimitive.Root open={open} onOpenChange={(value) => { onOpenChange(value); if (!value) setQuery(""); }}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="ui-dialog-backdrop fixed inset-0 z-40 bg-[var(--overlay)]" />
      <DialogPrimitive.Content ref={contentRef} className="ui-dialog-panel fixed left-1/2 top-[14vh] z-50 w-[min(92vw,32rem)] -translate-x-1/2 overflow-hidden rounded-[var(--radius-lg)] border bg-surface shadow-[var(--shadow-2)] focus:outline-none" onOpenAutoFocus={(event) => {
        event.preventDefault();
        returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        inputRef.current?.focus();
      }} onCloseAutoFocus={(event) => { event.preventDefault(); returnFocus.current?.focus(); }} onKeyDown={(event) => {
        if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
        const rows = Array.from(contentRef.current?.querySelectorAll<HTMLAnchorElement>("nav a") ?? []);
        if (!rows.length) return;
        event.preventDefault();
        const index = rows.indexOf(document.activeElement as HTMLAnchorElement);
        const next = event.key === "ArrowDown" ? (index + 1) % rows.length : (index <= 0 ? rows.length - 1 : index - 1);
        rows[next]?.focus();
      }}>
        <DialogPrimitive.Title className="sr-only">Search workspace</DialogPrimitive.Title>
        <DialogPrimitive.Description className="sr-only">Find and open a page in your workspace.</DialogPrimitive.Description>
        <div className="flex items-center gap-3 border-b px-4 py-3"><Search aria-hidden className="size-4 text-text-muted" /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Find a page" placeholder="Find a page..." className="min-h-10 min-w-0 flex-1 rounded-md bg-transparent px-2 text-sm text-text-primary outline-none placeholder:text-text-muted" autoComplete="off" /><DialogPrimitive.Close asChild><IconButton aria-label="Close search" className="size-10"><X aria-hidden className="size-4" /></IconButton></DialogPrimitive.Close></div>
        <nav aria-label="Quick navigation" className="max-h-[50dvh] overflow-y-auto p-2">{results.length ? results.map((link) => <Link key={link.href} href={link.href} onClick={() => onOpenChange(false)} className="flex min-h-11 items-center justify-between rounded-lg px-3 text-xs font-medium outline-none hover:bg-surface-hover focus-visible:bg-surface-active focus-visible:text-brand">{link.label}<ArrowUpRight aria-hidden className="size-3.5 text-text-muted" /></Link>) : <p role="status" className="px-3 py-6 text-center text-xs text-text-muted">No matching pages. Try another name.</p>}</nav>
        <p className="border-t px-5 py-3 text-[10px] text-text-muted">↑ ↓ to navigate · Enter to open · Esc to close</p>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>;
}
