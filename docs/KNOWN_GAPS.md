# Known Gaps

- Client endpoints, DTOs, persistence model, roles, mutation rules, and relationship shapes are not implemented in the backend; the frontend contract is provisional.
- Backend auth uses JSON refresh tokens. The frontend BFF mitigates browser exposure, but production cookie/CSRF policy needs deployment-domain review.
- `/auth/me` does not return the user's name; UI falls back to email.
- Team, Projects, Project Workspace, Meetings, Documents, Activity, Dashboard, and Settings now have approved visual layouts backed by typed presentation fixtures; their write/integration workflows remain unimplemented.
- Create/edit/archive client actions are intentionally non-functional until backend mutation contracts are confirmed.
- Client contacts, notes, projects, meetings, documents, and activity are display-only mock aggregates in the reference detail page.
- The approved visual design is integrated. Dashboard metrics and its CSS completion ring are presentation-only; live aggregation and charting remain deferred.
- Stitch supplied desktop screens only. Tablet and mobile views are system-derived responsive adaptations verified at 320, 768, and 1280 pixels.
- No separate Tasks screen or final notification workflow was supplied in Stitch; those remain route-level or interaction-level gaps.
- Full multi-browser/device assistive-technology testing remains an ongoing release activity.
