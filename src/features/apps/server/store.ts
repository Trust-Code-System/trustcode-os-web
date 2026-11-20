import "server-only";

import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";
import type { Subscription } from "../subscriptions";

let pool: Pool | undefined;
function database() {
  if (!pool) {
    const connectionString = process.env.SUBSCRIPTIONS_DATABASE_URL;
    if (!connectionString) throw new Error("Subscriptions database is not configured");
    pool = new Pool({ connectionString, max: 2, connectionTimeoutMillis: 10_000, idleTimeoutMillis: 30_000, statement_timeout: 15_000 });
    attachDatabasePool(pool);
  }
  return pool;
}

function workspace() {
  const base = process.env.API_BASE_URL;
  if (!base) throw new Error("Workspace API is not configured");
  // Membership is verified against this same server-configured company API.
  // The browser cannot choose another company's workspace key.
  return new URL(base).origin;
}

type Snapshot = { revision: number; subscriptions: Subscription[] };

export async function readWorkspaceSubscriptions() {
  const result = await database().query<Snapshot>(
    "SELECT revision, subscriptions FROM trustcode_workspace_subscriptions WHERE workspace_id = $1",
    [workspace()],
  );
  return { version: 1 as const, ...(result.rows[0] ?? { revision: 0, subscriptions: [] }) };
}

export async function saveWorkspaceSubscriptions(revision: number, subscriptions: Subscription[]) {
  // Each write either updates the exact previous revision or creates revision 1.
  // Both CTEs are in one PostgreSQL statement, so parallel staff cannot overwrite
  // each other's changes or both initialize an empty workspace.
  const result = await database().query<Snapshot>(`
    WITH changed AS (
      UPDATE trustcode_workspace_subscriptions
      SET revision = revision + 1, subscriptions = $2::jsonb, updated_at = now()
      WHERE workspace_id = $1 AND revision = $3
      RETURNING revision, subscriptions
    ), initialized AS (
      INSERT INTO trustcode_workspace_subscriptions (workspace_id, revision, subscriptions)
      SELECT $1, 1, $2::jsonb WHERE $3 = 0 AND NOT EXISTS (SELECT 1 FROM changed)
      ON CONFLICT (workspace_id) DO NOTHING
      RETURNING revision, subscriptions
    )
    SELECT revision, subscriptions FROM changed
    UNION ALL SELECT revision, subscriptions FROM initialized
  `, [workspace(), JSON.stringify(subscriptions), revision]);
  const saved = result.rows[0];
  return saved ? { version: 1 as const, ...saved } : null;
}
