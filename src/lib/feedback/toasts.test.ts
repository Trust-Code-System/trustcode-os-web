import { describe, expect, it } from "vitest";

import { showToast, subscribeToToasts } from "./toasts";

describe("toast events", () => {
  it("publishes success and error feedback to subscribers", () => {
    const received: string[] = [];
    const unsubscribe = subscribeToToasts((toast) => received.push(`${toast.tone}:${toast.title}`));

    showToast({ tone: "success", title: "Project created" });
    showToast({ tone: "error", title: "Action failed", message: "Try again" });
    unsubscribe();

    expect(received).toEqual(["success:Project created", "error:Action failed"]);
  });
});
