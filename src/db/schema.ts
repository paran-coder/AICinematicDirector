import { boolean, index, integer, jsonb, numeric, pgEnum, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const characterStatus = pgEnum("character_status", ["draft", "confirmed"]);
export const generationStatus = pgEnum("generation_status", ["queued", "generating", "success", "error", "cancelled"]);
export const generationAssetKind = pgEnum("generation_asset_kind", ["video", "image", "thumbnail"]);

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  story: text("story").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  aspectRatio: text("aspect_ratio").notNull(),
  genre: text("genre"),
  visualStyle: jsonb("visual_style").$type<Record<string, unknown>>().notNull().default({}),
  ...timestamps,
});

export const characters = pgTable("characters", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  canon: jsonb("canon").$type<Record<string, unknown>>().notNull().default({}),
  characterSheet: jsonb("character_sheet").$type<Record<string, unknown> | null>(),
  status: characterStatus("status").notNull().default("draft"),
  ...timestamps,
}, (table) => [index("characters_project_idx").on(table.projectId)]);

export const characterStates = pgTable("character_states", {
  id: uuid("id").primaryKey().defaultRandom(),
  characterId: uuid("character_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  priority: integer("priority").notNull().default(50),
  changes: jsonb("changes").$type<Record<string, unknown>>().notNull().default({}),
  carryForward: boolean("carry_forward").notNull().default(false),
  conflictsWith: jsonb("conflicts_with").$type<string[]>().notNull().default([]),
  replaces: jsonb("replaces").$type<string[]>().notNull().default([]),
  ...timestamps,
});

export const locations = pgTable("locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  canon: jsonb("canon").$type<Record<string, unknown>>().notNull().default({}),
  ...timestamps,
});

export const props = pgTable("props", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  canon: jsonb("canon").$type<Record<string, unknown>>().notNull().default({}),
  ...timestamps,
});

export const scenes = pgTable("scenes", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  sceneOrder: integer("scene_order").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  locationId: uuid("location_id").references(() => locations.id, { onDelete: "set null" }),
  environment: jsonb("environment").$type<Record<string, unknown>>().notNull().default({}),
  mood: jsonb("mood").$type<Record<string, unknown>>().notNull().default({}),
  ...timestamps,
}, (table) => [index("scenes_project_order_idx").on(table.projectId, table.sceneOrder)]);

export const sceneCharacters = pgTable("scene_characters", {
  sceneId: uuid("scene_id").notNull().references(() => scenes.id, { onDelete: "cascade" }),
  characterId: uuid("character_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
  activeStateIds: jsonb("active_state_ids").$type<string[]>().notNull().default([]),
  sceneOverrides: jsonb("scene_overrides").$type<Record<string, unknown>>().notNull().default({}),
}, (table) => [primaryKey({ columns: [table.sceneId, table.characterId] })]);

export const sceneProps = pgTable("scene_props", {
  sceneId: uuid("scene_id").notNull().references(() => scenes.id, { onDelete: "cascade" }),
  propId: uuid("prop_id").notNull().references(() => props.id, { onDelete: "cascade" }),
  state: jsonb("state").$type<Record<string, unknown>>().notNull().default({}),
}, (table) => [primaryKey({ columns: [table.sceneId, table.propId] })]);

export const shots = pgTable("shots", {
  id: uuid("id").primaryKey().defaultRandom(),
  sceneId: uuid("scene_id").notNull().references(() => scenes.id, { onDelete: "cascade" }),
  shotOrder: integer("shot_order").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  durationSeconds: numeric("duration_seconds", { precision: 6, scale: 2 }).notNull(),
  characterDirection: jsonb("character_direction").$type<Record<string, unknown>>().notNull().default({}),
  camera: jsonb("camera").$type<Record<string, unknown>>().notNull().default({}),
  lighting: jsonb("lighting").$type<Record<string, unknown>>().notNull().default({}),
  environmentOverrides: jsonb("environment_overrides").$type<Record<string, unknown>>().notNull().default({}),
  shotOverrides: jsonb("shot_overrides").$type<Record<string, unknown>>().notNull().default({}),
  firstFrameAssetUrl: text("first_frame_asset_url"),
  ...timestamps,
}, (table) => [index("shots_scene_order_idx").on(table.sceneId, table.shotOrder)]);

export const generations = pgTable("generations", {
  id: uuid("id").primaryKey().defaultRandom(),
  shotId: uuid("shot_id").notNull().references(() => shots.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  status: generationStatus("status").notNull().default("queued"),
  providerJobId: text("provider_job_id"),
  resolvedSnapshot: jsonb("resolved_snapshot").$type<Record<string, unknown>>().notNull(),
  compiledPrompt: text("compiled_prompt").notNull(),
  settings: jsonb("settings").$type<Record<string, unknown>>().notNull().default({}),
  error: jsonb("error").$type<Record<string, unknown> | null>(),
  selected: boolean("selected").notNull().default(false),
  ...timestamps,
}, (table) => [index("generations_shot_created_idx").on(table.shotId, table.createdAt)]);

export const generationAssets = pgTable("generation_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  generationId: uuid("generation_id").notNull().references(() => generations.id, { onDelete: "cascade" }),
  kind: generationAssetKind("kind").notNull(),
  url: text("url").notNull(),
  mimeType: text("mime_type").notNull(),
  width: integer("width"),
  height: integer("height"),
  durationSeconds: numeric("duration_seconds", { precision: 8, scale: 3 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
