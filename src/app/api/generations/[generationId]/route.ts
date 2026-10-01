import { NextResponse } from "next/server";
import { cancelGeneration, getGenerationStatus, selectGenerationVersion } from "@/server/generation-service";

export async function GET(_request: Request, context: { params: Promise<{ generationId: string }> }) {
  const { generationId } = await context.params;
  return NextResponse.json(await getGenerationStatus(generationId));
}

export async function PATCH(request: Request, context: { params: Promise<{ generationId: string }> }) {
  try {
    const { generationId } = await context.params;
    const body = await request.json().catch(() => ({})) as { action?: string };
    if (body.action !== "select") return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    return NextResponse.json(await selectGenerationVersion(generationId));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Generation update failed" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ generationId: string }> }) {
  try {
    const { generationId } = await context.params;
    return NextResponse.json(await cancelGeneration(generationId));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Generation cancellation failed" }, { status: 500 });
  }
}
