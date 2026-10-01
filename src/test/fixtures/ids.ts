export const DEMO_IDS = {
  project: "00000000-0000-4000-8000-000000000001",
  character: "00000000-0000-4000-8000-000000000002",
  location: "00000000-0000-4000-8000-000000000003",
  prop: "00000000-0000-4000-8000-000000000004",
  scene1: "00000000-0000-4000-8000-000000000101",
  scene2: "00000000-0000-4000-8000-000000000102",
  scene3: "00000000-0000-4000-8000-000000000103",
  scene4: "00000000-0000-4000-8000-000000000104",
  shot1: "00000000-0000-4000-8000-000000000201",
  shot2: "00000000-0000-4000-8000-000000000202",
  shot3: "00000000-0000-4000-8000-000000000203",
  shot4: "00000000-0000-4000-8000-000000000204",
  wetState: "00000000-0000-4000-8000-000000000301",
  tiredState: "00000000-0000-4000-8000-000000000302",
  injuredState: "00000000-0000-4000-8000-000000000303",
} as const;

export function resolveDemoProjectId(value: string): string {
  return value === "demo" ? DEMO_IDS.project : value;
}

export function resolveDemoShotId(value: string): string {
  const map: Record<string, string> = {
    "shot-01": DEMO_IDS.shot1,
    "shot-02": DEMO_IDS.shot2,
    "shot-03": DEMO_IDS.shot3,
    "shot-04": DEMO_IDS.shot4,
  };
  return map[value] ?? value;
}

export function routeForDemoShotId(value: string): string {
  const map: Record<string, string> = {
    [DEMO_IDS.shot1]: "shot-01",
    [DEMO_IDS.shot2]: "shot-02",
    [DEMO_IDS.shot3]: "shot-03",
    [DEMO_IDS.shot4]: "shot-04",
  };
  return map[value] ?? value;
}
