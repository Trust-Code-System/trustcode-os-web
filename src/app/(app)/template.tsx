import type { ReactNode } from "react";
import { PageEntrance } from "@/components/layout/soft-navigation";

export default function WorkspaceTemplate({ children }: { children: ReactNode }) {
  return <PageEntrance>{children}</PageEntrance>;
}
