import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/mocks/server";
import { getClient, listClients } from "./clients";

describe("Client CRM service", () => {
  it("uses the network boundary for backend filters and pagination", async () => {
    const result = await listClients({ status: "ACTIVE", stage: "LEAD", page: 1, pageSize: 20 });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0]?.name).toBe("Northstar Logistics");
    expect(result.meta.total).toBe(result.items.length);
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
