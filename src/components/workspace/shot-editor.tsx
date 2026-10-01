"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserPanel } from "./browser-panel";
import { ConsistencyBar } from "./consistency-bar";
import { Inspector } from "./inspector";
import { PreviewSurface } from "./preview-surface";
import { WorkspaceHeader } from "./workspace-header";
import type { ConsistencySummary, ShotDirectionDraft, ShotWorkspaceData } from "@/domain/workspace/types";

type SaveState = "saved" | "saving" | "error" | "fixture";

export function ShotEditor({ initial }: { initial: ShotWorkspaceData }) {
  const [draft, setDraft] = useState(initial.shot.draft);
  const [consistency, setConsistency] = useState<ConsistencySummary>(initial.consistency);
  const [saveState, setSaveState] = useState<SaveState>(initial.persistence === "database" ? "saved" : "fixture");
  const mounted = useRef(false);

  function update<K extends keyof ShotDirectionDraft>(key: K, value: ShotDirectionDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setSaveState(initial.persistence === "database" ? "saving" : "fixture");
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/projects/${initial.project.routeId}/shots/${initial.shot.routeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ draft, rawOverrides: initial.shot.rawOverrides }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("autosave failed");
        const result = await response.json() as { consistency: ConsistencySummary; persisted: boolean };
        setConsistency(result.consistency);
        setSaveState(result.persisted ? "saved" : "fixture");
      } catch (error) {
        if ((error as Error).name !== "AbortError") setSaveState("error");
      }
    }, 700);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [draft, initial.persistence, initial.project.routeId, initial.shot.rawOverrides, initial.shot.routeId]);

  return <main className="workspace"><div className="workspace-grid">
    <BrowserPanel projectId={initial.project.routeId} scene={initial.scene} shots={initial.shots} selectedShotId={initial.shot.routeId}/>
    <section className="canvas-panel">
      <WorkspaceHeader title={`샷 ${String(initial.shot.routeId.match(/\d+/)?.[0] ?? initial.shot.routeId).padStart(2,"0")}  ${draft.shotSize}`} description={draft.action}/>
      <PreviewSurface image={initial.shot.firstFrameUrl} duration={initial.shot.duration} draft={draft}/>
    </section>
    <Inspector draft={draft} onChange={update}/>
  </div><ConsistencyBar consistency={consistency} saveState={saveState} projectId={initial.project.routeId} shotId={initial.shot.routeId}/></main>;
}
