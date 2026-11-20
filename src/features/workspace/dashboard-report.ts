import { addDays, addMonths, addWeeks, endOfDay, format, startOfDay, startOfMonth, startOfWeek, subDays, subMonths, subWeeks } from "date-fns";
import type { Project } from "./api/workspace";

export type ReportRange = "year" | "90" | "30" | "all";
export type ReportInterval = "Daily" | "Weekly" | "Monthly";

export function reportStart(range: ReportRange, now: Date, projects: Project[]) {
  if (range === "30") return startOfDay(subDays(now, 29));
  if (range === "90") return startOfDay(subDays(now, 89));
  if (range === "year") return new Date(now.getFullYear(), 0, 1);
  const dates = projects.flatMap((project) => [project.createdAt, project.completedAt].filter((value): value is string => Boolean(value))).map((value) => new Date(value).getTime()).filter(Number.isFinite);
  return startOfDay(new Date(Math.min(now.getTime(), ...dates)));
}

export function withinReport(value: string | null, start: Date, end: Date) {
  if (!value) return false;
  const date = new Date(value).getTime();
  return date >= start.getTime() && date <= endOfDay(end).getTime();
}

export function projectBuckets(projects: Project[], start: Date, end: Date, interval: ReportInterval) {
  const floor = interval === "Monthly" ? startOfMonth : interval === "Weekly" ? (date: Date) => startOfWeek(date, { weekStartsOn: 1 }) : startOfDay;
  const advance = interval === "Monthly" ? addMonths : interval === "Weekly" ? addWeeks : addDays;
  const back = interval === "Monthly" ? subMonths : interval === "Weekly" ? subWeeks : subDays;
  // Keep long histories readable, with the displayed range disclosed in the chart.
  const first = new Date(Math.max(floor(start).getTime(), back(floor(end), interval === "Monthly" ? 11 : interval === "Weekly" ? 11 : 13).getTime()));
  const result = [];
  for (let date = first; date <= end; date = advance(date, 1)) {
    const next = advance(date, 1);
    const inBucket = (value: string | null) => value && withinReport(value, start, end) && new Date(value) >= date && new Date(value) < next;
    result.push({
      label: format(date, interval === "Monthly" ? "MMM" : "d MMM"),
      date: format(date, "d MMM yyyy"),
      started: projects.filter((project) => inBucket(project.createdAt)).length,
      completed: projects.filter((project) => inBucket(project.completedAt)).length,
    });
  }
  return result;
}

export function projectReportCsv(projects: Project[], clientName: (id: string) => string) {
  const cell = (value: string) => `"${(/^[=+@\-\t\r]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`;
  const rows = [["Project", "Client", "Status", "Priority", "Created", "Due date"], ...projects.map((project) => [project.name, clientName(project.clientId), project.status, project.priority, project.createdAt, project.dueDate ?? ""])];
  return "\uFEFF" + rows.map((row) => row.map(cell).join(",")).join("\r\n");
}
