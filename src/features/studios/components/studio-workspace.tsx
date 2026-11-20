import { Alert } from "@/components/ui/feedback";
import { studioPageAccess } from "../server/access";
import { studioCatalog, type StudioKind } from "../catalog";

export async function StudioWorkspace({ kind }: { kind: StudioKind }) {
  const studio = studioCatalog[kind];
  const access = await studioPageAccess(studio.href);
  if (!access.ok) return <div className="p-6"><Alert variant="danger" title="Studio unavailable">{access.status === 403 ? "Your account does not have access to this studio." : "We could not verify studio access. Please try again."}</Alert></div>;
  return <section className="studio-workspace" aria-label={studio.title}><iframe title={`${studio.title} editor`} src={`/api/studios/${kind}/index.html`} className="studio-workspace-frame" allow="clipboard-write" /></section>;
}
