import assert from "node:assert/strict";
import { evaluateShotConsistency } from "../src/domain/consistency/shot-consistency";
import { _higgsfieldInternals } from "../src/providers/video/higgsfield-provider";
import { getVideoProvider } from "../src/providers/video";
import { MockVideoProvider } from "../src/providers/video/mock-provider";

const draft = {
  action: "turns around",
  expression: "anxious",
  gaze: "left",
  shotSize: "medium shot",
  cameraMovement: "slow dolly in",
  angle: "eye level",
  lens: "35mm",
  focus: "face",
  shake: "low",
  baseLight: "tungsten",
  fillLight: "blue spill",
  timeOfDay: "night",
  weather: "heavy rain",
};

const normal = evaluateShotConsistency({
  canon: { hair: { base_color: "black" }, identity: { eye_color: "brown" } },
  sceneStates: [{ id: "wet", category: "physical", changes: { "state.wetness": "wet" } }],
  draft,
});
assert.equal((normal.resolvedCharacter.camera as any).lens, "35mm");
assert.equal((normal.resolvedCharacter.expression as any).mood, "anxious");

const warningResult = evaluateShotConsistency({
  canon: { hair: { base_color: "black" } },
  sceneStates: [],
  sceneEnvironment: { weather: "heavy rain", timeOfDay: "night", baseLight: "tungsten", fillLight: "blue spill" },
  draft: { ...draft, weather: "clear" },
});
assert.ok(warningResult.warnings.some((item) => item.path === "environment.weather"));

const protectedResult = evaluateShotConsistency({
  canon: { hair: { base_color: "black" } },
  sceneStates: [],
  draft,
  rawOverrides: { "hair.base_color": "brown" },
});
assert.equal((protectedResult.resolvedCharacter.hair as any).base_color, "black");
assert.equal(protectedResult.autoRestored.length, 1);
assert.equal(protectedResult.autoRestored[0].path, "hair.base_color");

assert.ok(getVideoProvider("mock") instanceof MockVideoProvider);

const queued = _higgsfieldInternals.normalizeStatus({ status: "queued", progress: 4 });
assert.equal(queued.status, "queued");
const generating = _higgsfieldInternals.normalizeStatus({ status: "processing", progress_percent: 48 });
assert.equal(generating.status, "generating");
const completed = _higgsfieldInternals.normalizeStatus({ status: "completed", video: { url: "https://cdn.example/video.mp4" } });
assert.equal(completed.status, "success");
assert.equal(completed.outputUrl, "https://cdn.example/video.mp4");
const failed = _higgsfieldInternals.normalizeStatus({ status: "failed", error: { message: "bad request" } });
assert.equal(failed.status, "error");
assert.equal(failed.error?.message, "bad request");

console.log("Integration tests: 10/10 assertions passed");
