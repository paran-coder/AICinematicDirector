export type Scope = "PROJECT" | "SCENE" | "SHOT" | "FREE";
export type ConflictAction = "AUTO_RESOLVE" | "WARN" | "BLOCK";
export type StateCategory = "environment" | "physical" | "wardrobe" | "condition" | "emotion" | "story" | "temporary";
export type SourceKind = "CANON" | "PERSISTENT_STATE" | "SCENE_STATE" | "SCENE_OVERRIDE" | "SHOT_OVERRIDE" | "USER_OVERRIDE";

export type ScopeRule = { pattern: string; scope: Scope; warnOnTransition?: boolean };
export type ActiveState = {
  id: string;
  category: StateCategory;
  priority?: number;
  sequence?: number;
  changes: Record<string, unknown>;
  carryForward?: boolean;
  conflictsWith?: string[];
  replaces?: string[];
};
export type ExplicitOverride = { changes: Record<string, unknown>; target?: "CONTEXT" | "CANON" };
export type Conflict = { path: string; action: ConflictAction; expected?: unknown; incoming?: unknown; reason: string; source: SourceKind };
export type ResolutionResult<T extends Record<string, unknown>> = { resolved: T; conflicts: Conflict[]; appliedSources: Record<string, SourceKind> };

export const DEFAULT_SCOPE_RULES: ScopeRule[] = [
  { pattern: "identity.*", scope: "PROJECT" },
  { pattern: "hair.base_*", scope: "PROJECT" },
  { pattern: "hair.signature_*", scope: "PROJECT" },
  { pattern: "distinctive_features", scope: "PROJECT" },
  { pattern: "body.*", scope: "PROJECT" },
  { pattern: "wardrobe.*", scope: "SCENE", warnOnTransition: true },
  { pattern: "state.*", scope: "SCENE", warnOnTransition: true },
  { pattern: "hair.condition", scope: "SCENE", warnOnTransition: true },
  { pattern: "hair.wetness", scope: "SCENE", warnOnTransition: true },
  { pattern: "expression.*", scope: "SHOT" },
  { pattern: "pose.*", scope: "SHOT" },
  { pattern: "gaze", scope: "SHOT" },
  { pattern: "action", scope: "SHOT" },
  { pattern: "movement", scope: "SHOT" },
  { pattern: "micro.*", scope: "FREE" },
  { pattern: "architecture.*", scope: "PROJECT" },
  { pattern: "layout.*", scope: "PROJECT" },
  { pattern: "fixed_landmarks", scope: "PROJECT" },
  { pattern: "environment.*", scope: "SCENE" },
  { pattern: "lighting.*", scope: "SCENE" },
  { pattern: "geometry", scope: "PROJECT" },
  { pattern: "material", scope: "PROJECT" },
  { pattern: "primary_color", scope: "PROJECT" },
  { pattern: "core_design", scope: "PROJECT" },
  { pattern: "condition.*", scope: "SCENE", warnOnTransition: true },
  { pattern: "position", scope: "SHOT" },
  { pattern: "orientation", scope: "SHOT" },
  { pattern: "interaction", scope: "SHOT" },
  { pattern: "style.*", scope: "PROJECT" },
  { pattern: "camera_language.*", scope: "PROJECT" },
  { pattern: "camera.*", scope: "SHOT" },
];

function matches(pattern: string, path: string): boolean {
  if (!pattern.includes("*")) return pattern === path;
  const [prefix, suffix] = pattern.split("*");
  return path.startsWith(prefix) && path.endsWith(suffix);
}


export function getScope(path: string, overrides: Record<string, Scope> = {}, rules = DEFAULT_SCOPE_RULES): Scope {
  if (overrides[path]) return overrides[path];
  return rules.find((rule) => matches(rule.pattern, path))?.scope ?? "SCENE";
}

export function flatten(input: Record<string, unknown>, prefix = "", out: Record<string, unknown> = {}): Record<string, unknown> {
  for (const [key, value] of Object.entries(input)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) flatten(value as Record<string, unknown>, path, out);
    else out[path] = value;
  }
  return out;
}

export function unflatten(input: Record<string, unknown>): Record<string, unknown> {
  const root: Record<string, unknown> = {};
  for (const [path, value] of Object.entries(input)) {
    const parts = path.split(".");
    let cursor = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];
      if (!cursor[key] || typeof cursor[key] !== "object" || Array.isArray(cursor[key])) cursor[key] = {};
      cursor = cursor[key] as Record<string, unknown>;
    }
    cursor[parts.at(-1)!] = value;
  }
  return root;
}

function sourceRank(source: SourceKind): number {
  return ({ CANON: 0, PERSISTENT_STATE: 1, SCENE_STATE: 2, SCENE_OVERRIDE: 3, SHOT_OVERRIDE: 4, USER_OVERRIDE: 5 })[source];
}

function activeStates(states: ActiveState[]): ActiveState[] {
  const replaced = new Set(states.flatMap((state) => state.replaces ?? []));
  return states.filter((state) => !replaced.has(state.id));
}

function applyCandidate(
  values: Record<string, unknown>,
  sources: Record<string, SourceKind>,
  conflicts: Conflict[],
  path: string,
  value: unknown,
  source: SourceKind,
  scopeOverrides: Record<string, Scope>,
  allowCanonChange = false,
) {
  const scope = getScope(path, scopeOverrides);
  const existing = values[path];
  const existingSource = sources[path];

  if (scope === "PROJECT" && source !== "CANON" && !(source === "USER_OVERRIDE" && allowCanonChange)) {
    if (existing !== undefined && !Object.is(existing, value)) conflicts.push({ path, action: "BLOCK", expected: existing, incoming: value, source, reason: "PROJECT 범위의 기준 자산을 하위 상태가 변경하려 했습니다." });
    return;
  }

  if (existing === undefined || Object.is(existing, value)) {
    values[path] = value;
    sources[path] = source;
    return;
  }

  if (!existingSource || sourceRank(source) >= sourceRank(existingSource)) {
    conflicts.push({ path, action: "AUTO_RESOLVE", expected: existing, incoming: value, source, reason: "현재 생성 범위에 더 가까운 값이 우선합니다." });
    values[path] = value;
    sources[path] = source;
  }
}

export function resolveEntity<T extends Record<string, unknown>>(args: {
  canon: T;
  persistentStates?: ActiveState[];
  sceneStates?: ActiveState[];
  sceneOverrides?: Record<string, unknown>;
  shotOverrides?: Record<string, unknown>;
  userOverride?: ExplicitOverride;
  scopeOverrides?: Record<string, Scope>;
}): ResolutionResult<T> {
  const values = flatten(args.canon);
  const sources: Record<string, SourceKind> = Object.fromEntries(Object.keys(values).map((path) => [path, "CANON"]));
  const conflicts: Conflict[] = [];
  const scopes = args.scopeOverrides ?? {};

  const applyStateSet = (states: ActiveState[], source: SourceKind) => {
    const sorted = activeStates(states).slice().sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0) || (a.priority ?? 50) - (b.priority ?? 50));
    for (const state of sorted) for (const [path, value] of Object.entries(state.changes)) applyCandidate(values, sources, conflicts, path, value, source, scopes);
  };

  applyStateSet(args.persistentStates ?? [], "PERSISTENT_STATE");
  applyStateSet(args.sceneStates ?? [], "SCENE_STATE");
  for (const [path, value] of Object.entries(flatten(args.sceneOverrides ?? {}))) applyCandidate(values, sources, conflicts, path, value, "SCENE_OVERRIDE", scopes);
  for (const [path, value] of Object.entries(flatten(args.shotOverrides ?? {}))) applyCandidate(values, sources, conflicts, path, value, "SHOT_OVERRIDE", scopes);
  for (const [path, value] of Object.entries(flatten(args.userOverride?.changes ?? {}))) applyCandidate(values, sources, conflicts, path, value, "USER_OVERRIDE", scopes, args.userOverride?.target === "CANON");

  return { resolved: unflatten(values) as T, conflicts, appliedSources: sources };
}

export function detectContinuityWarnings(args: {
  previous: Record<string, unknown>;
  current: Record<string, unknown>;
  explicitTransitions?: string[];
  scopeOverrides?: Record<string, Scope>;
  rules?: ScopeRule[];
}): Conflict[] {
  const previous = flatten(args.previous);
  const current = flatten(args.current);
  const transitions = new Set(args.explicitTransitions ?? []);
  const rules = args.rules ?? DEFAULT_SCOPE_RULES;
  const out: Conflict[] = [];
  for (const [path, before] of Object.entries(previous)) {
    if (!(path in current) || Object.is(before, current[path]) || transitions.has(path)) continue;
    const rule = rules.find((item) => matches(item.pattern, path));
    if (rule?.warnOnTransition || getScope(path, args.scopeOverrides, rules) === "SCENE") {
      out.push({ path, action: "WARN", expected: before, incoming: current[path], source: "SCENE_OVERRIDE", reason: "장면 전환 근거 없이 상태가 달라졌습니다." });
    }
  }
  return out;
}
