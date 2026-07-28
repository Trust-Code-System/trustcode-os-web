# Known Gaps

- Documents, tasks, notifications, unified activity, and backend-computed dashboard analytics do not yet have backend controllers.
- Profile editing and profile-photo endpoints do not exist. Profile identity is read-only in live mode; the photo workflow remains available only in explicit mock mode.
- The current UI exposes the backend's main create/read/update/lifecycle paths. Full-field editors for every nested record can be expanded as those workflows are finalized.
- `/auth/me` does not return the user's name, so the session retains the name returned at login.
- Backend client list search and sort are not implemented. The frontend sends only the supported status, stage, page, and pageSize query keys.
- Production frontend/API domains and the final CSRF/cookie policy still need deployment review.
