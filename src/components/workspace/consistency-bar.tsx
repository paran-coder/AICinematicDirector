import { CheckIcon } from "@/components/icons";
import { GenerateShotButton } from "@/components/generation/generate-shot-button";
import type { ConsistencySummary } from "@/domain/workspace/types";

type SaveState = "saved" | "saving" | "error" | "fixture";

function saveLabel(state: SaveState) {
  if (state === "saving") return "저장 중...";
  if (state === "error") return "저장하지 못했습니다";
  if (state === "fixture") return "미리보기 모드 · DB 미연결";
  return "✓ 자동 저장됨";
}

export function ConsistencyBar({ consistency, saveState, projectId, shotId }: { consistency: ConsistencySummary; saveState: SaveState; projectId: string; shotId: string }) {
  const hasAttention = consistency.warnings.length > 0 || consistency.autoRestored.length > 0;
  const summary = hasAttention ? `확인 ${consistency.warnings.length} · 자동 복원 ${consistency.autoRestored.length}` : "5개 항목 모두 일치합니다.";
  return <footer className={`consistency-bar ${hasAttention ? "has-warning" : ""}`}>
    <div className="consistency-summary"><span className="success-icon"><CheckIcon/></span><strong>일관성 검사</strong><span>{summary}</span></div>
    <div className="consistency-tags"><span>✓ 캐릭터</span><span>✓ 의상</span><span>✓ 장소</span><span>✓ 소품</span><span>✓ 스타일</span></div>
    {hasAttention && <details className="consistency-details"><summary>자세히 보기</summary><div>{consistency.autoRestored.map((item)=><p key={`restore-${item.path}`}><strong>자동 복원</strong> {item.path}: 기준값을 유지했습니다.</p>)}{consistency.warnings.map((item)=><p key={`warn-${item.path}`}><strong>확인 필요</strong> {item.path}: {item.reason}</p>)}</div></details>}
    <div className={`save-state ${saveState === "error" ? "is-error" : ""}`}>{saveLabel(saveState)}</div><GenerateShotButton projectId={projectId} shotId={shotId}/>
  </footer>;
}
