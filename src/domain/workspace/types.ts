import type { Conflict } from "@/domain/consistency";

export type ShotDirectionDraft = {
  action: string;
  expression: string;
  gaze: string;
  shotSize: string;
  cameraMovement: string;
  angle: string;
  lens: string;
  focus: string;
  shake: string;
  baseLight: string;
  fillLight: string;
  timeOfDay: string;
  weather: string;
};

export type ShotListItem = {
  id: string;
  routeId: string;
  order: number;
  title: string;
  description: string;
  duration: number;
  image: string;
};

export type ConsistencySummary = {
  conflicts: Conflict[];
  warnings: Conflict[];
  blocked: Conflict[];
  autoResolved: Conflict[];
  autoRestored: Conflict[];
  resolvedCharacter: Record<string, unknown>;
};

export type ShotWorkspaceData = {
  project: { id: string; routeId: string; name: string; aspectRatio: string };
  scene: { id: string; title: string; order: number; description: string; environment: Record<string, unknown> };
  shot: { id: string; routeId: string; title: string; description: string; duration: number; firstFrameUrl: string; draft: ShotDirectionDraft; rawOverrides: Record<string, unknown> };
  shots: ShotListItem[];
  character: { id: string; name: string; canon: Record<string, unknown>; sceneOverrides: Record<string, unknown>; sceneStates: Array<{ id: string; category: "environment" | "physical" | "wardrobe" | "condition" | "emotion" | "story" | "temporary"; priority?: number; sequence?: number; changes: Record<string, unknown>; carryForward?: boolean; conflictsWith?: string[]; replaces?: string[] }> };
  location: { id: string; name: string; canon: Record<string, unknown> };
  props: Array<{ id: string; name: string; canon: Record<string, unknown>; state?: Record<string, unknown> }>;
  style: { global: string[]; cameraLanguage: string[] };
  consistency: ConsistencySummary;
  persistence: "local";
};
