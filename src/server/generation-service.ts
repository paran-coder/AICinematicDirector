import { compileSeedancePrompt } from "@/domain/prompt/seedance-compiler";
import { evaluateShotConsistency } from "@/domain/consistency/shot-consistency";
import { getShotWorkspace } from "@/data/project-repository";
import type { ShotDirectionDraft, ShotWorkspaceData } from "@/domain/workspace/types";
import { getVideoProvider } from "@/providers/video";

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

function compileWorkspacePrompt(workspace: ShotWorkspaceData): string {
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

async function buildWorkspace(projectId: string, shotId: string, draft?: ShotDirectionDraft, aspectRatio?: string): Promise<ShotWorkspaceData> {
  const base = await getShotWorkspace(projectId, shotId);
  const activeDraft = draft ?? base.shot.draft;
  const consistency = evaluateShotConsistency({
    canon: base.character.canon,
    sceneStates: base.character.sceneStates,
    sceneOverrides: base.character.sceneOverrides,
    sceneEnvironment: base.scene.environment,
    draft: activeDraft,
    rawOverrides: base.shot.rawOverrides,
  });
  return {
    ...base,
    project: { ...base.project, aspectRatio: aspectRatio || base.project.aspectRatio },
    shot: { ...base.shot, draft: activeDraft, description: activeDraft.action },
    consistency,
  };
}

export async function submitShotGeneration(projectId: string, shotId: string, input?: { draft?: ShotDirectionDraft; aspectRatio?: string }) {
  const workspace = await buildWorkspace(projectId, shotId, input?.draft, input?.aspectRatio);
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

  return {
    id: submit.jobId,
    providerJobId: submit.jobId,
    status: "queued" as const,
    prompt,
  };
}

export async function getGenerationStatus(id: string) {
  return getVideoProvider().getStatus(id);
}

export async function cancelGeneration(id: string) {
  const provider = getVideoProvider();
  if (!provider.cancel) throw new Error("The active video provider does not support cancellation");
  await provider.cancel(id);
  return { status: "cancelled" as const };
}
