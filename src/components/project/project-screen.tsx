"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ProjectOverviewData } from "@/data/project-repository";
import {
  downloadProjectBackup,
  getLocalProject,
  importProjectBackup,
  requestPersistentStorage,
  saveLocalProject,
  type LocalProjectDraft,
  type ProjectAspectRatio,
} from "@/lib/local-project-store";

type SaveState = "loading" | "saved" | "saving" | "error";

function saveLabel(state: SaveState) {
  if (state === "loading") return "로컬 데이터 불러오는 중...";
  if (state === "saving") return "저장 중...";
  if (state === "error") return "저장하지 못했습니다";
  return "✓ 이 브라우저에 저장됨";
}

export function ProjectScreen({ initial }: { initial: ProjectOverviewData }) {
  const initialAspectRatio: ProjectAspectRatio = initial.aspectRatio === "9:16" || initial.aspectRatio === "1:1" ? initial.aspectRatio : "16:9";
  const initialForm: LocalProjectDraft = {
    story: initial.story,
    duration: initial.duration,
    aspectRatio: initialAspectRatio,
    genre: initial.genre,
    visualDirection: initial.visualDirection,
  };
  const [form, setForm] = useState<LocalProjectDraft>(initialForm);
  const [saveState, setSaveState] = useState<SaveState>("loading");
  const [backupNotice, setBackupNotice] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        await requestPersistentStorage();
        const [saved, savedAspect] = await Promise.all([
          getLocalProject(initial.routeId),
          getLocalAspectRatio(initial.routeId),
        ]);
        if (!active) return;
        if (saved) setForm({ ...saved, aspectRatio: savedAspect ?? saved.aspectRatio });
        else if (savedAspect) setForm((current) => ({ ...current, aspectRatio: savedAspect }));
        setSaveState("saved");
      } catch {
        if (active) setSaveState("error");
      } finally {
        if (active) setHydrated(true);
      }
    })();
    return () => { active = false; };
  }, [initial.routeId]);

  useEffect(() => {
    if (!hydrated) return;
    setSaveState("saving");
    const timer = window.setTimeout(async () => {
      try {
        await Promise.all([
          saveLocalProject(initial.routeId, form),
          saveLocalAspectRatio(initial.routeId, form.aspectRatio),
        ]);
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [form, hydrated, initial.routeId]);

  useEffect(() => {
    const onAspect = (event: Event) => {
      const detail = (event as CustomEvent<{ projectId: string; aspectRatio: ProjectAspectRatio }>).detail;
      if (!detail || detail.projectId !== initial.routeId) return;
      setForm((current) => current.aspectRatio === detail.aspectRatio ? current : { ...current, aspectRatio: detail.aspectRatio });
    };
    window.addEventListener("acd:aspect-ratio", onAspect as EventListener);
    return () => window.removeEventListener("acd:aspect-ratio", onAspect as EventListener);
  }, [initial.routeId]);

  async function exportBackup() {
    try {
      await downloadProjectBackup(initial.routeId);
      setBackupNotice("프로젝트 백업 파일을 저장했습니다.");
    } catch (error) {
      setBackupNotice(error instanceof Error ? error.message : "백업 파일을 만들지 못했습니다.");
    }
  }

  async function importBackup(file?: File) {
    if (!file) return;
    try {
      await importProjectBackup(file, initial.routeId);
      setBackupNotice("백업을 복원했습니다. 화면을 다시 불러옵니다.");
      window.setTimeout(() => window.location.reload(), 400);
    } catch (error) {
      setBackupNotice(error instanceof Error ? error.message : "백업을 복원하지 못했습니다.");
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  }

  return <main className="stage"><section className="stage-card project-screen">
    <div className="stage-heading"><span className="eyebrow">프로젝트</span><h1>무엇을 만들고 싶으신가요?</h1><p>아이디어를 입력하면 캐릭터, 장소, 소품, 장면과 비주얼 방향을 준비합니다.</p></div>
    <label className="stack-field">스토리 아이디어<textarea value={form.story} onChange={(event)=>setForm({...form,story:event.target.value})}/></label>
    <div className="option-grid">
      <label>영상 길이<select value={form.duration} onChange={(event)=>setForm({...form,duration:Number(event.target.value)})}><option value={15}>15초</option><option value={30}>30초</option><option value={60}>60초</option></select></label>
      <label>화면 비율<select value={form.aspectRatio} onChange={(event)=>setForm({...form,aspectRatio:event.target.value})}><option>16:9</option><option>9:16</option><option>1:1</option></select></label>
      <label>장르<input value={form.genre} onChange={(event)=>setForm({...form,genre:event.target.value})}/></label>
      <label>비주얼 방향<input value={form.visualDirection} onChange={(event)=>setForm({...form,visualDirection:event.target.value})}/></label>
    </div>
    <div className="summary-grid"><article><span>캐릭터</span><strong>{initial.counts.characters || 1}명</strong><small>Mina</small></article><article><span>장소</span><strong>{initial.counts.locations || 3}개</strong><small>골목 · 오래된 상점 · 아파트</small></article><article><span>장면</span><strong>{initial.counts.scenes || 4}개</strong><small>스토리 구조</small></article></div>
    <div className="local-data-panel">
      <div><strong>로컬 저장</strong><p>편집 내용은 이 브라우저의 IndexedDB에 저장됩니다. 다른 기기로 옮기거나 브라우저 데이터를 지우기 전에 JSON 백업을 권장합니다.</p></div>
      <div className="local-data-actions">
        <button type="button" className="secondary-action compact-action" onClick={exportBackup}>백업 내보내기</button>
        <button type="button" className="secondary-action compact-action" onClick={() => importRef.current?.click()}>백업 가져오기</button>
        <input ref={importRef} className="visually-hidden" type="file" accept="application/json,.json" onChange={(event) => void importBackup(event.target.files?.[0])}/>
      </div>
      {backupNotice ? <small className="local-data-notice" role="status">{backupNotice}</small> : null}
    </div>
    <div className="stage-actions"><span className={`autosave ${saveState === "error" ? "is-error" : ""}`}>{saveLabel(saveState)}</span><Link className="primary-link" href={`/projects/${initial.routeId}/characters`}>캐릭터 확인 →</Link></div>
  </section></main>;
}
