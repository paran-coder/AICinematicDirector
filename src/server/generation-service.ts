import { asc, desc, eq, inArray } from "drizzle-orm";
import { compileSeedancePrompt } from "@/domain/prompt/seedance-compiler";
import { getShotWorkspace } from "@/data/project-repository";
import { getDb, isDatabaseConfigured } from "@/db";
import { generationAssets, generations, scenes, shots } from "@/db/schema";
import { getVideoProvider, getVideoProviderName } from "@/providers/video";
import type { ProviderControl } from "@/providers/video/provider";
import { resolveDemoProjectId, routeForDemoShotId } from "@/test/fixtures/ids";

function stringsFromObject(input: Record<string, unknown>, prefix = ""): string[] {
  const output: string[] = [];
  for (const [key, value] of Object.entries(input)) {
    const name = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) output.push(...stringsFromObject(value as Record<string, unknown>, name));
    else if (Array.isArray(value)) output.push(`${name}: ${value.join(", ")}`);
    else if (value !== undefined && value !== null) output.push(`${name}: ${String(value)}`);
  }
  return output;
}

function compileWorkspacePrompt(workspace: Awaited<ReturnType<typeof getShotWorkspace>>): string {
  const draft = workspace.shot.draft;
  const resolved = workspace.consistency.resolvedCharacter;
  const state = workspace.character.sceneStates.flatMap((item) => Object.values(item.changes).map(String));
  return compileSeedancePrompt({
    character: {
      name: workspace.character.name,
      identity: stringsFromObject(resolved).filter((item) => item.startsWith("identity.") || item.startsWith("hair.") || item.startsWith("body.") || item.startsWith("distinctive_features")),
      currentState: state,
      action: draft.action,
      expression: draft.expression,
      gaze: draft.gaze,
    },
    location: { name: workspace.location.name, description: stringsFromObject(workspace.location.canon) },
    props: workspace.props.map((item) => ({ name: item.name, description: stringsFromObject(item.canon), state: item.state ? stringsFromObject(item.state) : undefined })),
    style: workspace.style,
    shot: {
      firstFrame: `Use the supplied first frame as the exact visual starting point for ${workspace.character.name}.`,
      shotSize: draft.shotSize,
      cameraMovement: draft.cameraMovement,
      angle: draft.angle,
      lens: draft.lens,
      focus: draft.focus,
      physics: [draft.weather, draft.shake === "없음" ? "stable camera" : `camera shake ${draft.shake}`],
      lighting: [draft.baseLight, draft.fillLight, draft.timeOfDay],
      audio: [draft.weather.includes("비") ? "rain ambience" : "natural room tone"],
    },
  });
}

export async function submitShotGeneration(projectId: string, shotId: string) {
  const workspace = await getShotWorkspace(projectId, shotId);
  const prompt = compileWorkspacePrompt(workspace);
  const provider = getVideoProvider();
  const submit = await provider.submit({
    prompt,
    durationSeconds: workspace.shot.duration,
    aspectRatio: workspace.project.aspectRatio,
    firstFrameUrl: workspace.shot.firstFrameUrl,
    resolution: "720p",
    generateAudio: true,
  });

  if (!isDatabaseConfigured()) return { id: submit.jobId, providerJobId: submit.jobId, status: "queued" as const, prompt, persistence: "fixture" as const };

  const db = getDb();
  const [row] = await db.insert(generations).values({
    shotId: workspace.shot.id,
    provider: getVideoProviderName(),
    status: "queued",
    providerJobId: submit.jobId,
    resolvedSnapshot: {
      character: workspace.consistency.resolvedCharacter,
      location: workspace.location,
      props: workspace.props,
      style: workspace.style,
      shot: workspace.shot.draft,
    },
    compiledPrompt: prompt,
    settings: { resolution: "720p", aspectRatio: workspace.project.aspectRatio, durationSeconds: workspace.shot.duration, generateAudio: true, providerControl: submit.control ?? {} },
  }).returning({ id: generations.id });
  return { id: row.id, providerJobId: submit.jobId, status: "queued" as const, prompt, persistence: "database" as const };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getGenerationStatus(id: string) {
  if (!isDatabaseConfigured() || !UUID_RE.test(id)) return getVideoProvider().getStatus(id);
  const db = getDb();
  const [row] = await db.select().from(generations).where(eq(generations.id, id)).limit(1);
  if (!row) return { status: "error" as const, error: { message: "Generation not found" } };
  if (!row.providerJobId) return { status: "error" as const, error: { message: "Provider job id missing" } };
  if (["success", "error", "cancelled"].includes(row.status)) {
    const [asset] = row.status === "success" ? await db.select().from(generationAssets).where(eq(generationAssets.generationId, row.id)).limit(1) : [];
    return { status: row.status, progress: row.status === "success" ? 100 : undefined, outputUrl: asset?.url, error: row.error as { message: string } | undefined };
  }

  const settings = (row.settings ?? {}) as Record<string, unknown>;
  const providerControl = ((settings.providerControl ?? {}) as ProviderControl);
  const provider = getVideoProvider(row.provider);
  const result = await provider.getStatus(row.providerJobId, providerControl);
  await db.update(generations).set({ status: result.status, error: result.error ?? null, updatedAt: new Date() }).where(eq(generations.id, row.id));
  if (result.status === "success" && result.outputUrl) {
    const existing = await db.select({ id: generationAssets.id }).from(generationAssets).where(eq(generationAssets.generationId, row.id)).limit(1);
    if (!existing.length) await db.insert(generationAssets).values({ generationId: row.id, kind: "video", url: result.outputUrl, mimeType: "video/mp4", durationSeconds: String(settings.durationSeconds ?? "8"), metadata: { thumbnailUrl: result.thumbnailUrl } });
  }
  return result;
}

export type GenerationViewItem = { id: string; shotId: string; shotRouteId: string; shotTitle: string; shotOrder: number; status: string; version: number; selected: boolean; outputUrl?: string; thumbnailUrl?: string; createdAt?: string };

export async function getGenerationView(projectRouteId: string): Promise<{ items: GenerationViewItem[]; persistence: "database" | "fixture" }> {
  if (!isDatabaseConfigured()) {
    return { persistence: "fixture", items: [{ id: "mock-v1", shotId: "shot-02", shotRouteId: "shot-02", shotTitle: "미디엄 샷", shotOrder: 2, status: "success", version: 1, selected: true, outputUrl: "/fixtures/mock-shot-02.mp4", thumbnailUrl: "/fixtures/shot-medium.jpg" }] };
  }
  const db = getDb();
  const projectId = resolveDemoProjectId(projectRouteId);
  const sceneRows = await db.select({ id: scenes.id }).from(scenes).where(eq(scenes.projectId, projectId));
  if (!sceneRows.length) return { persistence: "database", items: [] };
  const shotRows = await db.select().from(shots).where(inArray(shots.sceneId, sceneRows.map((item) => item.id))).orderBy(asc(shots.shotOrder));
  if (!shotRows.length) return { persistence: "database", items: [] };
  const generationRows = await db.select().from(generations).where(inArray(generations.shotId, shotRows.map((item) => item.id))).orderBy(desc(generations.createdAt));
  const assets = generationRows.length ? await db.select().from(generationAssets).where(inArray(generationAssets.generationId, generationRows.map((item) => item.id))) : [];
  const totals = new Map<string, number>();
  for (const row of generationRows) totals.set(row.shotId, (totals.get(row.shotId) ?? 0) + 1);
  const seen = new Map<string, number>();
  const items = generationRows.map((row) => {
    const shot = shotRows.find((item) => item.id === row.shotId)!;
    const used = seen.get(row.shotId) ?? 0;
    const version = (totals.get(row.shotId) ?? 1) - used;
    seen.set(row.shotId, used + 1);
    const asset = assets.find((item) => item.generationId === row.id && item.kind === "video");
    return { id: row.id, shotId: row.shotId, shotRouteId: routeForDemoShotId(row.shotId), shotTitle: shot.title, shotOrder: shot.shotOrder, status: row.status, version, selected: row.selected, outputUrl: asset?.url, thumbnailUrl: (asset?.metadata as Record<string, unknown> | undefined)?.thumbnailUrl as string | undefined, createdAt: row.createdAt.toISOString() };
  });
  return { persistence: "database", items };
}


export async function selectGenerationVersion(id: string) {
  if (!isDatabaseConfigured() || !UUID_RE.test(id)) return { persisted: false, selected: true };
  const db = getDb();
  const [row] = await db.select().from(generations).where(eq(generations.id, id)).limit(1);
  if (!row) throw new Error("Generation not found");
  if (row.status !== "success") throw new Error("Only completed generations can be selected");
  await db.transaction(async (tx) => {
    await tx.update(generations).set({ selected: false, updatedAt: new Date() }).where(eq(generations.shotId, row.shotId));
    await tx.update(generations).set({ selected: true, updatedAt: new Date() }).where(eq(generations.id, id));
  });
  return { persisted: true, selected: true };
}

export async function cancelGeneration(id: string) {
  if (!isDatabaseConfigured() || !UUID_RE.test(id)) return { persisted: false, status: "cancelled" as const };
  const db = getDb();
  const [row] = await db.select().from(generations).where(eq(generations.id, id)).limit(1);
  if (!row) throw new Error("Generation not found");
  if (["success", "error", "cancelled"].includes(row.status)) return { persisted: true, status: row.status };
  if (!row.providerJobId) throw new Error("Provider job id missing");
  const provider = getVideoProvider(row.provider);
  const settings = (row.settings ?? {}) as Record<string, unknown>;
  const control = ((settings.providerControl ?? {}) as ProviderControl);
  if (!provider.cancel) throw new Error("The active video provider does not support cancellation");
  await provider.cancel(row.providerJobId, control);
  await db.update(generations).set({ status: "cancelled", updatedAt: new Date() }).where(eq(generations.id, id));
  return { persisted: true, status: "cancelled" as const };
}
