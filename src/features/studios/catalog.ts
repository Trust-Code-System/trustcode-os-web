export const studioCatalog = {
  invoice: {
    title: "Invoice studio",
    description: "Prepare client invoices, payment milestones and currency breakdowns.",
    href: "/documents/invoices",
    assets: {
      "index.html": "text/html; charset=utf-8",
      "TrustCode-Invoice-Template.pdf": "application/pdf",
      "TrustCode-Invoice-Template.docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "TrustCode-Invoice-Template.xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  },
  contract: {
    title: "Contract studio",
    description: "Prepare service agreements and mutual or one-way NDAs.",
    href: "/documents/contracts",
    assets: {
      "index.html": "text/html; charset=utf-8",
      "TrustCode-Service-Agreement.pdf": "application/pdf",
      "TrustCode-Service-Agreement.docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "TrustCode-NDA.pdf": "application/pdf",
      "TrustCode-NDA.docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
  },
} as const;

export type StudioKind = keyof typeof studioCatalog;

export function studioAsset(parts: string[]) {
  if (parts.length < 1 || parts.length > 2) return null;
  const kind = parts[0];
  if (kind !== "invoice" && kind !== "contract") return null;
  const file = parts[1] ?? "index.html";
  const assets: Record<string, string> = studioCatalog[kind].assets;
  if (!Object.hasOwn(assets, file)) return null;
  const contentType = assets[file];
  return contentType ? { kind, file, contentType } : null;
}

export function studioReturnPath(value: string | null) {
  return ["/documents", "/documents/invoices", "/documents/contracts"].includes(value ?? "")
    ? value!
    : "/documents";
}
