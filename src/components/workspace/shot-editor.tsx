"use client";

import { useEffect, useState } from "react";
import { evaluateShotConsistency } from "@/domain/consistency/shot-consistency";
import type { ConsistencySummary, ShotDirectionDraft, ShotWorkspaceData } from "@/domain/workspace/types";
import { getLocalShot, requestPersistentStorage, saveLocalShot } from "@/lib/local-project-store";
import { BrowserPanel } from "./browser-panel";
import { ConsistencyBar } from "./consistency-bar";
import { Inspector } from "./inspector";
import { PreviewSurface } from "./preview-surface";
import { WorkspaceHeader } from "./workspace-header";

type SaveState = "loading" | "saved" | "saving" | "error";

export function ShotEditor({ initial }: { initial: ShotWorkspaceData }) {
  const [draft, setDraft] = useState(initial.shot.draft);
  const [rawOverrides, setRawOverrides] = useState(initial.shot.rawOverrides);
  const [consistency, setConsistency] = useState<ConsistencySummary>(initial.consistency);
  const [saveState, setSaveState] = useState<SaveState>("loading");
  const [hydrated, setHydrated] = useState(false);

  function resolve(nextDraft: ShotDirectionDraft, nextOverrides = rawOverrides) {
    return evaluateShotConsistency({
      canon: initial.character.canon,
      sceneStates: initial.character.sceneStates,
      sceneOverrides: initial.character.sceneOverrides,
      sceneEnvironment: initial.scene.environment,
      draft: nextDraft,
      rawOverrides: nextOverrides,
    });
  }

  function update<K extends keyof ShotDirectionDraft>(key: K, value: ShotDirectionDraft[K]) {
    setDraft((current) => {
      const next = { ...current, [key]: value };
      setConsistency(resolve(next));
      return next;
    });
  }

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        await requestPersistentStorage();
        const saved = await getLocalShot(initial.project.routeId, initial.shot.routeId);
        if (!active) return;
        if (saved) {
          setDraft(saved.draft);
          setRawOverrides(saved.rawOverrides);
          setConsistency(resolve(saved.draft, saved.rawOverrides));
        }
        setSaveState("saved");
      } catch {
        if (active) setSaveState("error");
      } finally {
        if (active) setHydrated(true);
      }
    })();
    return () => { active = false; };
  }, [initial.project.routeId, initial.shot.routeId]);

  useEffect(() => {
    if (!hydrated) return;
    setSaveState("saving");
    const timer = window.setTimeout(async () => {
      try {
        await saveLocalShot(initial.project.routeId, initial.shot.routeId, { draft, rawOverrides });
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [draft, rawOverrides, hydrated, initial.project.routeId, initial.shot.routeId]);

  return <main className="workspace"><div className="workspace-grid">
    <BrowserPanel projectId={initial.project.routeId} scene={initial.scene} shots={initial.shots} selectedShotId={initial.shot.routeId}/>
    <section className="canvas-panel">
      <WorkspaceHeader title={`샷 ${String(initial.shot.routeId.match(/\d+/)?.[0] ?? initial.shot.routeId).padStart(2,"0")}  ${draft.shotSize}`} description={draft.action}/>
      <PreviewSurface image={initial.shot.firstFrameUrl} duration={initial.shot.duration} draft={draft}/>
    </section>
    <Inspector draft={draft} onChange={update}/>
  </div><ConsistencyBar
    consistency={consistency}
    saveState={saveState}
    projectId={initial.project.routeId}
    shotId={initial.shot.routeId}
    draft={draft}
    aspectRatio={initial.project.aspectRatio}
    shotTitle={initial.shot.title}
    shotOrder={initial.shots.find((item) => item.routeId === initial.shot.routeId)?.order ?? 1}
    thumbnailUrl={initial.shot.firstFrameUrl}
  /></main>;
}
