import type { ShotWorkspaceData } from "@/domain/workspace/types";
import { createDemoWorkspace } from "@/data/demo-workspace";
import { demoProject } from "@/test/fixtures/the-last-cassette";

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
  persistence: "local";
};

export async function getShotWorkspace(projectRouteId: string, shotRouteId: string): Promise<ShotWorkspaceData> {
  return createDemoWorkspace(projectRouteId, shotRouteId);
}

export async function getProjectOverview(projectRouteId: string): Promise<ProjectOverviewData> {
  const fixture = createDemoWorkspace(projectRouteId, "shot-02");
  return {
    id: fixture.project.id,
    routeId: projectRouteId,
    name: fixture.project.name,
    story: demoProject.story,
    duration: demoProject.duration,
    aspectRatio: demoProject.aspectRatio,
    genre: demoProject.genre,
    visualDirection: demoProject.visualDirection,
    counts: { characters: 1, locations: 3, scenes: 4 },
    persistence: "local",
  };
}
