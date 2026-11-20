import { describe, expect, it } from "vitest";
import type { Project } from "./api/workspace";
import { projectBuckets, projectReportCsv, reportStart, withinReport } from "./dashboard-report";

const project = (values: Partial<Project> = {}): Project => ({ id: "one", name: "Website", description: null, clientId: "client", status: "COMPLETED", priority: "MEDIUM", createdAt: "2026-10-01T12:00:00Z", updatedAt: "2026-11-02T12:00:00Z", startDate: null, dueDate: null, completedAt: "2026-11-02T12:00:00Z", archivedAt: null, ...values });

describe("dashboard reporting", () => {
  it("groups creation and completion independently and includes the final reporting day", () => {
    const rows = [project(), project({ id: "two", createdAt: "2026-11-20T18:00:00Z", completedAt: null })];
    const end = new Date(2026, 10, 20, 10);
    const result = projectBuckets(rows, new Date(2026, 0, 1), end, "Monthly");
    expect(result.find((bucket) => bucket.label === "Oct")).toMatchObject({ started: 1, completed: 0 });
    expect(result.find((bucket) => bucket.label === "Nov")).toMatchObject({ started: 1, completed: 1 });
    expect(withinReport(rows[1]!.createdAt, new Date(2026, 0, 1), end)).toBe(true);
  });

  it("uses a 30-calendar-day window and excludes records before the boundary", () => {
    const end = new Date(2026, 10, 20, 10);
    const start = reportStart("30", end, []);
    expect(start).toEqual(new Date(2026, 9, 22));
    expect(withinReport(new Date(2026, 9, 21, 23, 59).toISOString(), start, end)).toBe(false);
    expect(withinReport(null, start, end)).toBe(false);
  });

  it("handles empty histories and limits daily charts without counting earlier data", () => {
    const end = new Date(2026, 10, 20, 10);
    expect(reportStart("all", end, [])).toEqual(new Date(2026, 10, 20));
    const buckets = projectBuckets([project()], new Date(2026, 0, 1), end, "Daily");
    expect(buckets).toHaveLength(14);
    expect(buckets.reduce((count, bucket) => count + bucket.started + bucket.completed, 0)).toBe(0);
  });

  it("escapes report text and prevents spreadsheet formulas in exported record names", () => {
    const csv = projectReportCsv([project({ name: '=HYPERLINK("bad")' })], () => 'Client, "Limited"');
    expect(csv).toContain('"\'=HYPERLINK(""bad"")"');
    expect(csv).toContain('"Client, ""Limited"""');
    expect(csv).toContain('"COMPLETED","MEDIUM"');
  });
});
