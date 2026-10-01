import { NextResponse } from "next/server";
import { getShotWorkspace, updateShotDraft } from "@/data/project-repository";
import type { ShotDirectionDraft } from "@/domain/workspace/types";

const keys: Array<keyof ShotDirectionDraft> = ["action", "expression", "gaze", "shotSize", "cameraMovement", "angle", "lens", "focus", "shake", "baseLight", "fillLight", "timeOfDay", "weather"];

function isDraft(value: unknown): value is ShotDirectionDraft {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return keys.every((key) => typeof record[key] === "string");
}

export async function GET(_request: Request, context: { params: Promise<{ projectId: string; shotId: string }> }) {
  const { projectId, shotId } = await context.params;
  return NextResponse.json(await getShotWorkspace(projectId, shotId));
}

export async function PATCH(request: Request, context: { params: Promise<{ projectId: string; shotId: string }> }) {
  const { projectId, shotId } = await context.params;
  const body = await request.json().catch(() => null) as { draft?: unknown; rawOverrides?: unknown } | null;
  if (!body || !isDraft(body.draft)) return NextResponse.json({ error: "Invalid shot draft" }, { status: 400 });
  const rawOverrides = body.rawOverrides && typeof body.rawOverrides === "object" && !Array.isArray(body.rawOverrides) ? body.rawOverrides as Record<string, unknown> : {};
  const result = await updateShotDraft(projectId, shotId, body.draft, rawOverrides);
  return NextResponse.json(result);
}
