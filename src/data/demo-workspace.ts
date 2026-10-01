import { evaluateShotConsistency } from "../domain/consistency/shot-consistency";
import type { ShotDirectionDraft, ShotWorkspaceData } from "../domain/workspace/types";
import { demoProject } from "../test/fixtures/the-last-cassette";
import { DEMO_IDS } from "../test/fixtures/ids";

export const DEMO_CHARACTER_CANON: Record<string, unknown> = {
  identity: { age: 32, ethnicity: "Korean", eye_color: "brown", mole: "beneath left eye" },
  hair: { base_color: "black", base_style: "short bob" },
  body: { build: "slim" },
  distinctive_features: ["small mole beneath left eye", "silver necklace"],
};

export const DEMO_SCENE_STATES = [
  { id: DEMO_IDS.wetState, category: "physical" as const, priority: 50, sequence: 1, carryForward: true, changes: { "state.wetness": "wet", "hair.wetness": "wet" } },
  { id: DEMO_IDS.tiredState, category: "condition" as const, priority: 50, sequence: 2, carryForward: true, changes: { "state.fatigue": "tired" } },
  { id: DEMO_IDS.injuredState, category: "condition" as const, priority: 50, sequence: 3, carryForward: true, changes: { "state.injury": "minor cheek scratch" } },
  { id: "wardrobe-black-jacket", category: "wardrobe" as const, priority: 50, sequence: 4, carryForward: true, changes: { "wardrobe.outerwear": "wet black leather jacket" } },
];

export const DEFAULT_SHOT_DRAFT: ShotDirectionDraft = {
  action: "소리를 듣고 천천히 뒤를 돌아본다.",
  expression: "불안한",
  gaze: "왼쪽",
  shotSize: "미디엄 샷",
  cameraMovement: "느린 돌리 인 (Slow Dolly In)",
  angle: "눈높이",
  lens: "35mm",
  focus: "Mina (얼굴)",
  shake: "낮게",
  baseLight: "텅스텐 (실내)",
  fillLight: "푸른 빛 반사",
  timeOfDay: "밤",
  weather: "강한 비",
};

const shotIdMap = [DEMO_IDS.shot1, DEMO_IDS.shot2, DEMO_IDS.shot3, DEMO_IDS.shot4];
const routeIdMap = ["shot-01", "shot-02", "shot-03", "shot-04"];

export function createDemoWorkspace(routeProjectId = "demo", routeShotId = "shot-02"): ShotWorkspaceData {
  const selectedIndex = Math.max(0, routeIdMap.indexOf(routeShotId));
  const selected = demoProject.shots[selectedIndex] ?? demoProject.shots[1];
  const draft = { ...DEFAULT_SHOT_DRAFT, action: selected.id === "shot-02" ? DEFAULT_SHOT_DRAFT.action : selected.description };
  const rawOverrides: Record<string, unknown> = {};
  const sceneOverrides = {};
  const sceneEnvironment = { timeOfDay: "밤", weather: "강한 비", baseLight: "텅스텐 (실내)", fillLight: "푸른 빛 반사" };
  const consistency = evaluateShotConsistency({ canon: DEMO_CHARACTER_CANON, sceneStates: DEMO_SCENE_STATES, sceneOverrides, sceneEnvironment, draft, rawOverrides });

  return {
    project: { id: DEMO_IDS.project, routeId: routeProjectId, name: demoProject.name, aspectRatio: demoProject.aspectRatio },
    scene: { id: DEMO_IDS.scene3, title: "오래된 상점", order: 3, description: "Mina가 오래된 상점에 들어가 카세트 플레이어를 발견한다.", environment: sceneEnvironment },
    shot: { id: shotIdMap[selectedIndex] ?? DEMO_IDS.shot2, routeId: routeShotId, title: selected.title, description: selected.description, duration: selected.duration, firstFrameUrl: routeShotId === "shot-02" ? "/fixtures/mina-old-shop-main.jpg" : selected.image, draft, rawOverrides },
    shots: demoProject.shots.map((shot, index) => ({ id: shotIdMap[index], routeId: routeIdMap[index], order: shot.order, title: shot.title, description: shot.description, duration: shot.duration, image: shot.image })),
    character: { id: DEMO_IDS.character, name: "Mina", canon: DEMO_CHARACTER_CANON, sceneOverrides, sceneStates: DEMO_SCENE_STATES },
    location: { id: DEMO_IDS.location, name: "오래된 상점", canon: { architecture: { type: "narrow antique shop", walls: "dark wood" }, fixed_landmarks: ["green hanging lamp", "wooden shelves"] } },
    props: [{ id: DEMO_IDS.prop, name: "cassette_player", canon: { geometry: "rectangular", material: "silver brushed metal", primary_color: "silver", core_design: "black buttons and upper-right scratch" } }],
    style: { global: ["cinematic realism", "muted cyan and amber", "subtle 35mm grain"], cameraLanguage: ["mostly eye-level", "slow controlled movement"] },
    consistency,
    persistence: "fixture",
  };
}
