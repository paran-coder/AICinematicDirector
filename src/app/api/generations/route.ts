import { NextResponse } from "next/server";
import { submitShotGeneration } from "@/server/generation-service";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { projectId?: string; shotId?: string };
    if (!body?.projectId || !body?.shotId) return NextResponse.json({ error: "projectId and shotId are required" }, { status: 400 });
    const result = await submitShotGeneration(body.projectId, body.shotId);
    return NextResponse.json({ id: result.id, status: result.status, persistence: result.persistence }, { status: 202 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Generation submission failed" }, { status: 500 });
  }
}
