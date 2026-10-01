import { getDb, closeDb } from "./index";
import { characterStates, characters, locations, projects, props, sceneCharacters, sceneProps, scenes, shots } from "./schema";
import { DEMO_IDS } from "../test/fixtures/ids";
import { DEMO_CHARACTER_CANON, DEMO_SCENE_STATES, DEFAULT_SHOT_DRAFT } from "../data/demo-workspace";
import { demoProject } from "../test/fixtures/the-last-cassette";

async function seed() {
  const db = getDb();
  await db.insert(projects).values({
    id: DEMO_IDS.project,
    name: demoProject.name,
    story: demoProject.story,
    durationSeconds: demoProject.duration,
    aspectRatio: demoProject.aspectRatio,
    genre: demoProject.genre,
    visualStyle: { global: ["cinematic realism", "muted cyan and amber", "subtle 35mm grain"], cameraLanguage: ["mostly eye-level", "slow controlled movement"] },
  }).onConflictDoNothing();

  await db.insert(characters).values({ id: DEMO_IDS.character, projectId: DEMO_IDS.project, name: "Mina", canon: DEMO_CHARACTER_CANON, characterSheet: { portrait: "/fixtures/mina-portrait.jpg" }, status: "confirmed" }).onConflictDoNothing();
  await db.insert(characterStates).values(DEMO_SCENE_STATES.filter((state) => state.id !== "wardrobe-black-jacket").map((state) => ({
    id: state.id,
    characterId: DEMO_IDS.character,
    name: state.id === DEMO_IDS.wetState ? "젖음" : state.id === DEMO_IDS.tiredState ? "피곤함" : "부상",
    category: state.category,
    priority: state.priority ?? 50,
    changes: state.changes,
    carryForward: state.carryForward ?? true,
    conflictsWith: [],
    replaces: [],
  }))).onConflictDoNothing();

  await db.insert(locations).values({ id: DEMO_IDS.location, projectId: DEMO_IDS.project, name: "오래된 상점", canon: { architecture: { type: "narrow antique shop", walls: "dark wood" }, fixed_landmarks: ["green hanging lamp", "wooden shelves"] } }).onConflictDoNothing();
  await db.insert(props).values({ id: DEMO_IDS.prop, projectId: DEMO_IDS.project, name: "cassette_player", canon: { geometry: "rectangular", material: "silver brushed metal", primary_color: "silver", core_design: "black buttons and upper-right scratch" } }).onConflictDoNothing();

  const sceneIds = [DEMO_IDS.scene1, DEMO_IDS.scene2, DEMO_IDS.scene3, DEMO_IDS.scene4];
  await db.insert(scenes).values(demoProject.scenes.map((scene, index) => ({
    id: sceneIds[index], projectId: DEMO_IDS.project, sceneOrder: scene.order, title: scene.title, description: scene.description,
    locationId: scene.order === 3 ? DEMO_IDS.location : null,
    environment: scene.order === 3 ? { timeOfDay: "밤", weather: "강한 비", baseLight: "텅스텐 (실내)" } : {}, mood: {},
  }))).onConflictDoNothing();

  await db.insert(sceneCharacters).values({ sceneId: DEMO_IDS.scene3, characterId: DEMO_IDS.character, activeStateIds: [DEMO_IDS.wetState, DEMO_IDS.tiredState, DEMO_IDS.injuredState], sceneOverrides: { wardrobe: { outerwear: "wet black leather jacket" } } }).onConflictDoNothing();
  await db.insert(sceneProps).values({ sceneId: DEMO_IDS.scene3, propId: DEMO_IDS.prop, state: { condition: "aged but intact" } }).onConflictDoNothing();

  const shotIds = [DEMO_IDS.shot1, DEMO_IDS.shot2, DEMO_IDS.shot3, DEMO_IDS.shot4];
  await db.insert(shots).values(demoProject.shots.map((shot, index) => ({
    id: shotIds[index], sceneId: DEMO_IDS.scene3, shotOrder: shot.order, title: shot.title, description: shot.id === "shot-02" ? DEFAULT_SHOT_DRAFT.action : shot.description,
    durationSeconds: String(shot.duration),
    characterDirection: shot.id === "shot-02" ? { action: DEFAULT_SHOT_DRAFT.action, expression: DEFAULT_SHOT_DRAFT.expression, gaze: DEFAULT_SHOT_DRAFT.gaze } : { action: shot.description },
    camera: shot.id === "shot-02" ? { shotSize: DEFAULT_SHOT_DRAFT.shotSize, cameraMovement: DEFAULT_SHOT_DRAFT.cameraMovement, angle: DEFAULT_SHOT_DRAFT.angle, lens: DEFAULT_SHOT_DRAFT.lens, focus: DEFAULT_SHOT_DRAFT.focus, shake: DEFAULT_SHOT_DRAFT.shake } : {},
    lighting: shot.id === "shot-02" ? { baseLight: DEFAULT_SHOT_DRAFT.baseLight, fillLight: DEFAULT_SHOT_DRAFT.fillLight } : {},
    environmentOverrides: shot.id === "shot-02" ? { timeOfDay: DEFAULT_SHOT_DRAFT.timeOfDay, weather: DEFAULT_SHOT_DRAFT.weather } : {},
    shotOverrides: {}, firstFrameAssetUrl: shot.image,
  }))).onConflictDoNothing();
}

seed().then(async () => { console.log("Seeded The Last Cassette demo data."); await closeDb(); }).catch(async (error) => { console.error(error); await closeDb(); process.exitCode = 1; });
