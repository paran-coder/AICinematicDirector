"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ShotDirectionDraft } from "@/domain/workspace/types";
import { getLocalAspectRatio, getLocalGenerations, saveLocalGeneration } from "@/lib/local-project-store";
import type { GenerationViewItem } from "@/domain/generation/types";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function GenerateShotButton({
  projectId,
  shotId,
  draft,
  aspectRatio,
  shotTitle,
  shotOrder,
  thumbnailUrl,
}: {
  projectId: string;
  shotId: string;
  draft: ShotDirectionDraft;
  aspectRatio: string;
  shotTitle: string;
  shotOrder: number;
  thumbnailUrl: string;
}) {
  const router = useRouter();
  const [label, setLabel] = useState("이 샷 생성 →");
  const [busy, setBusy] = useState(false);

  async function generate() {
    if (busy) return;
    setBusy(true);
    setLabel("생성 준비 중...");
    try {
      const localAspectRatio = await getLocalAspectRatio(projectId);
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          shotId,
          draft,
          aspectRatio: localAspectRatio ?? aspectRatio,
        }),
      });
      const submitted = await response.json().catch(() => ({})) as { id?: string; error?: string };
      if (!response.ok || !submitted.id) throw new Error(submitted.error ?? "submit failed");

      for (let attempt = 0; attempt < 120; attempt += 1) {
        await sleep(1000);
        const statusResponse = await fetch(`/api/generations/${submitted.id}`, { cache: "no-store" });
        if (!statusResponse.ok) throw new Error("status failed");
        const status = await statusResponse.json() as { status?: string; progress?: number; outputUrl?: string; thumbnailUrl?: string; error?: { message?: string } };
        if (status.status === "queued") setLabel("대기 중...");
        if (status.status === "generating") setLabel(`생성 중${typeof status.progress === "number" ? ` ${status.progress}%` : "..."}`);
        if (status.status === "success") {
          const existing = await getLocalGenerations(projectId);
          const sameShot = existing.filter((item) => item.shotId === shotId);
          const nextVersion = Math.max(0, ...sameShot.map((item) => item.version)) + 1;
          const item: GenerationViewItem = {
            id: submitted.id,
            shotId,
            shotRouteId: shotId,
            shotTitle,
            shotOrder,
            status: "success",
            version: nextVersion,
            selected: sameShot.length === 0,
            outputUrl: status.outputUrl ?? "/fixtures/mock-shot-02.mp4",
            thumbnailUrl: status.thumbnailUrl ?? thumbnailUrl,
            createdAt: new Date().toISOString(),
          };
          await saveLocalGeneration(projectId, item);
          setLabel("완료");
          router.push(`/projects/${projectId}/generations`);
          return;
        }
        if (status.status === "error" || status.status === "cancelled") throw new Error(status.error?.message ?? "generation stopped");
      }
      throw new Error("generation timeout");
    } catch {
      setBusy(false);
      setLabel("다시 시도");
    }
  }

  return <button className="primary-button" onClick={generate} disabled={busy} aria-busy={busy}>{label}</button>;
}
