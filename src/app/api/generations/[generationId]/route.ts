import { NextResponse } from "next/server";
import { cancelGeneration, getGenerationStatus } from "@/server/generation-service";

export async function GET(_request: Request, context: { params: Promise<{ generationId: string }> }) {
  const { generationId } = await context.params;
  return NextResponse.json(await getGenerationStatus(generationId));
}

export async function DELETE(_request: Request, context: { params: Promise<{ generationId: string }> }) {
  try {
    const { generationId } = await context.params;
    return NextResponse.json(await cancelGeneration(generationId));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Generation cancellation failed" }, { status: 500 });
  }
}
