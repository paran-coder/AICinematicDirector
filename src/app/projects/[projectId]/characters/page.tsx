import { CharacterScreen } from "@/components/character/character-screen";
import { AppShell } from "@/components/shell/app-shell";

export default async function CharacterPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return (
    <AppShell active="character" crumbs={["The Last Cassette", "캐릭터"]}>
      <CharacterScreen projectId={projectId} />
    </AppShell>
  );
}
