import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "TrustCode OS", template: "%s · TrustCode OS" },
  description: "Agency operations workspace for TrustCode System Limited",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
