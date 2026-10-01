import { GenerationScreen } from "@/components/generation/generation-screen";
import { AppShell } from "@/components/shell/app-shell";

export default async function GenerationPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <AppShell active="generate" crumbs={["The Last Cassette","생성"]}><GenerationScreen projectId={projectId}/></AppShell>;
}
