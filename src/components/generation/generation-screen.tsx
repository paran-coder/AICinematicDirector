"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { GenerationViewItem } from "@/domain/generation/types";
import {
  getLocalAspectRatio,
  getLocalGenerations,
  getLocalShot,
  saveLocalGeneration,
  selectLocalGeneration,
  updateLocalGeneration,
} from "@/lib/local-project-store";

const fallbackThumb = "/fixtures/shot-medium.jpg";
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function statusLabel(status?: string) {
  if (status === "success") return "생성 완료";
  if (status === "generating") return "생성 중";
  if (status === "queued") return "대기 중";
  if (status === "cancelled") return "취소됨";
  if (status === "error") return "생성 실패";
  return status ?? "준비됨";
}

export function GenerationScreen({ projectId }: { projectId: string }) {
  const [localItems, setLocalItems] = useState<GenerationViewItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<"regenerate" | "select" | "cancel" | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const items = await getLocalGenerations(projectId);
        if (!active) return;
        setLocalItems(items);
        setSelectedId(items.find((item) => item.selected)?.id ?? items[0]?.id ?? "");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [projectId]);

  const selected = localItems.find((item) => item.id === selectedId) ?? localItems[0];
  const versions = useMemo(() => selected ? localItems.filter((item) => item.shotId === selected.shotId).sort((a, b) => b.version - a.version) : [], [localItems, selected]);
  const selectedVideo = selected?.outputUrl ?? "/fixtures/mock-shot-02.mp4";
  const selectedThumb = selected?.thumbnailUrl ?? fallbackThumb;
  const isRunning = selected?.status === "queued" || selected?.status === "generating";

  async function regenerate() {
    if (!selected || busyAction) return;
    setBusyAction("regenerate");
    setNotice("같은 연출로 새 버전을 생성하고 있습니다.");
    try {
      const [localShot, localAspectRatio] = await Promise.all([
        getLocalShot(projectId, selected.shotRouteId),
        getLocalAspectRatio(projectId),
      ]);
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          shotId: selected.shotRouteId,
          draft: localShot?.draft,
          aspectRatio: localAspectRatio,
        }),
      });
      const body = await response.json().catch(() => ({})) as { id?: string; error?: string };
      if (!response.ok || !body.id) throw new Error(body.error ?? "재생성 요청에 실패했습니다.");

      for (let attempt = 0; attempt < 120; attempt += 1) {
        await sleep(1000);
        const statusResponse = await fetch(`/api/generations/${body.id}`, { cache: "no-store" });
        const status = await statusResponse.json().catch(() => ({})) as { status?: string; progress?: number; outputUrl?: string; thumbnailUrl?: string; error?: { message?: string } };
        if (!statusResponse.ok) throw new Error("생성 상태를 확인하지 못했습니다.");
        if (status.status === "queued" || status.status === "generating") {
          setNotice(`새 버전 생성 중${typeof status.progress === "number" ? ` · ${status.progress}%` : ""}`);
          continue;
        }
        if (status.status === "success") {
          const nextVersion = Math.max(0, ...localItems.filter((item) => item.shotId === selected.shotId).map((item) => item.version)) + 1;
          const newItem: GenerationViewItem = {
            ...selected,
            id: body.id,
            version: nextVersion,
            status: "success",
            selected: false,
            outputUrl: status.outputUrl ?? selected.outputUrl ?? "/fixtures/mock-shot-02.mp4",
            thumbnailUrl: status.thumbnailUrl ?? selected.thumbnailUrl ?? fallbackThumb,
            createdAt: new Date().toISOString(),
          };
          const next = await saveLocalGeneration(projectId, newItem);
          setLocalItems(next);
          setSelectedId(newItem.id);
          setNotice("새 버전 생성이 완료되었습니다.");
          return;
        }
        throw new Error(status.error?.message ?? "영상 생성이 중단되었습니다.");
      }
      throw new Error("생성 시간이 제한을 초과했습니다.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "재생성에 실패했습니다.");
    } finally {
      setBusyAction(null);
    }
  }

  async function useVersion() {
    if (!selected || selected.status !== "success" || busyAction) return;
    setBusyAction("select");
    setNotice("선택한 버전을 적용하고 있습니다.");
    try {
      const next = await selectLocalGeneration(projectId, selected.id, selected.shotId);
      setLocalItems(next);
      setNotice("이 버전을 현재 샷의 사용 버전으로 지정했습니다.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "버전 선택에 실패했습니다.");
    } finally {
      setBusyAction(null);
    }
  }

  async function cancel() {
    if (!selected || !isRunning || busyAction) return;
    setBusyAction("cancel");
    setNotice("생성을 취소하고 있습니다.");
    try {
      const response = await fetch(`/api/generations/${selected.id}`, { method: "DELETE" });
      const body = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "생성을 취소하지 못했습니다.");
      const next = await updateLocalGeneration(projectId, selected.id, { status: "cancelled" });
      setLocalItems(next);
      setNotice("생성이 취소되었습니다.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "취소에 실패했습니다.");
    } finally {
      setBusyAction(null);
    }
  }

  return <main className="stage"><div className="generation-workspace">
    <aside className="generation-list"><div className="stage-heading"><span className="eyebrow">생성</span><h2>생성 기록</h2><small>이 브라우저의 IndexedDB에 저장됨</small></div>
      {loading ? <div className="empty-inline">로컬 생성 기록을 불러오는 중입니다.</div> : localItems.length ? localItems.map((item)=><button type="button" key={item.id} onClick={() => setSelectedId(item.id)} className={`generation-card ${item.id===selected?.id?'is-selected':''}`}><Image src={item.thumbnailUrl ?? fallbackThumb} alt="" width={88} height={60} sizes="88px"/><div><strong>샷 {String(item.shotOrder).padStart(2,"0")} · {item.shotTitle}</strong><small>{statusLabel(item.status)} · V{item.version}{item.selected ? " · 사용 중" : ""}</small></div></button>) : <div className="empty-inline">아직 생성 결과가 없습니다. 샷 화면에서 첫 영상을 생성해 주세요.</div>}
    </aside>
    <section className="generation-preview"><div className="stage-heading"><span className="eyebrow">생성 결과</span><h1>{selected ? `샷 ${String(selected.shotOrder).padStart(2,"0")} · ${selected.shotTitle}` : "생성 결과 없음"}</h1><p>{selected ? `버전 ${selected.version} · ${statusLabel(selected.status)}${selected.selected ? " · 사용 중" : ""}` : "샷 화면에서 영상을 생성해 주세요."}</p></div>
      <div className="preview-media">{selected?.status === "success" ? <video controls poster={selectedThumb} preload="metadata"><source src={selectedVideo} type="video/mp4"/>생성 결과 영상을 재생할 수 없습니다.</video> : <div className="generation-placeholder"><strong>{statusLabel(selected?.status)}</strong><span>생성이 완료되면 이 영역에 영상이 표시됩니다.</span></div>}</div>
      <div className="version-row">{versions.slice(0,4).map((item)=><button type="button" key={item.id} onClick={() => setSelectedId(item.id)} className={`version-card ${item.id===selected?.id?'is-selected':''}`}><Image src={item.thumbnailUrl ?? fallbackThumb} alt="" width={160} height={90} sizes="160px"/><strong>V{item.version}{item.selected ? " · 사용 중" : ""}</strong><small>{statusLabel(item.status)}</small></button>)}{selected ? <button type="button" className="version-card" onClick={regenerate} disabled={!!busyAction}><div className="version-empty">＋</div><strong>다시 생성</strong><small>같은 연출 유지</small></button> : null}</div>
    </section>
    <aside className="generation-actions"><h2>결과 검토</h2><p>결과와 선택 상태는 이 브라우저에만 저장됩니다.</p>{notice ? <div className="action-notice" role="status">{notice}</div> : null}<button className="secondary-action" onClick={regenerate} disabled={!selected || !!busyAction}>{busyAction === "regenerate" ? "생성 중..." : "같은 연출로 다시 생성"}</button>{isRunning ? <button className="secondary-action danger-action" onClick={cancel} disabled={!!busyAction}>{busyAction === "cancel" ? "취소 중..." : "생성 취소"}</button> : null}<Link className="secondary-link" href={`/projects/${projectId}/shots/${selected?.shotRouteId ?? "shot-02"}`}>샷 수정</Link><button className="primary-button" onClick={useVersion} disabled={!selected || selected.status !== "success" || !!busyAction || selected.selected}>{selected?.selected ? "사용 중인 버전" : busyAction === "select" ? "적용 중..." : "이 버전 사용"}</button></aside>
  </div></main>;
}
