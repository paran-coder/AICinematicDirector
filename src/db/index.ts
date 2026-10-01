import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let client: ReturnType<typeof postgres> | undefined;
let database: PostgresJsDatabase<typeof schema> | undefined;

export function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim() || undefined;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(getDatabaseUrl());
}

export function getDb() {
  const url = getDatabaseUrl();
  if (!url) throw new Error("DATABASE_URL or POSTGRES_URL is not configured");
  if (!client) client = postgres(url, { max: 5, prepare: false });
  if (!database) database = drizzle(client, { schema });
  return database;
}

export async function closeDb(): Promise<void> {
  if (client) await client.end();
  client = undefined;
  database = undefined;
}
