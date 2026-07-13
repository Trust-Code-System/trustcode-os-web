"use client";

import { Check, Search } from "lucide-react";
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

const fieldClass = "min-h-9 w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 text-sm text-text-primary shadow-[var(--shadow-inset)] placeholder:text-text-muted hover:border-border-strong focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/15 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/20";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(fieldClass, className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(fieldClass, "min-h-28 resize-y py-3", className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...props }, ref) {
  return <select ref={ref} className={cn(fieldClass, "appearance-auto", className)} {...props}>{children}</select>;
});

export const MultiSelect = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function MultiSelect({ className, children, ...props }, ref) {
  return <select ref={ref} multiple className={cn(fieldClass, "min-h-28 py-2", className)} {...props}>{children}</select>;
});

export const SearchField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label?: string }>(function SearchField({ className, label = "Search", ...props }, ref) {
  return <label className={cn("relative block", className)}><span className="sr-only">{label}</span><Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" /><Input ref={ref} type="search" className="pl-9 pr-9" {...props} /></label>;
});

export function Checkbox({ label, className, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: ReactNode }) {
  return <label className={cn("inline-flex min-h-10 cursor-pointer items-center gap-2 text-sm", className)}><input type="checkbox" className="peer sr-only" {...props} /><span aria-hidden className="grid size-5 place-items-center rounded border border-border-strong bg-surface peer-checked:border-brand peer-checked:bg-brand peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus peer-disabled:opacity-50"><Check className="size-3.5 text-brand-contrast opacity-0 peer-checked:opacity-100" /></span><span>{label}</span></label>;
}

export function Radio({ label, className, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: ReactNode }) {
  return <label className={cn("inline-flex min-h-10 cursor-pointer items-center gap-2 text-sm", className)}><input type="radio" className="size-5 accent-[var(--brand)]" {...props} /><span>{label}</span></label>;
}

export function Switch({ label, checked, onCheckedChange, disabled }: { label: string; checked: boolean; onCheckedChange: (checked: boolean) => void; disabled?: boolean }) {
  return <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onCheckedChange(!checked)} className="inline-flex min-h-10 items-center gap-3 rounded-[var(--radius-md)] text-sm disabled:opacity-50"><span className={cn("flex h-6 w-11 items-center rounded-full border p-0.5 transition-colors", checked ? "border-brand bg-brand" : "border-border-strong bg-surface-hover")}><span className={cn("size-4 rounded-full bg-white shadow transition-transform", checked && "translate-x-5")} /></span>{label}</button>;
}

export const DatePicker = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, "type">>(function DatePicker(props, ref) {
  return <Input ref={ref} type="date" {...props} />;
});

export function FormField({ label, htmlFor, description, error, required, children }: { label: string; htmlFor?: string | undefined; description?: string | undefined; error?: string | undefined; required?: boolean | undefined; children: ReactNode }) {
  const generatedId = useId();
  const id = htmlFor ?? generatedId;
  return <div className="grid gap-1.5"><label htmlFor={id} className="text-sm font-medium">{label}{required ? <span className="text-danger" aria-hidden> *</span> : null}</label>{description ? <p id={`${id}-description`} className="text-xs text-text-muted">{description}</p> : null}{children}{error ? <ValidationMessage id={`${id}-error`}>{error}</ValidationMessage> : null}</div>;
}

export function ValidationMessage({ id, children }: { id?: string; children: ReactNode }) {
  return <p id={id} role="alert" className="text-xs text-danger">{children}</p>;
}

export function FileUploader({ label = "Choose a file", accept, disabled, onFiles }: { label?: string; accept?: string; disabled?: boolean; onFiles?: (files: FileList) => void }) {
  return <label className="grid min-h-28 cursor-pointer place-items-center rounded-[var(--radius-lg)] border border-dashed border-border-strong bg-surface px-6 text-center text-sm text-text-secondary hover:bg-surface-hover focus-within:outline-2 focus-within:outline-focus"><input className="sr-only" type="file" accept={accept} disabled={disabled} onChange={(event) => event.target.files && onFiles?.(event.target.files)} /><span>{label}<span className="mt-1 block text-xs text-text-muted">File rules are validated before upload.</span></span></label>;
}
