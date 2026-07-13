import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button, IconButton } from "./button";

export function Pagination({ page, pageSize, total, onPageChange }: { page: number; pageSize: number; total: number; onPageChange: (page: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  return <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3"><p className="text-xs text-text-muted">Showing {first}–{last} of {total}</p><div className="flex items-center gap-1"><IconButton aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}><ChevronLeft aria-hidden className="size-4" /></IconButton><span className="min-w-20 text-center text-xs">Page {page} of {totalPages}</span><IconButton aria-label="Next page" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}><ChevronRight aria-hidden className="size-4" /></IconButton></div></nav>;
}

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) { return <nav aria-label="Breadcrumb"><ol className="flex flex-wrap items-center gap-2 text-xs text-text-muted">{items.map((item, index) => <li key={`${item.label}-${index}`} className="flex items-center gap-2">{index ? <span aria-hidden>/</span> : null}{item.href ? <Link href={item.href} className="hover:text-text-primary">{item.label}</Link> : <span aria-current="page">{item.label}</span>}</li>)}</ol></nav>; }

export function PageHeader({ eyebrow, title, description, actions, breadcrumb }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode; breadcrumb?: ReactNode }) { return <header className="mb-6 grid gap-3"><div>{breadcrumb}{eyebrow ? <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">{eyebrow}</p> : null}<div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><h1 className="break-words text-2xl font-semibold tracking-tight">{title}</h1>{description ? <p className="mt-1 max-w-3xl text-sm text-text-secondary">{description}</p> : null}</div>{actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}</div></div></header>; }

export function SectionHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) { return <div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold">{title}</h2>{description ? <p className="mt-1 text-sm text-text-secondary">{description}</p> : null}</div>{action}</div>; }

export function CommandMenu({ open, onOpenChange, links }: { open: boolean; onOpenChange: (open: boolean) => void; links: { label: string; href: string }[] }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 grid place-items-start bg-[var(--overlay)] p-4 pt-[12vh]" role="presentation" onMouseDown={() => onOpenChange(false)}><div role="dialog" aria-modal="true" aria-label="Quick navigation" className="mx-auto w-full max-w-xl rounded-[var(--radius-lg)] border bg-surface-elevated p-3 shadow-[var(--shadow-2)]" onMouseDown={(event) => event.stopPropagation()}><p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Quick navigation</p><div className="grid">{links.map((link) => <Button key={link.href} variant="ghost" className="justify-start" onClick={() => onOpenChange(false)}><Link href={link.href} className="w-full text-left">{link.label}</Link></Button>)}</div></div></div>;
}
