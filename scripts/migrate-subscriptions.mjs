import { readFile } from "node:fs/promises";
import pg from "pg";

if (!process.env.SUBSCRIPTIONS_DATABASE_URL) throw new Error("SUBSCRIPTIONS_DATABASE_URL is required");
const client = new pg.Client({ connectionString: process.env.SUBSCRIPTIONS_DATABASE_URL });
try {
  await client.connect();
  await client.query(await readFile(new URL("../migrations/subscriptions/001_workspace_subscriptions.sql", import.meta.url), "utf8"));
  console.log("Shared subscriptions schema is ready.");
} finally {
  await client.end();
}
