# Portal micro interactions

React Bits reference: https://reactbits.dev/c/micro

Source repository: https://github.com/DavidHDev/react-bits

Reviewed revision: `e12c22192ac7b4b452c5e2feb9b586d74765d696`, matching upstream main at the time of review. Source files are under `src/content/Micro/<Name>/<Name>.jsx`. The catalog's generic MIT label is incomplete: the repository license is MIT plus Commons Clause. The complete notice is preserved in `docs/vendor/react-bits.LICENSE.md`. These adaptations are part of the TrustCode application, not a component product or hosted clone.

Pinned runtime: `motion@12.43.0` (MIT), React peers `^18 || ^19`, compatible with this application's React 19.2.4. Existing Radix primitives retain their keyboard, focus, form and portal behavior; Hugeicons is not added because Lucide and inline SVG already supply the required glyphs.

## Adaptations and coverage

| Pattern | Integration | Where it appears |
| --- | --- | --- |
| Swipe Toast | Motion entrance, layout and swipe; timed fuse pauses on hover, focus, drag and hidden documents; errors persist; dismiss button and Escape alternative | Real mutation feedback across clients, contacts, projects, milestones, meetings, team and profile |
| Rubber Segment | Spring travelling active surface; Radix tabs retain roving focus and arrow keys | All five client detail tabs, all four project detail tabs, settings navigation |
| Glide Select | Moving highlight with a soft, viewport-aware Radix popper; branded trigger, options and scroll buttons | List filters, create/edit forms, project roles/status, activity filters, team forms, settings selectors |
| Squish Switch | Velocity-based thumb stretch and spring travel, controlled by the existing semantic switch | Shared switch primitive and component inspection surface; unsupported preferences remain disabled |
| Spring Check | Fill swell and drawn tick on the real native checkbox; labels, form submission and focus retained | Notification preferences, shared form checkboxes, component inspection surface |
| Warm Tooltip | One Radix provider shares 700ms warm state after the initial 450ms wait; soft entrance/exit | Toolbar and shared tooltip consumers |
| Bell Toggle | Short ring when opening the actual notifications popover | Persistent workspace toolbar |
| Status Mark | Pending ring and drawn result marks, bound to actual pending/success/error events | Shared loading buttons and notification results |

Additional application motion covers page entrances, active tab panels, table rows, activity timeline, loading skeletons, empty/error states, document shortcuts, dashboard metrics and button presses. All eight top-level destinations share the same layer. The invoice and contract editors retain their existing branded custom selects/calendars and motion; their scrollbars are now also 4px and brand tinted.

The sidebar uses its existing analytical spring at 0.48 simulation speed, so the whole fold takes about twice as long while keeping velocity during reversals and drag release. Reduced motion settles immediately. The browser test records its trajectory instead of relying on a CSS duration.

Scroll regions use 4px Chromium/Safari bars with a transparent track and brand thumb; Firefox uses `thin`. Platform overlay scrollbars can remain controlled by the OS. Forced colors uses system scrollbar colors.

## Verification scope

The dedicated browser suite checks every navigation destination and settings section, all client/project detail tabs, keyboard select operation, moving highlights, checkbox/switch state, pause/dismiss/swipe notifications, reduced motion and forced colors. It uses the project's documented mock backend and does not modify production business records. Existing studio tests check both full-page editors, responsive widths, file exports and anonymous access denial. Source scans identify controls for inspection and do not establish accessibility conformance.

The complete third-party notice is also served with the deployed application at /licenses/react-bits.txt.

Verified on 25 October 2026: lint, type checking, 33 unit tests, production build, and the targeted desktop/mobile browser suites. The route/tab pass includes 320px phone width. Mobile-only table and project-member overflow findings were corrected. Browser screenshots were inspected after animations settled.
