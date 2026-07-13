import Image from "next/image";

import { cn } from "@/lib/utils/cn";

export function BrandLogo({ inverse = false, className }: { inverse?: boolean; className?: string }) {
  return <Image src={inverse ? "/brand/trustcode-system-logo-dark.png" : "/brand/trustcode-systems-logo.png"} alt="TrustCode System" width={1640} height={430} priority className={cn("h-auto w-36", className)} />;
}
