import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/mocks/server";
import { getClient, listClients } from "./clients";

describe("Client CRM service", () => {
  it("uses the network boundary for search and pagination", async () => {
    const result = await listClients({ q: "Northstar", status: "", pipeline: "", sort: "name-asc", page: 1, pageSize: 8 });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.name).toBe("Northstar Logistics");
    expect(result.meta.total).toBe(1);
  });

  it("parses the detail aggregate", async () => {
    const client = await getClient("northstar-logistics");
    expect(client.contacts.some((contact) => contact.isPrimary)).toBe(true);
    expect(client.activity.length).toBeGreaterThan(0);
  });

  it("preserves a safe not-found error", async () => {
    server.use(http.get("*/api/backend/clients/missing", () => HttpResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Client not found." } }, { status: 404 })));
    await expect(getClient("missing")).rejects.toMatchObject({ status: 404, code: "NOT_FOUND", message: "Client not found." });
  });
});
