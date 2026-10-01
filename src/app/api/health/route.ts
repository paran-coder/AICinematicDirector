import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb, isDatabaseConfigured } from "@/db";
import { getVideoProviderName } from "@/providers/video";

export const dynamic = "force-dynamic";

export async function GET() {
  const databaseConfigured = isDatabaseConfigured();
  let database: "connected" | "not_configured" | "error" = databaseConfigured ? "error" : "not_configured";

  if (databaseConfigured) {
    try {
      await getDb().execute(sql`select 1 as ok`);
      database = "connected";
    } catch {
      database = "error";
    }
  }

  return NextResponse.json(
    {
      ok: database !== "error",
      database,
      videoProvider: getVideoProviderName(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
