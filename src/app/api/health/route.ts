import { NextResponse } from "next/server";
import { getVideoProviderName } from "@/providers/video";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      persistence: "indexeddb",
      persistenceScope: "current-browser",
      videoProvider: getVideoProviderName(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
