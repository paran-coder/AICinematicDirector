import { AppShell } from "@/components/shell/app-shell";
import { ProjectScreen } from "@/components/project/project-screen";
import { getProjectOverview } from "@/data/project-repository";

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await getProjectOverview(projectId);
  return <AppShell active="project" crumbs={[project.name,"프로젝트"]}><ProjectScreen initial={project}/></AppShell>;
}
