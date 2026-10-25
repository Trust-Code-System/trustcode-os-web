import type { ReactNode } from "react";

export default function WorkspaceTemplate({ children }: { children: ReactNode }) {
  return <div className="route-enter min-w-0">{children}</div>;
}
