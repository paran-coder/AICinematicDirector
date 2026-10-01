"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function GenerateShotButton({ projectId, shotId }: { projectId: string; shotId: string }) {
  const router = useRouter();
  const [label, setLabel] = useState("이 샷 생성 →");
  const [busy, setBusy] = useState(false);

  async function generate() {
    if (busy) return;
    setBusy(true);
    setLabel("생성 준비 중...");
    try {
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, shotId }),
      });
      if (!response.ok) throw new Error((await response.json().catch(()=>({})))?.error ?? "submit failed");
      const job = await response.json() as { id: string };
      for (let attempt = 0; attempt < 120; attempt += 1) {
        await sleep(1000);
        const statusResponse = await fetch(`/api/generations/${job.id}`, { cache: "no-store" });
        if (!statusResponse.ok) throw new Error("status failed");
        const status = await statusResponse.json();
        if (status.status === "queued") setLabel("대기 중...");
        if (status.status === "generating") setLabel(`생성 중${typeof status.progress === "number" ? ` ${status.progress}%` : "..."}`);
        if (status.status === "success") {
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
