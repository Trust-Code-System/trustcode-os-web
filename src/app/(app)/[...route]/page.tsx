import { notFound } from "next/navigation";

import { PlaceholderPage } from "@/components/feedback/placeholder-page";
import { Alert } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/navigation";
import { readSessionUser } from "@/lib/auth/session";

const moduleDescriptions: Record<string, { title: string; description: string }> = {
  dashboard: { title: "Dashboard", description: "Aggregation will be implemented after operational module APIs are stable." },
  projects: { title: "Projects", description: "Project, task, and milestone workflows are deferred for this session." },
  meetings: { title: "Meetings", description: "Meeting scheduling and records are deferred for this session." },
  documents: { title: "Documents", description: "Document storage workflows are deferred for this session." },
  activity: { title: "Activity", description: "The unified activity feed awaits supported backend read contracts." },
  team: { title: "Team", description: "Team administration endpoints exist, but their UI is outside this session boundary." },
  settings: { title: "Settings", description: "Settings routes are reserved; only password security is functional in this session." },
};

export default async function DeferredRoutePage({ params }: { params: Promise<{ route: string[] }> }) {
  const { route } = await params;
  if (!isPlannedRoute(route)) notFound();
  const routeModule = route[0];
  if (!routeModule) notFound();
  const detail = moduleDescriptions[routeModule];
  if (!detail) notFound();
  if (routeModule === "team" && (await readSessionUser())?.role !== "ADMIN") {
    return <><PageHeader title="Team" description="Team administration is restricted to administrators." /><Alert variant="danger" title="Access denied">Your account does not have permission to access team administration.</Alert></>;
  }
  return <PlaceholderPage title={route.length > 1 ? `${detail.title} · ${route.slice(1).join(" / ")}` : detail.title} description={detail.description} />;
}

function isPlannedRoute(route: string[]) {
  const [moduleName, segment, action] = route;
  if (moduleName === "dashboard" || moduleName === "documents" || moduleName === "activity") return route.length === 1;
  if (moduleName === "projects" || moduleName === "meetings") return route.length === 1 || route.length === 2 || (route.length === 3 && action === "edit");
  if (moduleName === "team") return route.length === 1 || route.length === 2;
  if (moduleName === "settings") return route.length === 1 || (route.length === 2 && segment === "profile");
  return false;
}
