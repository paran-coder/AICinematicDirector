import { NextResponse } from "next/server";
import { submitShotGeneration } from "@/server/generation-service";
import type { ShotDirectionDraft } from "@/domain/workspace/types";

const keys: Array<keyof ShotDirectionDraft> = ["action", "expression", "gaze", "shotSize", "cameraMovement", "angle", "lens", "focus", "shake", "baseLight", "fillLight", "timeOfDay", "weather"];

function isDraft(value: unknown): value is ShotDirectionDraft {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return keys.every((key) => typeof record[key] === "string");
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { projectId?: string; shotId?: string; draft?: unknown; aspectRatio?: unknown };
    if (!body?.projectId || !body?.shotId) return NextResponse.json({ error: "projectId and shotId are required" }, { status: 400 });
    if (body.draft !== undefined && !isDraft(body.draft)) return NextResponse.json({ error: "Invalid shot draft" }, { status: 400 });
    if (body.aspectRatio !== undefined && typeof body.aspectRatio !== "string") return NextResponse.json({ error: "Invalid aspect ratio" }, { status: 400 });
    const result = await submitShotGeneration(body.projectId, body.shotId, {
      draft: body.draft,
      aspectRatio: body.aspectRatio as string | undefined,
    });
    return NextResponse.json({ id: result.id, status: result.status }, { status: 202 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Generation submission failed" }, { status: 500 });
  }
}
