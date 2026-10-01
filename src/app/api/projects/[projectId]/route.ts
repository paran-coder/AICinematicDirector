import { NextResponse } from "next/server";
import { getProjectOverview, updateProjectOverview } from "@/data/project-repository";

export async function GET(_request: Request, context: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await context.params;
  return NextResponse.json(await getProjectOverview(projectId));
}

export async function PATCH(request: Request, context: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await context.params;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body.story !== "string" || typeof body.duration !== "number" || typeof body.aspectRatio !== "string" || typeof body.genre !== "string" || typeof body.visualDirection !== "string") {
    return NextResponse.json({ error: "Invalid project input" }, { status: 400 });
  }
  return NextResponse.json(await updateProjectOverview(projectId, { story: body.story, duration: body.duration, aspectRatio: body.aspectRatio, genre: body.genre, visualDirection: body.visualDirection }));
}
