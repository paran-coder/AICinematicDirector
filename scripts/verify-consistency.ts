import assert from "node:assert/strict";
import { detectContinuityWarnings, resolveEntity, type ActiveState } from "../src/domain/consistency/index";

const canon = {
  identity: { eye_color: "brown", face_structure: "oval" },
  hair: { base_color: "black", condition: "dry" },
  wardrobe: { outfit: "black leather jacket", condition: "dry" },
  state: { energy: "normal" },
  expression: { emotion: "neutral" },
};

const wet: ActiveState = { id: "wet", category: "condition", sequence: 1, changes: { "hair.condition": "wet", "wardrobe.condition": "wet" }, carryForward: true };
const tired: ActiveState = { id: "tired", category: "condition", sequence: 2, changes: { "state.energy": "low" }, carryForward: true };
const injured: ActiveState = { id: "injured", category: "physical", sequence: 3, priority: 60, changes: { "state.injury": "small_cut", movement: "slight_limp" }, carryForward: true };

const merged = resolveEntity({ canon, persistentStates: [wet, tired, injured] });
assert.equal((merged.resolved.hair as any).condition, "wet");
assert.equal((merged.resolved.wardrobe as any).condition, "wet");
assert.equal((merged.resolved.state as any).energy, "low");
assert.equal((merged.resolved.state as any).injury, "small_cut");

const blocked = resolveEntity({ canon, sceneStates: [{ id: "bad", category: "temporary", changes: { "hair.base_color": "brown" } }] });
assert.equal((blocked.resolved.hair as any).base_color, "black");
assert.ok(blocked.conflicts.some((c) => c.path === "hair.base_color" && c.action === "BLOCK"));

const expression = resolveEntity({ canon, sceneOverrides: { "expression.emotion": "anxious" }, shotOverrides: { "expression.emotion": "terrified" } });
assert.equal((expression.resolved.expression as any).emotion, "terrified");
assert.ok(expression.conflicts.some((c) => c.path === "expression.emotion" && c.action === "AUTO_RESOLVE"));

const dried: ActiveState = { id: "dried", category: "condition", sequence: 5, changes: { "hair.condition": "dry", "wardrobe.condition": "dry" }, replaces: ["wet"] };
const temporal = resolveEntity({ canon, persistentStates: [wet, dried] });
assert.equal((temporal.resolved.hair as any).condition, "dry");
assert.equal((temporal.resolved.wardrobe as any).condition, "dry");

const warning = detectContinuityWarnings({ previous: { wardrobe: { condition: "wet" } }, current: { wardrobe: { condition: "dry" } } });
assert.ok(warning.some((c) => c.path === "wardrobe.condition" && c.action === "WARN"));
const noWarning = detectContinuityWarnings({ previous: { wardrobe: { condition: "wet" } }, current: { wardrobe: { condition: "dry" } }, explicitTransitions: ["wardrobe.condition"] });
assert.equal(noWarning.length, 0);

console.log("Consistency tests: 5/5 passed");
