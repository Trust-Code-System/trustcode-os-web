import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/form-controls";

export const metadata: Metadata = { title: "Notification settings" };

const unavailable =
  "This action will be enabled when its backend contract is implemented.";

const preferences = [
  {
    id: "product-updates",
    label: "Product updates",
    description: "Announcements about new TrustCode features and improvements.",
  },
  {
    id: "project-activity",
    label: "Project activity",
    description:
      "Alerts when tasks, milestones, or documents change on your projects.",
  },
  {
    id: "meeting-reminders",
    label: "Meeting reminders",
    description:
      "Email reminders before scheduled client and internal meetings.",
  },
  {
    id: "security-alerts",
    label: "Security alerts",
    description:
      "Immediate notices for password changes and unusual sign-in activity.",
    defaultChecked: true,
  },
] as const;

export default function NotificationsSettingsPage() {
  return (
    <section className="rounded-[var(--radius-lg)] border bg-surface p-5 md:p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-text-primary">
          Notifications
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Control which workspace alerts reach your inbox.
        </p>
      </div>
      <ul className="grid gap-3">
        {preferences.map((preference) => (
          <li
            key={preference.id}
            className="rounded-[var(--radius-md)] border border-border px-3 py-3"
          >
            <Checkbox
              id={preference.id}
              disabled
              title={unavailable}
              defaultChecked={"defaultChecked" in preference}
              label={
                <span className="grid gap-0.5">
                  <span className="font-medium text-text-primary">
                    {preference.label}
                  </span>
                  <span className="text-sm font-normal text-text-secondary">
                    {preference.description}
                  </span>
                </span>
              }
            />
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-text-muted">{unavailable}</p>
      <Button className="mt-5 sm:ml-auto sm:flex" disabled title={unavailable}>
        Save notification preferences
      </Button>
    </section>
  );
}
