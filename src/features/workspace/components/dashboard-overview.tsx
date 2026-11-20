"use client";

import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowDownToLine, ArrowUpRight, CalendarDays, CheckCircle2, CircleHelp, FileSignature, FolderKanban, Info, MoreHorizontal, Plus, ReceiptText, Search, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/data-display";
import { DropdownMenu } from "@/components/ui/overlays";
import { Select } from "@/components/ui/form-controls";
import { studioCatalog } from "@/features/studios/catalog";
import { projectStatuses, type ClientOption, type Meeting, type Project } from "../api/workspace";
import { projectBuckets, projectReportCsv, reportStart, withinReport, type ReportInterval, type ReportRange } from "../dashboard-report";
import { DashboardGreeting } from "./dashboard-greeting";

const statusNames = { PLANNING: "Planning", IN_PROGRESS: "In progress", ON_HOLD: "On hold", COMPLETED: "Completed" };
const statusTones = { PLANNING: "neutral", IN_PROGRESS: "info", ON_HOLD: "warning", COMPLETED: "success" } as const;

export function DashboardOverview({ clients, projects, meetings }: { clients: ClientOption[]; projects: Project[]; meetings: Meeting[] }) {
  const [range, setRange] = useState<ReportRange>("year");
  const [interval, setInterval] = useState<ReportInterval>("Monthly");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  const [now] = useState(() => new Date());
  const start = reportStart(range, now, projects);
  const filtered = projects.filter((project) => withinReport(project.createdAt, start, now));
  const buckets = projectBuckets(projects, start, now, interval);
  const completed = projects.filter((project) => withinReport(project.completedAt, start, now));
  const inProgress = filtered.filter((project) => project.status === "IN_PROGRESS").length;
  const clientName = (id: string) => clients.find((client) => client.id === id)?.name ?? "Unknown client";
  const rows = [...filtered].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).filter((project) => `${project.name} ${clientName(project.clientId)} ${statusNames[project.status]}`.toLowerCase().includes(search.toLowerCase()));
  const rowIds = rows.slice(0, 6).map((project) => project.id);
  const allSelected = rowIds.length > 0 && rowIds.every((id) => selected.includes(id));
  const selectedRows = rows.filter((project) => selected.includes(project.id));
  const statusCounts = projectStatuses.map((status, index) => ({ status, count: filtered.filter((project) => project.status === status).length, color: `var(--report-series-${index + 1})` }));
  const clientCounts = clients.map((client) => ({ ...client, count: filtered.filter((project) => project.clientId === client.id).length })).filter((client) => client.count > 0).sort((a, b) => b.count - a.count).slice(0, 6);
  const maximum = Math.max(4, Math.ceil(Math.max(0, ...buckets.map((bucket) => Math.max(bucket.started, bucket.completed))) / 4) * 4);
  const chartHeight = 178;
  const chartWidth = 660;
  const plotWidth = 604;
  const step = plotWidth / Math.max(buckets.length, 1);
  const barWidth = Math.min(16, step * .3);
  const activeBucket = hovered === null ? null : buckets[hovered];

  const metrics = [
    { label: "Total clients", value: clients.filter((client) => client.status === "ACTIVE").length, hint: "Active client relationships", href: "/clients", Icon: UsersRound, bars: [] },
    { label: "Total projects", value: filtered.length, hint: `${inProgress} currently in progress`, href: "/projects", Icon: FolderKanban, bars: buckets.map((bucket) => bucket.started) },
    { label: "Completed projects", value: completed.length, hint: "Delivered in this period", href: "/projects", Icon: CheckCircle2, bars: buckets.map((bucket) => bucket.completed) },
    { label: "Upcoming meetings", value: meetings.length, hint: "On your team’s schedule", href: "/meetings", Icon: CalendarDays, bars: [] },
  ];
  function downloadReport() {
    const url = URL.createObjectURL(new Blob([projectReportCsv(selectedRows.length ? selectedRows : rows, clientName)], { type: "text/csv;charset=utf-8;" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `trustcode-project-report-${format(now, "yyyy-MM-dd")}.csv`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <div className="report-dashboard">
    <div className="report-page-heading">
      <div><DashboardGreeting variant="report" /><p>Here’s what’s happening with your workspace today.</p></div>
      <div className="report-actions">
        <div className="report-range"><Select className="report-period-select" aria-label="Reporting period" value={range} onValueChange={(value) => { setRange(value as ReportRange); setSelected([]); setHovered(null); }}><option value="year">This year</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="all">All time</option></Select></div>
        <span className="report-date"><CalendarDays aria-hidden size={15} />{format(start, "MMM d")} – {format(now, "MMM d, yyyy")}</span>
        <button className="report-button is-primary" onClick={downloadReport}><ArrowDownToLine aria-hidden size={15} />Download report</button>
      </div>
    </div>

    <div className="report-metrics">{metrics.map(({ label, value, hint, href, Icon, bars }) => <Link className="report-metric" href={href} key={label}>
      <div className="report-metric-body"><span className="report-label">{label}</span><strong>{value.toLocaleString()}</strong><span className="report-mini-chart" aria-hidden>{bars.length ? bars.map((count, index) => <i key={index} style={{ height: `${Math.max(3, count / Math.max(1, ...bars) * 36)}px` }} />) : <Icon size={30} strokeWidth={1.2} />}</span></div>
      <div className="report-metric-foot"><Info aria-hidden size={12} /><span>{hint}</span><ArrowUpRight aria-hidden size={12} /></div>
    </Link>)}</div>

    <div className="report-chart-grid">
      <section className="report-panel report-activity" aria-labelledby="report-activity-title">
        <div className="report-panel-title"><h2 id="report-activity-title">Project overview</h2><Info aria-hidden size={13} /><Link href="/activity" className="report-more" aria-label="View workspace activity"><MoreHorizontal size={17} /></Link></div>
        <div className="report-chart-summary"><div><span>Total projects</span><strong>{filtered.length.toLocaleString()}</strong></div><div className="report-chart-legend"><span><i className="is-light" />Created</span><span><i />Completed</span></div><div className="report-chart-tabs" role="group" aria-label="Chart interval">{(["Daily", "Weekly", "Monthly"] as const).map((value) => <button key={value} aria-pressed={interval === value} onClick={() => { setInterval(value); setHovered(null); }}>{value}</button>)}</div></div>
        <div className="report-chart" onMouseLeave={() => setHovered(null)}>
          <svg viewBox={`0 0 ${chartWidth} 224`} role="group" aria-labelledby="project-chart-title project-chart-desc">
            <title id="project-chart-title">Projects created and completed by {interval === "Monthly" ? "month" : interval === "Weekly" ? "week" : "day"}</title><desc id="project-chart-desc">{buckets.map((bucket) => `${bucket.date}: ${bucket.started} created, ${bucket.completed} completed`).join("; ")}</desc>
            <defs><pattern id="report-grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="var(--border)" strokeWidth=".45" /></pattern></defs>
            <rect x="38" y="8" width={plotWidth} height={chartHeight} fill="var(--surface-hover)" fillOpacity=".36" /><rect x="38" y="8" width={plotWidth} height={chartHeight} fill="url(#report-grid)" />
            {[0, 1, 2, 3, 4].map((tick) => <g key={tick}><line x1="38" x2="642" y1={8 + tick * chartHeight / 4} y2={8 + tick * chartHeight / 4} stroke="var(--border)" strokeWidth=".7" /><text x="27" y={12 + tick * chartHeight / 4} textAnchor="end" className="report-axis">{Math.ceil(maximum * (4 - tick) / 4)}</text></g>)}
            {buckets.map((bucket, index) => { const x = 38 + step * index + step / 2; return <g key={bucket.date}>
              <rect x={x - barWidth - 1} y={8 + chartHeight - bucket.started / maximum * chartHeight} width={barWidth} height={bucket.started / maximum * chartHeight} fill="var(--report-series-3)" rx="1" />
              <rect x={x + 1} y={8 + chartHeight - bucket.completed / maximum * chartHeight} width={barWidth} height={bucket.completed / maximum * chartHeight} fill="var(--brand)" rx="1" />
              <rect x={38 + step * index} y="8" width={step} height={chartHeight} fill="transparent" tabIndex={0} role="button" aria-label={`${bucket.date}: ${bucket.started} created, ${bucket.completed} completed`} onMouseEnter={() => setHovered(index)} onFocus={() => setHovered(index)} onBlur={() => setHovered(null)} onClick={() => setHovered(index)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setHovered(index); } }} />
              <text x={x} y="210" textAnchor="middle" className="report-axis">{bucket.label}</text>
            </g>; })}
            {hovered !== null && <line x1={38 + step * hovered + step / 2} x2={38 + step * hovered + step / 2} y1="8" y2="186" stroke="var(--text-muted)" strokeDasharray="3 3" pointerEvents="none" />}
          </svg>
          {activeBucket && <div className="report-chart-tooltip" role="status" style={{ left: `${Math.min(72, Math.max(9, 6 + (hovered ?? 0) / Math.max(1, buckets.length) * 90))}%` }}><strong>{activeBucket.date}</strong><span><i className="is-light" />Created <b>{activeBucket.started}</b></span><span><i />Completed <b>{activeBucket.completed}</b></span></div>}
        </div>
        <div className="report-chart-caption">{buckets[0]?.date} – {format(now, "d MMM yyyy")}<span>{filtered.length ? "Project creation and delivery activity" : "No project activity in this period"}</span></div>
      </section>

      <div className="report-side-panels">
        <section className="report-panel" aria-labelledby="report-status-title"><div className="report-panel-title"><h2 id="report-status-title">Projects by status</h2><Info aria-hidden size={13} /><span className="report-panel-period">{range === "year" ? format(now, "yyyy") : range === "all" ? "All time" : `${range} days`}</span></div>
          <div className="report-status-body"><svg viewBox="0 0 140 140" className="report-donut" role="img" aria-label={`${filtered.length} total projects. ${statusCounts.map(({ status, count }) => `${statusNames[status]}: ${count}`).join(". ")}`}><circle cx="70" cy="70" r="53" fill="none" stroke="var(--surface-hover)" strokeWidth="19" />{statusCounts.map(({ status, count, color }, index) => { const portion = filtered.length ? count / filtered.length * 100 : 0; const initial = filtered.length ? statusCounts.slice(0, index).reduce((total, item) => total + item.count, 0) / filtered.length * 100 : 0; return <circle key={status} cx="70" cy="70" r="53" fill="none" stroke={color} strokeWidth="19" pathLength="100" strokeDasharray={`${portion} ${100 - portion}`} strokeDashoffset={-initial} transform="rotate(-90 70 70)" />; })}<text x="70" y="69" textAnchor="middle" className="report-donut-value">{filtered.length}</text><text x="70" y="86" textAnchor="middle" className="report-donut-label">Total projects</text></svg>
            <ul className="report-status-legend">{statusCounts.map(({ status, count, color }) => <li key={status}><span><i style={{ background: color }} />{statusNames[status]}</span><b>{count}</b><small>{filtered.length ? (count / filtered.length * 100).toFixed(1) : "0"}%</small></li>)}</ul>
          </div>
        </section>
        <section className="report-panel report-clients" aria-labelledby="report-clients-title"><div className="report-panel-title"><h2 id="report-clients-title">Projects by client</h2><Link href="/clients" className="report-more" aria-label="View all clients"><ArrowUpRight size={15} /></Link></div>
          <div className="report-client-bars">{clientCounts.length ? clientCounts.map((client) => <div className="report-client-bar" key={client.id}><span title={client.name}>{client.name}</span><span className="report-bar-track"><i style={{ width: `${client.count / Math.max(1, filtered.length) * 100}%` }} /></span><small>{Math.round(client.count / Math.max(1, filtered.length) * 100)}%</small></div>) : <p className="report-small-empty">Your client project breakdown will appear here.</p>}</div>
        </section>
      </div>
    </div>

    <section className="report-panel report-projects" aria-labelledby="report-projects-title"><div className="report-panel-title"><h2 id="report-projects-title">Recent projects</h2><Info aria-hidden size={13} />{selectedRows.length > 0 && <span className="report-selection">{selectedRows.length} selected</span>}<label className="report-table-search"><Search aria-hidden size={15} /><input aria-label="Search projects" placeholder="Search projects..." value={search} onChange={(event) => setSearch(event.target.value)} /></label><Link href="/projects/new" className="report-button"><Plus aria-hidden size={14} />Create project</Link><DropdownMenu label="Project table options" trigger={<button className="report-more" aria-label="Project table options"><MoreHorizontal size={17} /></button>} items={[{ label: selectedRows.length ? "Download selected projects" : "Download filtered projects", onSelect: downloadReport }, { label: "View all projects", href: "/projects" }]} /></div>
      <div className="report-table-scroll"><table className="report-table"><thead><tr><th className="report-checkbox-cell"><input type="checkbox" aria-label="Select all visible projects" checked={allSelected} onChange={() => setSelected(allSelected ? selected.filter((id) => !rowIds.includes(id)) : [...new Set([...selected, ...rowIds])])} /></th><th>Project</th><th>Client</th><th>Priority</th><th>Status</th><th>Due date</th><th className="report-table-action">Actions</th></tr></thead><tbody>{rows.slice(0, 6).map((project) => <tr key={project.id} data-selected={selected.includes(project.id)}><td><input type="checkbox" aria-label={`Select ${project.name}`} checked={selected.includes(project.id)} onChange={() => setSelected(selected.includes(project.id) ? selected.filter((id) => id !== project.id) : [...selected, project.id])} /></td><td><Link className="report-project-name" href={`/projects/${project.id}`}>{project.name}</Link></td><td>{clientName(project.clientId)}</td><td>{project.priority.charAt(0) + project.priority.slice(1).toLowerCase()}</td><td><Badge tone={statusTones[project.status]}><span className="report-badge-dot" />{statusNames[project.status]}</Badge></td><td>{project.dueDate ? format(new Date(project.dueDate), "MMM d, yyyy") : "Not set"}</td><td className="report-table-action"><DropdownMenu label={`Actions for ${project.name}`} trigger={<button className="report-row-menu" aria-label={`Actions for ${project.name}`}><MoreHorizontal size={16} /></button>} items={[{ label: "View project", href: `/projects/${project.id}` }, { label: "Edit project", href: `/projects/${project.id}/edit` }]} /></td></tr>)}</tbody></table>{!rows.length && <div className="report-table-empty"><FolderKanban size={24} strokeWidth={1.3} /><strong>{search ? "No matching projects" : "No projects in this period"}</strong><span>{search ? "Try a different project or client name." : "Choose another period or create your first project."}</span></div>}</div>
      <div className="report-table-footer"><span>Showing {Math.min(rows.length, 6)} of {rows.length} projects</span><Link href="/projects">View all projects <ArrowUpRight size={12} /></Link></div>
    </section>

    <div className="report-workspace-links"><Link href="/meetings"><CalendarDays aria-hidden size={14} />{meetings.length} upcoming meetings<ArrowUpRight size={12} /></Link><a href={studioCatalog.invoice.href}><ReceiptText aria-hidden size={14} />Invoice studio<ArrowUpRight size={12} /></a><a href={studioCatalog.contract.href}><FileSignature aria-hidden size={14} />Contract studio<ArrowUpRight size={12} /></a><a href="mailto:hello@trustcodesystem.tech"><CircleHelp aria-hidden size={14} />Help & support</a></div>
  </div>;
}
