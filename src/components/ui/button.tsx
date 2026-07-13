import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

const buttonVariants = cva("inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-md)] px-3.5 text-sm font-semibold shadow-[var(--shadow-inset)] transition-[color,background-color,border-color,box-shadow,transform] duration-150 active:translate-y-px focus-visible:outline-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45", {
  variants: {
    variant: {
      primary: "bg-brand text-brand-contrast shadow-[0_7px_16px_rgb(27_63_174/0.18)] hover:bg-brand-hover hover:shadow-[0_9px_20px_rgb(27_63_174/0.24)]",
      secondary: "border border-border bg-surface text-text-primary hover:border-border-strong hover:bg-surface-hover",
      ghost: "text-text-secondary hover:bg-surface-hover hover:text-text-primary",
      danger: "bg-danger text-white hover:opacity-90",
    },
    size: { sm: "min-h-8 px-3 text-xs", md: "min-h-9 px-3.5", lg: "min-h-11 px-5" },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { loading?: boolean };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ className, children, disabled, loading = false, variant, size, ...props }, ref) {
  return <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>{loading ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : null}{children}</button>;
});

export const IconButton = forwardRef<HTMLButtonElement, ButtonProps & { "aria-label": string }>(function IconButton({ className, children, ...props }, ref) {
  return <Button ref={ref} variant="ghost" className={cn("size-9 shrink-0 p-0", className)} {...props}>{children}</Button>;
});

export { buttonVariants };
