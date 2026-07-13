import { http, HttpResponse } from "msw";
import { clients } from "./data/clients";

const delayed = async () => new Promise((resolve) => setTimeout(resolve, process.env.NODE_ENV === "test" ? 0 : 450));

export const handlers = [
  http.get("*/api/backend/clients", async ({ request }) => {
    await delayed();
    const scenario = request.headers.get("x-mock-scenario") ?? "success";
    if (scenario === "error") return HttpResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Clients could not be loaded." } }, { status: 500 });
    if (scenario === "forbidden") return HttpResponse.json({ ok: false, error: { code: "FORBIDDEN", message: "You do not have access to clients." } }, { status: 403 });
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") ?? "").toLowerCase();
    const status = url.searchParams.get("status");
    const pipeline = url.searchParams.get("pipeline");
    const sort = url.searchParams.get("sort") ?? "updated-desc";
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? 8)));
    let rows = scenario === "empty" ? [] : clients.filter((client) => (!q || `${client.name} ${client.primaryEmail} ${client.industry}`.toLowerCase().includes(q)) && (!status || client.status === status) && (!pipeline || client.pipelineStage === pipeline));
    rows = [...rows].sort((a, b) => sort === "name-asc" ? a.name.localeCompare(b.name) : sort === "created-desc" ? b.createdAt.localeCompare(a.createdAt) : b.updatedAt.localeCompare(a.updatedAt));
    const total = rows.length;
    const data = rows.slice((page - 1) * pageSize, page * pageSize).map((client) => ({ id: client.id, name: client.name, industry: client.industry, primaryEmail: client.primaryEmail, phone: client.phone, status: client.status, pipelineStage: client.pipelineStage, owner: client.owner, createdAt: client.createdAt, updatedAt: client.updatedAt }));
    return HttpResponse.json({ ok: true, data, meta: { page, pageSize, total } });
  }),
  http.get("*/api/backend/clients/:clientId", async ({ params, request }) => {
    await delayed();
    const scenario = request.headers.get("x-mock-scenario") ?? "success";
    if (scenario === "error") return HttpResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Client details could not be loaded." } }, { status: 500 });
    if (scenario === "not-found") return HttpResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Client not found." } }, { status: 404 });
    const client = clients.find((item) => item.id === params.clientId);
    return client ? HttpResponse.json({ ok: true, data: client }) : HttpResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Client not found." } }, { status: 404 });
  }),
];
