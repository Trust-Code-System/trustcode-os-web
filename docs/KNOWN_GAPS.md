# Known Gaps

- Client endpoints, DTOs, persistence model, roles, mutation rules, and relationship shapes are not implemented in the backend; the frontend contract is provisional.
- Backend auth uses JSON refresh tokens. The frontend BFF mitigates browser exposure, but production cookie/CSRF policy needs deployment-domain review.
- `/auth/me` does not return the user's name; UI falls back to email.
- Team routes are confirmed but team UI is a placeholder by session constraint.
- Create/edit/archive client actions are intentionally non-functional until backend mutation contracts are confirmed.
- Client contacts, notes, projects, meetings, documents, and activity are display-only mock aggregates in the reference detail page.
- Final visual design, charts, and dashboard aggregation are intentionally deferred.
- Full multi-browser/device assistive-technology testing remains an ongoing release activity.
