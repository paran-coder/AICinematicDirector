import { GenerationScreen } from "@/components/generation/generation-screen";
import { AppShell } from "@/components/shell/app-shell";
import { getGenerationView } from "@/server/generation-service";

export default async function GenerationPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const view = await getGenerationView(projectId);
  return <AppShell active="generate" crumbs={["The Last Cassette","생성"]}><GenerationScreen items={view.items} projectId={projectId} persistence={view.persistence}/></AppShell>;
}
