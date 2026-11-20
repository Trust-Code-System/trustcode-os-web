import type { Metadata } from "next";
import { TeamScreen } from "@/features/workspace/components/workspace-screens";

export const metadata: Metadata = { title: "Team & roles" };
export default function TeamSettingsPage() {
  return <div className="settings-team-panel"><TeamScreen embedded /><section className="settings-permissions"><h2>Roles & permissions</h2><p>Access follows the existing workspace roles.</p><div className="report-table-scroll"><table><thead><tr><th>Permission</th><th>Administrator</th><th>Member</th></tr></thead><tbody><tr><th>Manage clients and delivery</th><td>Full access</td><td>Workspace access</td></tr><tr><th>Team administration</th><td>Full access</td><td>No access</td></tr><tr><th>Invitations and member roles</th><td>Full access</td><td>No access</td></tr><tr><th>Personal account settings</th><td>Own account</td><td>Own account</td></tr></tbody></table></div></section></div>;
}
