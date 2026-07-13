import type { HTMLAttributes, ReactNode, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils/cn";

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "danger" | "info" }) {
  const tones = { neutral: "bg-surface-active text-text-secondary", success: "bg-success/10 text-success", warning: "bg-warning/10 text-warning", danger: "bg-danger/10 text-danger", info: "bg-information/10 text-information" };
  return <span className={cn("inline-flex min-h-6 items-center rounded-[var(--radius-full)] px-2 py-0.5 text-xs font-medium", tones[tone])}>{children}</span>;
}

export function Avatar({ name, src, size = "md" }: { name: string; src?: string; size?: "sm" | "md" | "lg" }) {
  const initials = name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  const sizes = { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-14 text-base" };
  return <span role="img" aria-label={name} className={cn("relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-surface-active font-semibold text-text-secondary", sizes[size])}>{src ? <Image src={src} alt="" fill sizes={size === "lg" ? "56px" : size === "md" ? "40px" : "32px"} className="object-cover" /> : initials}</span>;
}

export function Table(props: TableHTMLAttributes<HTMLTableElement>) { return <div className="overflow-x-auto"><table {...props} className={cn("w-full border-collapse text-left text-sm", props.className)} /></div>; }
export function TableHead(props: HTMLAttributes<HTMLTableSectionElement>) { return <thead {...props} className={cn("border-b text-xs uppercase tracking-wide text-text-muted", props.className)} />; }
export function TableBody(props: HTMLAttributes<HTMLTableSectionElement>) { return <tbody {...props} className={cn("divide-y", props.className)} />; }
export function TableRow(props: HTMLAttributes<HTMLTableRowElement>) { return <tr {...props} className={cn("transition-colors hover:bg-surface-hover", props.className)} />; }
export function TableHeader(props: ThHTMLAttributes<HTMLTableCellElement>) { return <th {...props} className={cn("px-4 py-3 font-medium", props.className)} />; }
export function TableCell(props: TdHTMLAttributes<HTMLTableCellElement>) { return <td {...props} className={cn("px-4 py-4 align-middle", props.className)} />; }

export function MetricCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) { return <div className="rounded-[var(--radius-lg)] border bg-surface p-5"><p className="text-sm text-text-secondary">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p>{hint ? <p className="mt-1 text-xs text-text-muted">{hint}</p> : null}</div>; }

export function TimelineItem({ title, description, timestamp }: { title: string; description?: string; timestamp: string }) { return <li className="relative grid gap-1 border-l pl-5 pb-6 last:pb-0 before:absolute before:-left-1.5 before:top-1 before:size-3 before:rounded-full before:border-2 before:border-surface before:bg-border-strong"><p className="text-sm font-medium">{title}</p>{description ? <p className="text-sm text-text-secondary">{description}</p> : null}<time className="text-xs text-text-muted">{timestamp}</time></li>; }
