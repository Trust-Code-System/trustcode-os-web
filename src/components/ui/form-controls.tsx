"use client";

import { useMotionPreference } from "@/lib/hooks/use-motion-preference";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp, Search } from "lucide-react";
import { motion } from "motion/react";
import {
  Children,
  forwardRef,
  isValidElement,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils/cn";
import { SquishThumb, microSpring } from "./micro-motion";

const fieldClass =
  "min-h-9 w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 text-sm text-text-primary shadow-[var(--shadow-inset)] placeholder:text-text-muted hover:border-border-strong focus:border-focus focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-danger/20";
const emptyValue = "__trustcode_empty__";

type Option = { value: string; label: string; disabled: boolean };
type OptionElementProps = {
  value?: string | number;
  disabled?: boolean;
  children?: ReactNode;
};

function optionsFrom(children: ReactNode): Option[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<OptionElementProps>(child)) return [];
    const label = String(child.props.children ?? child.props.value ?? "");
    return [
      {
        value: String(child.props.value ?? label),
        label,
        disabled: Boolean(child.props.disabled),
      },
    ];
  });
}

function encodeValue(value: string) {
  return value === "" ? emptyValue : value;
}
function decodeValue(value: string) {
  return value === emptyValue ? "" : value;
}

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(fieldClass, className)} {...props} />;
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(fieldClass, "min-h-28 resize-y py-3", className)}
      {...props}
    />
  );
});

export function Select({
  className,
  children,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select an option",
  disabled,
  required,
  name,
  id,
  invalid,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
}: {
  className?: string;
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  invalid?: boolean;
  "aria-label"?: string;
  "aria-describedby"?: string;
}) {
  const options = optionsFrom(children);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const highlightId = useId();
  const reduce = useMotionPreference();
  return (
    <SelectPrimitive.Root
      {...(value !== undefined ? { value: encodeValue(value) } : {})}
      {...(defaultValue !== undefined
        ? { defaultValue: encodeValue(defaultValue) }
        : {})}
      {...(disabled !== undefined ? { disabled } : {})}
      {...(required !== undefined ? { required } : {})}
      {...(name !== undefined ? { name } : {})}
      onValueChange={(next) => onValueChange?.(decodeValue(next))}
      onOpenChange={() => setHighlighted(null)}
    >
      <SelectPrimitive.Trigger
        id={id}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={invalid || undefined}
        className={cn(
          fieldClass,
          "flex items-center justify-between gap-2 text-left data-[placeholder]:text-text-muted",
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown
            aria-hidden
            className="size-4 shrink-0 text-text-muted"
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={5}
          collisionPadding={8}
          className="ui-floating ui-select-menu z-[100] max-h-[min(20rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface-elevated p-1 shadow-[var(--shadow-2)]"
        >
          <SelectPrimitive.ScrollUpButton className="flex h-7 items-center justify-center text-text-muted">
            <ChevronUp aria-hidden className="size-4" />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport className="relative isolate">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value || emptyValue}
                value={encodeValue(option.value) ?? emptyValue}
                disabled={option.disabled}
                onFocus={() => setHighlighted(option.value)}
                onPointerMove={() => { if (!option.disabled) setHighlighted(option.value); }}
                className="relative flex min-h-10 cursor-default select-none items-center rounded-[var(--radius-sm)] py-2 pl-8 pr-3 text-sm text-text-primary outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-45 data-[highlighted]:text-brand data-[state=checked]:font-semibold data-[state=checked]:text-brand"
              >
                {highlighted === option.value ? <motion.span aria-hidden data-micro="glide-select" layoutId={`${highlightId}-option`} className="micro-option-thumb pointer-events-none absolute inset-0 -z-10 rounded-[var(--radius-sm)] bg-surface-active" transition={reduce ? { duration: 0 } : microSpring} /> : null}
                <SelectPrimitive.ItemIndicator className="absolute left-2.5 grid place-items-center">
                  <Check aria-hidden className="size-4" />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="flex h-7 items-center justify-center text-text-muted">
            <ChevronDown aria-hidden className="size-4" />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export function MultiSelect({
  className,
  children,
  value,
  defaultValue = [],
  onValueChange,
  disabled,
  "aria-label": ariaLabel = "Select options",
}: {
  className?: string;
  children: ReactNode;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  const options = optionsFrom(children);
  const [internal, setInternal] = useState(defaultValue);
  const selected = value ?? internal;
  const update = (optionValue: string, checked: boolean) => {
    const next = checked
      ? [...selected, optionValue]
      : selected.filter((item) => item !== optionValue);
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };
  const summary = selected.length
    ? `${selected.length} selected`
    : "Select options";
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(
            fieldClass,
            "flex items-center justify-between gap-2 text-left",
            className,
          )}
        >
          <span>{summary}</span>
          <ChevronDown
            aria-hidden
            className="size-4 shrink-0 text-text-muted"
          />
        </button>
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          sideOffset={5}
          collisionPadding={8}
          className="ui-floating z-[100] max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto rounded-[var(--radius-md)] border border-border bg-surface-elevated p-1 shadow-[var(--shadow-2)]"
        >
          {options.map((option) => (
            <DropdownMenuPrimitive.CheckboxItem
              key={option.value}
              checked={selected.includes(option.value)}
              disabled={option.disabled}
              onCheckedChange={(checked) =>
                update(option.value, checked === true)
              }
              onSelect={(event) => event.preventDefault()}
              className="micro-menu-item relative flex min-h-10 cursor-default select-none items-center rounded-[var(--radius-sm)] py-2 pl-8 pr-3 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-45 data-[highlighted]:bg-surface-active data-[highlighted]:text-brand"
            >
              <DropdownMenuPrimitive.ItemIndicator className="absolute left-2.5">
                <Check aria-hidden className="size-4" />
              </DropdownMenuPrimitive.ItemIndicator>
              {option.label}
            </DropdownMenuPrimitive.CheckboxItem>
          ))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

export const SearchField = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label?: string }
>(function SearchField({ className, label = "Search", ...props }, ref) {
  return (
    <label className={cn("relative block", className)}>
      <span className="sr-only">{label}</span>
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
      />
      <Input ref={ref} type="search" className="pl-9 pr-9" {...props} />
    </label>
  );
});

export function Checkbox({
  label,
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: ReactNode }) {
  return (
    <label
      className={cn(
        "spring-check inline-flex min-h-10 cursor-pointer items-center gap-2 text-sm",
        className,
      )}
    >
      <input type="checkbox" className="peer sr-only" {...props} />
      <span
        aria-hidden
        className="spring-check-box grid size-5 shrink-0 place-items-center rounded border border-border-strong bg-surface peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus peer-disabled:opacity-50"
      >
        <svg aria-hidden className="relative size-3.5 text-brand-contrast" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path pathLength="1" d="M5 12 10 17 20 7" /></svg>
      </span>
      <span>{label}</span>
    </label>
  );
}

export function Radio({
  label,
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: ReactNode }) {
  return (
    <label
      className={cn(
        "inline-flex min-h-10 cursor-pointer items-center gap-2 text-sm",
        className,
      )}
    >
      <input type="radio" className="peer sr-only" {...props} />
      <span aria-hidden className="micro-radio grid size-5 shrink-0 place-items-center rounded-full border border-border-strong bg-surface peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus peer-disabled:opacity-50"><span className="size-2.5 rounded-full bg-brand" /></span>
      <span>{label}</span>
    </label>
  );
}

export function Switch({
  label,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className="inline-flex min-h-10 items-center gap-3 rounded-[var(--radius-md)] text-sm disabled:opacity-50"
    >
      <span
        className={cn(
          "flex h-6 w-11 items-center rounded-full border p-0.5 transition-colors",
          checked
            ? "border-brand bg-brand"
            : "border-border-strong bg-surface-hover",
        )}
      >
        <SquishThumb checked={checked} />
      </span>
      {label}
    </button>
  );
}

export const DatePicker = forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, "type">
>(function DatePicker(props, ref) {
  return <Input ref={ref} type="date" {...props} />;
});

export function FormField({
  label,
  htmlFor,
  description,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor?: string | undefined;
  description?: string | undefined;
  error?: string | undefined;
  required?: boolean | undefined;
  children: ReactNode;
}) {
  const generatedId = useId();
  const id = htmlFor ?? generatedId;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required ? (
          <span className="text-danger" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </label>
      {description ? (
        <p id={`${id}-description`} className="text-xs text-text-muted">
          {description}
        </p>
      ) : null}
      {children}
      {error ? (
        <ValidationMessage id={`${id}-error`}>{error}</ValidationMessage>
      ) : null}
    </div>
  );
}

export function ValidationMessage({
  id,
  children,
}: {
  id?: string;
  children: ReactNode;
}) {
  return (
    <p id={id} role="alert" className="text-xs text-danger">
      {children}
    </p>
  );
}

export function FileUploader({
  label = "Choose a file",
  accept,
  disabled,
  onFiles,
}: {
  label?: string;
  accept?: string;
  disabled?: boolean;
  onFiles?: (files: FileList) => void;
}) {
  return (
    <label className="grid min-h-28 cursor-pointer place-items-center rounded-[var(--radius-lg)] border border-dashed border-border-strong bg-surface px-6 text-center text-sm text-text-secondary hover:bg-surface-hover focus-within:outline-2 focus-within:outline-focus">
      <input
        className="sr-only"
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={(event) =>
          event.target.files && onFiles?.(event.target.files)
        }
      />
      <span>
        {label}
        <span className="mt-1 block text-xs text-text-muted">
          File rules are validated before upload.
        </span>
      </span>
    </label>
  );
}
