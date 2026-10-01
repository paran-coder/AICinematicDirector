import assert from "node:assert/strict";
import { closeDb, isDatabaseConfigured } from "../src/db";
import { getProjectOverview, getShotWorkspace, updateProjectOverview, updateShotDraft } from "../src/data/project-repository";

async function main() {
  assert.ok(isDatabaseConfigured(), "DATABASE_URL is required for DB verification");

  const project = await getProjectOverview("demo");
  assert.equal(project.persistence, "database");
  await updateProjectOverview("demo", {
    story: project.story,
    duration: project.duration,
    aspectRatio: project.aspectRatio,
    genre: project.genre,
    visualDirection: project.visualDirection,
  });
  const projectAgain = await getProjectOverview("demo");
  assert.equal(projectAgain.story, project.story);
  assert.equal(projectAgain.aspectRatio, project.aspectRatio);

  const workspace = await getShotWorkspace("demo", "shot-02");
  assert.equal(workspace.persistence, "database");
  const saved = await updateShotDraft("demo", "shot-02", workspace.shot.draft, workspace.shot.rawOverrides);
  assert.equal(saved.persisted, true);
  const workspaceAgain = await getShotWorkspace("demo", "shot-02");
  assert.equal(workspaceAgain.shot.draft.action, workspace.shot.draft.action);
  assert.equal(workspaceAgain.shot.draft.lens, workspace.shot.draft.lens);

  console.log("Database round-trip verification: passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(closeDb);
