export type ProjectFixture = { id: string; name: string; client: string; status: "Active" | "Planning" | "Delayed"; priority: "High" | "Medium"; progress: number; deadline: string };
export type MeetingFixture = { title: string; client: string; when: string; status: "Upcoming" | "Scheduled" };
export type DocumentFixture = { name: string; category: string; client: string; project: string; owner: string; date: string };
export type TeamFixture = { name: string; email: string; role: "Admin" | "Member"; projects: string; tasks: number; status: "Active" | "Pending" };

export const projects: ProjectFixture[] = [
  { id: "core-api-refactor", name: "Core API Refactor", client: "Acme Corp", status: "Active", priority: "High", progress: 75, deadline: "24 Oct 2026" },
  { id: "marketing-site", name: "Marketing Site Launch", client: "Global Tech", status: "Planning", priority: "Medium", progress: 20, deadline: "15 Nov 2026" },
  { id: "database-migration", name: "Database Migration", client: "Stark Industries", status: "Delayed", priority: "High", progress: 45, deadline: "10 Oct 2026" },
];

export const meetings: MeetingFixture[] = [
  { title: "Q3 Architecture Review", client: "Acme Corp · Project Phoenix", when: "24 Oct 2026 · 11:30", status: "Upcoming" },
  { title: "Sprint Planning", client: "Internal · TrustCode OS v2", when: "25 Oct 2026 · 14:00", status: "Scheduled" },
];

export const documents: DocumentFixture[] = [
  { name: "Q3_Financial_Report_Final.pdf", category: "Finance", client: "Acme Corp", project: "Q3 Campaign", owner: "Sarah J.", date: "12 Oct 2026" },
  { name: "Brand_Guidelines_v2.docx", category: "Design", client: "Globex", project: "Rebranding", owner: "Mike J.", date: "10 Oct 2026" },
  { name: "Hero_Banner_Draft.png", category: "Assets", client: "Initech", project: "Website Redesign", owner: "Anna L.", date: "8 Oct 2026" },
  { name: "Client_Contracts_2026", category: "Folder", client: "Internal", project: "Legal", owner: "System", date: "1 Oct 2026" },
];

export const team: TeamFixture[] = [
  { name: "Sarah Jenkins", email: "sarah@trustcode.io", role: "Admin", projects: "A · B · +3", tasks: 12, status: "Active" },
  { name: "Michael Chen", email: "m.chen@trustcode.io", role: "Member", projects: "Core API", tasks: 5, status: "Active" },
  { name: "Alex Johnson", email: "alex@trustcode.io", role: "Member", projects: "None assigned", tasks: 0, status: "Pending" },
];

export const activity = [
  { actor: "Sarah Jenkins", action: "completed the milestone Q3 Design Review", context: "Project Alpha Redesign", time: "2 hours ago" },
  { actor: "Marcus Johnson", action: "uploaded a new document", context: "Q3_Financial_Report.pdf", time: "5 hours ago" },
  { actor: "David Chen", action: "invited Elena Rodriguez to the workspace", context: "Team Engineering", time: "9 hours ago" },
  { actor: "Alex Thomas", action: "updated the project status", context: "Website Redesign · Under review", time: "Yesterday" },
] as const;
