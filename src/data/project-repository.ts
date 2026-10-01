import { and, asc, eq } from "drizzle-orm";
import { evaluateShotConsistency } from "@/domain/consistency/shot-consistency";
import { flatten, unflatten, type ActiveState } from "@/domain/consistency";
import type { ShotDirectionDraft, ShotWorkspaceData } from "@/domain/workspace/types";
import { getDb, isDatabaseConfigured } from "@/db";
import { characterStates, characters, locations, projects, props, sceneCharacters, sceneProps, scenes, shots } from "@/db/schema";
import { createDemoWorkspace, DEFAULT_SHOT_DRAFT } from "@/data/demo-workspace";
import { demoProject } from "@/test/fixtures/the-last-cassette";
import { resolveDemoProjectId, resolveDemoShotId, routeForDemoShotId } from "@/test/fixtures/ids";

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" && value ? value : fallback;
}

export function draftFromShot(row: { description: string; characterDirection: unknown; camera: unknown; lighting: unknown; environmentOverrides: unknown }): ShotDirectionDraft {
  const actor = objectValue(row.characterDirection);
  const camera = objectValue(row.camera);
  const lighting = objectValue(row.lighting);
  const environment = objectValue(row.environmentOverrides);
  return {
    action: stringValue(actor.action, row.description),
    expression: stringValue(actor.expression, DEFAULT_SHOT_DRAFT.expression),
    gaze: stringValue(actor.gaze, DEFAULT_SHOT_DRAFT.gaze),
    shotSize: stringValue(camera.shotSize, DEFAULT_SHOT_DRAFT.shotSize),
    cameraMovement: stringValue(camera.cameraMovement, DEFAULT_SHOT_DRAFT.cameraMovement),
    angle: stringValue(camera.angle, DEFAULT_SHOT_DRAFT.angle),
    lens: stringValue(camera.lens, DEFAULT_SHOT_DRAFT.lens),
    focus: stringValue(camera.focus, DEFAULT_SHOT_DRAFT.focus),
    shake: stringValue(camera.shake, DEFAULT_SHOT_DRAFT.shake),
    baseLight: stringValue(lighting.baseLight, DEFAULT_SHOT_DRAFT.baseLight),
    fillLight: stringValue(lighting.fillLight, DEFAULT_SHOT_DRAFT.fillLight),
    timeOfDay: stringValue(environment.timeOfDay, DEFAULT_SHOT_DRAFT.timeOfDay),
    weather: stringValue(environment.weather, DEFAULT_SHOT_DRAFT.weather),
  };
}

export async function getShotWorkspace(projectRouteId: string, shotRouteId: string): Promise<ShotWorkspaceData> {
  if (!isDatabaseConfigured()) return createDemoWorkspace(projectRouteId, shotRouteId);
  const db = getDb();
  const projectId = resolveDemoProjectId(projectRouteId);
  const shotId = resolveDemoShotId(shotRouteId);

  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  const [shot] = await db.select().from(shots).where(eq(shots.id, shotId)).limit(1);
  if (!project || !shot) return createDemoWorkspace(projectRouteId, shotRouteId);
  const [scene] = await db.select().from(scenes).where(and(eq(scenes.id, shot.sceneId), eq(scenes.projectId, project.id))).limit(1);
  if (!scene) return createDemoWorkspace(projectRouteId, shotRouteId);

  const shotRows = await db.select().from(shots).where(eq(shots.sceneId, scene.id)).orderBy(asc(shots.shotOrder));
  const characterLinks = await db.select().from(sceneCharacters).where(eq(sceneCharacters.sceneId, scene.id));
  const characterId = characterLinks[0]?.characterId;
  const [character] = characterId ? await db.select().from(characters).where(eq(characters.id, characterId)).limit(1) : [];
  const stateIds = characterLinks[0]?.activeStateIds ?? [];
  const sceneOverrides = characterLinks[0]?.sceneOverrides ?? {};
  const allStates = characterId ? await db.select().from(characterStates).where(eq(characterStates.characterId, characterId)) : [];
  const sceneStateRows = allStates.filter((state) => stateIds.includes(state.id));
  const sceneStates: ActiveState[] = sceneStateRows.map((state, index) => ({
    id: state.id,
    category: state.category as ActiveState["category"],
    priority: state.priority,
    sequence: index,
    changes: state.changes,
    carryForward: state.carryForward,
    conflictsWith: state.conflictsWith,
    replaces: state.replaces,
  }));

  const [location] = scene.locationId ? await db.select().from(locations).where(eq(locations.id, scene.locationId)).limit(1) : [];
  const propLinks = await db.select().from(sceneProps).where(eq(sceneProps.sceneId, scene.id));
  const projectProps = await db.select().from(props).where(eq(props.projectId, project.id));
  const propsForScene = propLinks.map((link) => {
    const prop = projectProps.find((item) => item.id === link.propId);
    return prop ? { id: prop.id, name: prop.name, canon: prop.canon, state: link.state } : undefined;
  }).filter(Boolean) as ShotWorkspaceData["props"];

  const draft = draftFromShot(shot);
  const rawOverrides = objectValue(shot.shotOverrides);
  const canon = character?.canon ?? {};
  const sceneEnvironment = objectValue(scene.environment);
  const consistency = evaluateShotConsistency({ canon, sceneStates, sceneOverrides, sceneEnvironment, draft, rawOverrides });
  const visualStyle = objectValue(project.visualStyle);

  return {
    project: { id: project.id, routeId: projectRouteId, name: project.name, aspectRatio: project.aspectRatio },
    scene: { id: scene.id, title: scene.title, order: scene.sceneOrder, description: scene.description, environment: sceneEnvironment },
    shot: { id: shot.id, routeId: shotRouteId, title: shot.title, description: shot.description, duration: Number(shot.durationSeconds), firstFrameUrl: shot.firstFrameAssetUrl ?? "/fixtures/shot-medium.jpg", draft, rawOverrides },
    shots: shotRows.map((item) => ({ id: item.id, routeId: routeForDemoShotId(item.id), order: item.shotOrder, title: item.title, description: item.description, duration: Number(item.durationSeconds), image: item.firstFrameAssetUrl ?? "/fixtures/shot-medium.jpg" })),
    character: { id: character?.id ?? "unknown", name: character?.name ?? "Character", canon, sceneOverrides, sceneStates },
    location: { id: location?.id ?? "unknown", name: location?.name ?? scene.title, canon: location?.canon ?? {} },
    props: propsForScene,
    style: { global: Array.isArray(visualStyle.global) ? visualStyle.global.filter((x): x is string => typeof x === "string") : [], cameraLanguage: Array.isArray(visualStyle.cameraLanguage) ? visualStyle.cameraLanguage.filter((x): x is string => typeof x === "string") : [] },
    consistency,
    persistence: "database",
  };
}

export async function updateShotDraft(projectRouteId: string, shotRouteId: string, draft: ShotDirectionDraft, rawOverrides: Record<string, unknown> = {}) {
  const current = await getShotWorkspace(projectRouteId, shotRouteId);
  const consistency = evaluateShotConsistency({ canon: current.character.canon, sceneStates: current.character.sceneStates, sceneOverrides: current.character.sceneOverrides, sceneEnvironment: current.scene.environment, draft, rawOverrides });

  // Canon-changing paths are rejected at the shot boundary. Other valid edits still save.
  const blockedPaths = new Set(consistency.blocked.map((item) => item.path));
  const sanitizedFlat = Object.fromEntries(Object.entries(flatten(rawOverrides)).filter(([path]) => !blockedPaths.has(path)));
  const sanitizedOverrides = unflatten(sanitizedFlat);

  if (isDatabaseConfigured()) {
    const db = getDb();
    const shotId = resolveDemoShotId(shotRouteId);
    await db.update(shots).set({
      description: draft.action,
      characterDirection: { action: draft.action, expression: draft.expression, gaze: draft.gaze },
      camera: { shotSize: draft.shotSize, cameraMovement: draft.cameraMovement, angle: draft.angle, lens: draft.lens, focus: draft.focus, shake: draft.shake },
      lighting: { baseLight: draft.baseLight, fillLight: draft.fillLight },
      environmentOverrides: { timeOfDay: draft.timeOfDay, weather: draft.weather },
      shotOverrides: sanitizedOverrides,
      updatedAt: new Date(),
    }).where(eq(shots.id, shotId));
  }

  return { consistency, persisted: isDatabaseConfigured(), sanitizedOverrides };
}

export type ProjectOverviewData = {
  id: string;
  routeId: string;
  name: string;
  story: string;
  duration: number;
  aspectRatio: string;
  genre: string;
  visualDirection: string;
  counts: { characters: number; locations: number; scenes: number };
  persistence: "database" | "fixture";
};

export async function getProjectOverview(projectRouteId: string): Promise<ProjectOverviewData> {
  if (!isDatabaseConfigured()) {
    const fixture = createDemoWorkspace(projectRouteId, "shot-02");
    return { id: fixture.project.id, routeId: projectRouteId, name: fixture.project.name, story: demoProject.story, duration: demoProject.duration, aspectRatio: demoProject.aspectRatio, genre: demoProject.genre, visualDirection: demoProject.visualDirection, counts: { characters: 1, locations: 3, scenes: 4 }, persistence: "fixture" };
  }
  const db = getDb();
  const id = resolveDemoProjectId(projectRouteId);
  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!project) {
    const fixture = createDemoWorkspace(projectRouteId, "shot-02");
    return { id: fixture.project.id, routeId: projectRouteId, name: fixture.project.name, story: demoProject.story, duration: demoProject.duration, aspectRatio: demoProject.aspectRatio, genre: demoProject.genre, visualDirection: demoProject.visualDirection, counts: { characters: 1, locations: 3, scenes: 4 }, persistence: "fixture" };
  }
  const [characterRows, locationRows, sceneRows] = await Promise.all([
    db.select({ id: characters.id }).from(characters).where(eq(characters.projectId, id)),
    db.select({ id: locations.id }).from(locations).where(eq(locations.projectId, id)),
    db.select({ id: scenes.id }).from(scenes).where(eq(scenes.projectId, id)),
  ]);
  const style = objectValue(project.visualStyle);
  const global = Array.isArray(style.global) ? style.global.filter((x): x is string => typeof x === "string") : [];
  return { id: project.id, routeId: projectRouteId, name: project.name, story: project.story, duration: project.durationSeconds, aspectRatio: project.aspectRatio, genre: project.genre ?? "", visualDirection: typeof style.direction === "string" ? style.direction : global.join(" · "), counts: { characters: characterRows.length, locations: locationRows.length, scenes: sceneRows.length }, persistence: "database" };
}

export async function updateProjectOverview(projectRouteId: string, input: Pick<ProjectOverviewData, "story" | "duration" | "aspectRatio" | "genre" | "visualDirection">) {
  if (!isDatabaseConfigured()) return { persisted: false };
  const db = getDb();
  const id = resolveDemoProjectId(projectRouteId);
  const [current] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!current) throw new Error("Project not found");
  const style = objectValue(current.visualStyle);
  await db.update(projects).set({ story: input.story, durationSeconds: input.duration, aspectRatio: input.aspectRatio, genre: input.genre, visualStyle: { ...style, direction: input.visualDirection }, updatedAt: new Date() }).where(eq(projects.id, id));
  return { persisted: true };
}
