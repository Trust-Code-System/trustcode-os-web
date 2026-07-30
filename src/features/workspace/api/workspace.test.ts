import { describe, expect, it } from "vitest";

import { addProjectMember, completeMilestone, createMilestone, createProject, deleteMilestone, listActivity, listMilestones, listProjectMembers, listProjects, removeProjectMember, setProjectArchived, updateProject, updateProjectMemberRole } from "./workspace";

describe("Workspace service", () => {
  it("loads the paginated company activity feed with backend filters", async () => {
    const result = await listActivity({ entityType: "CLIENT", page: 1, pageSize: 5 });

    expect(result.data).toHaveLength(5);
    expect(result.data.every((item) => item.entityType === "CLIENT")).toBe(true);
    expect(result.meta).toMatchObject({ page: 1, pageSize: 5, total: 12 });
  });

  it("supports the project create, edit, archive, and restore flow", async () => {
    const project = await createProject({ name: "Website refresh", clientId: "northstar-logistics" });
    const updated = await updateProject(project.id, { name: "Website relaunch", priority: "HIGH" });
    const archived = await setProjectArchived(project.id, true);
    const archivedProjects = await listProjects({ archived: true });

    expect(updated).toMatchObject({ name: "Website relaunch", priority: "HIGH" });
    expect(archived.archivedAt).not.toBeNull();
    expect(archivedProjects.some((item) => item.id === project.id)).toBe(true);

    const restored = await setProjectArchived(project.id, false);
    expect(restored.archivedAt).toBeNull();
  });

  it("supports project milestones and team membership", async () => {
    const project = await createProject({ name: "Client portal", clientId: "northstar-logistics" });
    const milestone = await createMilestone(project.id, { title: "Design approval" });
    await completeMilestone(project.id, milestone.id);
    await addProjectMember(project.id, "user_member", "MEMBER");
    await updateProjectMemberRole(project.id, "user_member", "LEAD");

    const milestones = await listMilestones(project.id);
    const members = await listProjectMembers(project.id);
    expect(milestones).toMatchObject([{ id: milestone.id, status: "COMPLETED" }]);
    expect(members.some((member) => member.userId === "user_member" && member.role === "LEAD")).toBe(true);

    await deleteMilestone(project.id, milestone.id);
    await removeProjectMember(project.id, "user_member");
    expect(await listMilestones(project.id)).toHaveLength(0);
    expect((await listProjectMembers(project.id)).some((member) => member.userId === "user_member")).toBe(false);
  });
});
