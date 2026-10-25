import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { IconButton } from "./button";

export function Pagination({ page, pageSize, total, onPageChange }: { page: number; pageSize: number; total: number; onPageChange: (page: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  return <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3"><p className="text-xs text-text-muted">Showing {first}–{last} of {total}</p><div className="flex items-center gap-1"><IconButton aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}><ChevronLeft aria-hidden className="size-4" /></IconButton><span className="min-w-20 text-center text-xs">Page {page} of {totalPages}</span><IconButton aria-label="Next page" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}><ChevronRight aria-hidden className="size-4" /></IconButton></div></nav>;
}

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) { return <nav aria-label="Breadcrumb"><ol className="flex flex-wrap items-center gap-2 text-xs text-text-muted">{items.map((item, index) => <li key={`${item.label}-${index}`} className="flex items-center gap-2">{index ? <span aria-hidden>/</span> : null}{item.href ? <Link href={item.href} className="hover:text-text-primary">{item.label}</Link> : <span aria-current="page">{item.label}</span>}</li>)}</ol></nav>; }

export function PageHeader({ eyebrow, title, description, actions, breadcrumb }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode; breadcrumb?: ReactNode }) { return <header className="mb-6 grid gap-2"><div>{breadcrumb}{eyebrow ? <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-text-muted">{eyebrow}</p> : null}<div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h1 className="text-pretty break-words text-[1.7rem] md:text-[1.9rem] font-bold leading-tight tracking-[-0.045em]">{title}</h1>{description ? <p className="mt-2 max-w-3xl text-xs leading-6 text-text-secondary">{description}</p> : null}</div>{actions ? <div className="flex max-w-full min-w-0 flex-wrap gap-2">{actions}</div> : null}</div></div></header>; }

export function SectionHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) { return <div className="mb-3 flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-sm font-bold tracking-[-0.015em]">{title}</h2>{description ? <p className="mt-1 text-xs text-text-secondary">{description}</p> : null}</div>{action}</div>; }

export { CommandMenu } from "./command-menu";
