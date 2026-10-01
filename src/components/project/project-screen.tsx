"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ProjectOverviewData } from "@/data/project-repository";

export function ProjectScreen({ initial }: { initial: ProjectOverviewData }) {
  const [form, setForm] = useState({ story: initial.story, duration: initial.duration, aspectRatio: initial.aspectRatio, genre: initial.genre, visualDirection: initial.visualDirection });
  const [saveState, setSaveState] = useState(initial.persistence === "database" ? "✓ 자동 저장됨" : "미리보기 모드 · DB 미연결");
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    setSaveState(initial.persistence === "database" ? "저장 중..." : "미리보기 모드 · DB 미연결");
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/projects/${initial.routeId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form), signal: controller.signal });
        if (!response.ok) throw new Error("save failed");
        const result = await response.json() as { persisted: boolean };
        setSaveState(result.persisted ? "✓ 자동 저장됨" : "미리보기 모드 · DB 미연결");
      } catch (error) { if ((error as Error).name !== "AbortError") setSaveState("저장하지 못했습니다"); }
    }, 700);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [form, initial.persistence, initial.routeId]);

  return <main className="stage"><section className="stage-card project-screen"><div className="stage-heading"><span className="eyebrow">프로젝트</span><h1>무엇을 만들고 싶으신가요?</h1><p>아이디어를 입력하면 캐릭터, 장소, 소품, 장면과 비주얼 방향을 준비합니다.</p></div>
    <label className="stack-field">스토리 아이디어<textarea value={form.story} onChange={(event)=>setForm({...form,story:event.target.value})}/></label>
    <div className="option-grid"><label>영상 길이<select value={form.duration} onChange={(event)=>setForm({...form,duration:Number(event.target.value)})}><option value={15}>15초</option><option value={30}>30초</option><option value={60}>60초</option></select></label><label>화면 비율<select value={form.aspectRatio} onChange={(event)=>setForm({...form,aspectRatio:event.target.value})}><option>16:9</option><option>9:16</option><option>1:1</option></select></label><label>장르<input value={form.genre} onChange={(event)=>setForm({...form,genre:event.target.value})}/></label><label>비주얼 방향<input value={form.visualDirection} onChange={(event)=>setForm({...form,visualDirection:event.target.value})}/></label></div>
    <div className="summary-grid"><article><span>캐릭터</span><strong>{initial.counts.characters || 1}명</strong><small>Mina</small></article><article><span>장소</span><strong>{initial.counts.locations || 3}개</strong><small>골목 · 오래된 상점 · 아파트</small></article><article><span>장면</span><strong>{initial.counts.scenes || 4}개</strong><small>스토리 구조</small></article></div>
    <div className="stage-actions"><span className="autosave">{saveState}</span><Link className="primary-link" href={`/projects/${initial.routeId}/characters`}>캐릭터 확인 →</Link></div></section></main>;
}
