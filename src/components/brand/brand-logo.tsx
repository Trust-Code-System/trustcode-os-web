import Image from "next/image";

import { cn } from "@/lib/utils/cn";

export function BrandMark({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/trustcode-systems-mark.png"
      alt=""
      width={430}
      height={430}
      priority
      aria-hidden
      className={cn("size-10 shrink-0", className)}
    />
  );
}

export function BrandWordmark({
  inverse = false,
  className,
}: {
  inverse?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={
        inverse
          ? "/brand/trustcode-system-wordmark-dark.png"
          : "/brand/trustcode-systems-wordmark.png"
      }
      alt="TrustCode System"
      width={1170}
      height={430}
      priority
      className={cn("h-9 w-auto", className)}
    />
  );
}

export function BrandLogo({
  inverse = false,
  className,
}: {
  inverse?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <BrandMark />
      <BrandWordmark inverse={inverse} />
    </span>
  );
}
