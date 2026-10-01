import { resolveEntity, type ActiveState, type Conflict } from "./index";
import type { ConsistencySummary, ShotDirectionDraft } from "@/domain/workspace/types";

export function draftToShotOverrides(draft: ShotDirectionDraft, rawOverrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    ...rawOverrides,
    action: draft.action,
    expression: { mood: draft.expression },
    gaze: draft.gaze,
    camera: {
      shot_size: draft.shotSize,
      movement: draft.cameraMovement,
      angle: draft.angle,
      lens: draft.lens,
      focus: draft.focus,
      shake: draft.shake,
    },
    lighting: { base: draft.baseLight, fill: draft.fillLight },
    environment: { time_of_day: draft.timeOfDay, weather: draft.weather },
  };
}

export function evaluateShotConsistency(args: {
  canon: Record<string, unknown>;
  sceneStates: ActiveState[];
  sceneOverrides?: Record<string, unknown>;
  sceneEnvironment?: Record<string, unknown>;
  draft: ShotDirectionDraft;
  rawOverrides?: Record<string, unknown>;
}): ConsistencySummary {
  const result = resolveEntity({
    canon: args.canon,
    sceneStates: args.sceneStates,
    sceneOverrides: args.sceneOverrides,
    shotOverrides: draftToShotOverrides(args.draft, args.rawOverrides),
  });

  const blocked = result.conflicts.filter((item) => item.action === "BLOCK");
  const warnings = result.conflicts.filter((item) => item.action === "WARN");
  const scene = args.sceneEnvironment ?? {};
  const scopedChecks: Array<[string, unknown, unknown]> = [
    ["environment.time_of_day", scene.timeOfDay, args.draft.timeOfDay],
    ["environment.weather", scene.weather, args.draft.weather],
    ["lighting.base", scene.baseLight, args.draft.baseLight],
    ["lighting.fill", scene.fillLight, args.draft.fillLight],
  ];
  for (const [path, expected, incoming] of scopedChecks) {
    if (expected !== undefined && incoming !== undefined && !Object.is(expected, incoming)) {
      warnings.push({ path, action: "WARN", expected, incoming, source: "SHOT_OVERRIDE", reason: "장면 범위의 설정과 다른 샷별 값입니다. 의도한 변화인지 확인하세요." });
    }
  }
  const autoResolved = result.conflicts.filter((item) => item.action === "AUTO_RESOLVE");

  // PROJECT-scope changes are never persisted from Shot. The attempted value is
  // rejected and the canonical value remains, which is surfaced as an automatic
  // restoration in the UI while preserving the engine's BLOCK semantics.
  const autoRestored: Conflict[] = blocked.map((item) => ({
    ...item,
    reason: `기준 자산 보호: ${item.path} 값을 기준값으로 복원했습니다.`,
  }));

  return {
    conflicts: result.conflicts,
    warnings,
    blocked,
    autoResolved,
    autoRestored,
    resolvedCharacter: result.resolved,
  };
}
