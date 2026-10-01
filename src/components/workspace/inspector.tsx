"use client";

import { useMemo, useState } from "react";
import { AssetReference } from "@/components/assets/asset-reference";
import type { ShotDirectionDraft } from "@/domain/workspace/types";

type Props = { draft: ShotDirectionDraft; onChange: <K extends keyof ShotDirectionDraft>(key: K, value: ShotDirectionDraft[K]) => void };
type InspectorTab = "direction" | "advanced";

function Option({ value }: { value: string }) { return <option value={value}>{value}</option>; }

export function Inspector({ draft, onChange }: Props) {
  const [activeTab, setActiveTab] = useState<InspectorTab>("direction");
  const [promptOpen, setPromptOpen] = useState(false);
  const promptPreview = useMemo(() => [
    `Mina, ${draft.expression} 표정, 시선 ${draft.gaze}.`,
    draft.action,
    `${draft.shotSize}, ${draft.cameraMovement}, ${draft.angle}, ${draft.lens}.`,
    `초점 ${draft.focus}, 카메라 흔들림 ${draft.shake}.`,
    `${draft.baseLight}, ${draft.fillLight}, ${draft.timeOfDay}, ${draft.weather}.`,
  ].join("\n"), [draft]);

  return <aside className="inspector">
    <div className="inspector-tabs">
      <button type="button" className={activeTab === "direction" ? "is-active" : ""} onClick={() => setActiveTab("direction")}>연출 설정</button>
      <button type="button" className={activeTab === "advanced" ? "is-active" : ""} onClick={() => setActiveTab("advanced")}>고급 설정</button>
      <button type="button" className="inspector-more" aria-label="추가 메뉴" aria-expanded={promptOpen} onClick={() => setPromptOpen((value) => !value)}>•••</button>
    </div>

    <div className="inspector-scroll">
      {activeTab === "direction" ? <>
        <section className="inspector-section"><h2>연기</h2><p>캐릭터의 행동과 감정을 설정합니다.</p><AssetReference/>
          <label>행동<textarea value={draft.action} onChange={(event)=>onChange("action", event.target.value)}/></label>
          <div className="field-grid"><label>표정<select value={draft.expression} onChange={(event)=>onChange("expression", event.target.value)}><Option value={draft.expression}/><option>차분한</option><option>놀란</option><option>긴장한</option></select></label><label>시선<select value={draft.gaze} onChange={(event)=>onChange("gaze", event.target.value)}><Option value={draft.gaze}/><option>정면</option><option>오른쪽</option></select></label></div>
        </section>
        <section className="inspector-section"><h2>카메라</h2><p>카메라의 구도와 움직임을 설정합니다.</p>
          <span className="field-label">샷 크기</span><div className="segments">{["클로즈업","미디엄 샷","와이드 샷","기타"].map((value)=><button type="button" key={value} className={draft.shotSize===value?"is-active":""} onClick={()=>onChange("shotSize", value)}>{value}</button>)}</div>
          <label>카메라 움직임<select value={draft.cameraMovement} onChange={(event)=>onChange("cameraMovement", event.target.value)}><Option value={draft.cameraMovement}/><option>고정</option><option>느린 팬</option><option>핸드헬드</option></select></label>
          <label>앵글<select value={draft.angle} onChange={(event)=>onChange("angle", event.target.value)}><Option value={draft.angle}/><option>로우 앵글</option><option>하이 앵글</option></select></label>
        </section>
        <section className="inspector-section"><h2>조명과 환경</h2><p>장면의 분위기를 설정합니다.</p><div className="field-grid"><label>기본 조명<select value={draft.baseLight} onChange={(event)=>onChange("baseLight", event.target.value)}><Option value={draft.baseLight}/><option>부드러운 자연광</option></select></label><label>보조 조명<select value={draft.fillLight} onChange={(event)=>onChange("fillLight", event.target.value)}><Option value={draft.fillLight}/><option>없음</option></select></label><label>시간대<select value={draft.timeOfDay} onChange={(event)=>onChange("timeOfDay", event.target.value)}><Option value={draft.timeOfDay}/><option>낮</option><option>새벽</option></select></label><label>날씨<select value={draft.weather} onChange={(event)=>onChange("weather", event.target.value)}><Option value={draft.weather}/><option>약한 비</option><option>맑음</option></select></label></div></section>
      </> : <section className="inspector-section advanced-panel"><h2>고급 카메라 설정</h2><p>필요한 경우에만 렌즈와 초점, 흔들림을 조정합니다.</p>
        <label>렌즈<select value={draft.lens} onChange={(event)=>onChange("lens", event.target.value)}><Option value={draft.lens}/><option>50mm</option><option>85mm</option></select></label>
        <label>초점 대상<select value={draft.focus} onChange={(event)=>onChange("focus", event.target.value)}><Option value={draft.focus}/><option>배경</option><option>카세트 플레이어</option></select></label>
        <label>흔들림<select value={draft.shake} onChange={(event)=>onChange("shake", event.target.value)}><Option value={draft.shake}/><option>없음</option><option>중간</option></select></label>
        <div className="advanced-summary"><span>현재 연출</span><strong>{draft.shotSize} · {draft.lens} · {draft.angle}</strong><small>{draft.cameraMovement}</small></div>
      </section>}
    </div>

    {promptOpen && <div className="prompt-drawer" role="dialog" aria-label="프롬프트 보기">
      <div className="prompt-drawer-header"><div><span className="eyebrow">보조 정보</span><h2>프롬프트 보기</h2></div><button type="button" className="icon-only" aria-label="프롬프트 닫기" onClick={() => setPromptOpen(false)}>×</button></div>
      <p>최종 프롬프트는 일관성 검사 후 서버에서 다시 컴파일됩니다.</p>
      <pre>{promptPreview}</pre>
    </div>}
  </aside>;
}
