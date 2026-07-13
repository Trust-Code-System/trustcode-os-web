"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import { IconButton } from "./button";

export function Dialog({ trigger, title, description, children, open, onOpenChange, side }: { trigger?: ReactNode | undefined; title: string; description?: string | undefined; children: ReactNode; open?: boolean | undefined; onOpenChange?: ((open: boolean) => void) | undefined; side?: "left" | "right" | undefined }) {
  return <DialogPrimitive.Root {...(open !== undefined ? { open } : {})} {...(onOpenChange ? { onOpenChange } : {})}><DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger><DialogPrimitive.Portal><DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-[var(--overlay)] data-[state=open]:animate-in data-[state=closed]:animate-out" /><DialogPrimitive.Content className={cn("fixed z-50 max-h-[90vh] overflow-y-auto border bg-surface-elevated p-6 shadow-[var(--shadow-2)] focus:outline-none", side ? "inset-y-0 w-[min(90vw,22rem)] rounded-none" : "left-1/2 top-1/2 w-[min(90vw,34rem)] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-lg)]", side === "left" && "left-0", side === "right" && "right-0")}><div className="pr-10"><DialogPrimitive.Title className="text-lg font-semibold">{title}</DialogPrimitive.Title>{description ? <DialogPrimitive.Description className="mt-1 text-sm text-text-secondary">{description}</DialogPrimitive.Description> : null}</div><DialogPrimitive.Close asChild><IconButton aria-label="Close" className="absolute right-3 top-3"><X aria-hidden className="size-5" /></IconButton></DialogPrimitive.Close><div className="mt-5">{children}</div></DialogPrimitive.Content></DialogPrimitive.Portal></DialogPrimitive.Root>;
}

export function ConfirmationDialog({ trigger, title, description, confirmLabel, onConfirm }: { trigger: ReactNode; title: string; description: string; confirmLabel: string; onConfirm: () => void }) {
  return <Dialog trigger={trigger} title={title} description={description}><DialogPrimitive.Close className="min-h-10 rounded-[var(--radius-md)] bg-danger px-4 text-sm font-medium text-white" onClick={onConfirm}>{confirmLabel}</DialogPrimitive.Close></Dialog>;
}

export function Drawer(props: Parameters<typeof Dialog>[0]) { return <Dialog {...props} side={props.side ?? "right"} />; }
export function Sheet(props: Parameters<typeof Dialog>[0]) { return <Dialog {...props} side={props.side ?? "right"} />; }

export function DropdownMenu({ trigger, label, items }: { trigger: ReactNode; label: string; items: { label: string; onSelect?: () => void; href?: string; disabled?: boolean }[] }) {
  return <DropdownPrimitive.Root><DropdownPrimitive.Trigger asChild>{trigger}</DropdownPrimitive.Trigger><DropdownPrimitive.Portal><DropdownPrimitive.Content align="end" sideOffset={8} aria-label={label} className="z-50 min-w-48 rounded-[var(--radius-md)] border bg-surface-elevated p-1 shadow-[var(--shadow-2)]">{items.map((item) => <DropdownPrimitive.Item key={item.label} {...(item.disabled !== undefined ? { disabled: item.disabled } : {})} {...(item.onSelect ? { onSelect: item.onSelect } : {})} asChild={Boolean(item.href)} className="flex min-h-10 cursor-default items-center rounded-[var(--radius-sm)] px-3 text-sm outline-none hover:bg-surface-hover focus:bg-surface-hover data-[disabled]:opacity-50">{item.href ? <a href={item.href}>{item.label}</a> : <span>{item.label}</span>}</DropdownPrimitive.Item>)}</DropdownPrimitive.Content></DropdownPrimitive.Portal></DropdownPrimitive.Root>;
}

export function Tooltip({ children, content }: { children: ReactNode; content: ReactNode }) {
  return <TooltipPrimitive.Provider delayDuration={300}><TooltipPrimitive.Root><TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger><TooltipPrimitive.Portal><TooltipPrimitive.Content sideOffset={6} className="z-50 rounded-[var(--radius-sm)] bg-text-primary px-2 py-1 text-xs text-surface">{content}<TooltipPrimitive.Arrow className="fill-text-primary" /></TooltipPrimitive.Content></TooltipPrimitive.Portal></TooltipPrimitive.Root></TooltipPrimitive.Provider>;
}

export function Popover({ trigger, children, label }: { trigger: ReactNode; children: ReactNode; label: string }) {
  return <PopoverPrimitive.Root><PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger><PopoverPrimitive.Portal><PopoverPrimitive.Content aria-label={label} sideOffset={8} className="z-50 w-72 rounded-[var(--radius-lg)] border bg-surface-elevated p-4 shadow-[var(--shadow-2)]">{children}<PopoverPrimitive.Arrow className="fill-surface-elevated" /></PopoverPrimitive.Content></PopoverPrimitive.Portal></PopoverPrimitive.Root>;
}

export function Tabs({ defaultValue, items }: { defaultValue: string; items: { value: string; label: string; content: ReactNode }[] }) {
  return <TabsPrimitive.Root defaultValue={defaultValue}><TabsPrimitive.List aria-label="Detail sections" className="flex gap-1 overflow-x-auto border-b">{items.map((item) => <TabsPrimitive.Trigger key={item.value} value={item.value} className="min-h-11 shrink-0 border-b-2 border-transparent px-3 text-sm text-text-secondary data-[state=active]:border-brand data-[state=active]:text-text-primary">{item.label}</TabsPrimitive.Trigger>)}</TabsPrimitive.List>{items.map((item) => <TabsPrimitive.Content key={item.value} value={item.value} className="pt-6 focus:outline-none">{item.content}</TabsPrimitive.Content>)}</TabsPrimitive.Root>;
}
