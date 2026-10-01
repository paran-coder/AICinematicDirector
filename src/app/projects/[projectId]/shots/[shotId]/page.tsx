import { AppShell } from "@/components/shell/app-shell";
import { ShotEditor } from "@/components/workspace/shot-editor";
import { getShotWorkspace } from "@/data/project-repository";

export default async function ShotPage({ params }: { params: Promise<{ projectId: string; shotId: string }> }) {
  const { projectId, shotId } = await params;
  const workspace = await getShotWorkspace(projectId, shotId);
  return <AppShell active="shot" crumbs={[workspace.project.name, `장면 ${String(workspace.scene.order).padStart(2,"0")}`, workspace.scene.title, workspace.shot.title]}><ShotEditor initial={workspace}/></AppShell>;
}
