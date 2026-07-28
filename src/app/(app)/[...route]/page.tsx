import { notFound } from "next/navigation";

import { PlaceholderPage } from "@/components/feedback/placeholder-page";
import { Alert } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/navigation";
import { ActivityScreen, DashboardScreen, DocumentsScreen, MeetingsScreen, ProjectsScreen, ProjectWorkspaceScreen, TeamScreen } from "@/features/workspace/components/workspace-screens";
import { readSessionUser } from "@/lib/auth/session";

const moduleDescriptions: Record<string, { title: string; description: string }> = {
  dashboard: { title: "Dashboard", description: "Live operational summary." },
  projects: { title: "Projects", description: "Projects, milestones, and members." },
  meetings: { title: "Meetings", description: "Meeting scheduling and records." },
  documents: { title: "Documents", description: "Awaiting a backend document controller." },
  activity: { title: "Activity", description: "Awaiting a unified backend activity endpoint." },
  team: { title: "Team", description: "Team administration." },
};

export default async function DeferredRoutePage({ params }: { params: Promise<{ route: string[] }> }) {
  const { route } = await params;
  if (!isPlannedRoute(route)) notFound();
  const routeModule = route[0];
  if (!routeModule) notFound();
  const detail = moduleDescriptions[routeModule];
  if (!detail) notFound();
  const user = await readSessionUser();
  if (routeModule === "team" && user?.role !== "ADMIN") {
    return <><PageHeader title="Team" description="Team administration is restricted to administrators." /><Alert variant="danger" title="Access denied">Your account does not have permission to access team administration.</Alert></>;
  }
  if (routeModule === "dashboard" && route.length === 1) return <DashboardScreen />;
  if (routeModule === "projects" && route.length === 1) return <ProjectsScreen />;
  if (routeModule === "projects" && route.length === 2 && route[1]) return <ProjectWorkspaceScreen projectId={route[1]} />;
  if (routeModule === "meetings" && route.length === 1) return <MeetingsScreen />;
  if (routeModule === "documents" && route.length === 1) return <DocumentsScreen />;
  if (routeModule === "activity" && route.length === 1) return <ActivityScreen />;
  if (routeModule === "team" && route.length === 1) return <TeamScreen />;
  return <PlaceholderPage title={route.length > 1 ? `${detail.title} · ${route.slice(1).join(" / ")}` : detail.title} description={detail.description} />;
}

function isPlannedRoute(route: string[]) {
  const [moduleName, , action] = route;
  if (moduleName === "dashboard" || moduleName === "documents" || moduleName === "activity") return route.length === 1;
  if (moduleName === "projects" || moduleName === "meetings") return route.length === 1 || route.length === 2 || (route.length === 3 && action === "edit");
  if (moduleName === "team") return route.length === 1 || route.length === 2;
  return false;
}
