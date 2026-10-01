"use client";

import Image from "next/image";
import { useState } from "react";
import type { ShotDirectionDraft } from "@/domain/workspace/types";
import { VideoPlayer } from "./video-player";

type PreviewMode = "first-frame" | "result";

export function PreviewSurface({ image, duration, draft, videoSrc = "/fixtures/mock-shot-02.mp4" }: { image: string; duration: number; draft: ShotDirectionDraft; videoSrc?: string }) {
  const [mode, setMode] = useState<PreviewMode>("first-frame");
  const frames = Array.from({ length: 7 }, () => image);

  return <div className="preview-block">
    <div className="preview-toolbar" aria-label="미리보기 모드">
      <div className="preview-mode-tabs" role="tablist" aria-label="미리보기 선택">
        <button type="button" role="tab" aria-selected={mode === "first-frame"} className={mode === "first-frame" ? "is-active" : ""} onClick={() => setMode("first-frame")}>첫 프레임</button>
        <button type="button" role="tab" aria-selected={mode === "result"} className={mode === "result" ? "is-active" : ""} onClick={() => setMode("result")}>생성 결과</button>
      </div>
      <span className="preview-mode-note">{mode === "first-frame" ? "생성 전 구도와 일관성을 확인합니다." : "최근 생성 결과를 확인합니다."}</span>
    </div>

    <div className={`preview-media ${mode === "first-frame" ? "is-still" : "is-video"}`}>
      {mode === "first-frame"
        ? <Image src={image} alt="현재 샷의 첫 프레임" fill priority sizes="(max-width: 1024px) 100vw, 55vw" />
        : <VideoPlayer src={videoSrc} poster={image} durationHint={duration} />}
    </div>

    {mode === "result" && <div className="filmstrip" aria-label="생성 결과 프레임">
      <button type="button" className="icon-only" aria-label="이전 프레임">‹</button>
      {frames.map((frame, i) => <Image key={i} className={i === 0 ? "is-active" : ""} src={frame} alt="" width={96} height={54} sizes="96px" />)}
      <button type="button" className="icon-only" aria-label="다음 프레임">›</button>
    </div>}

    <div className="shot-meta" aria-label="현재 샷 설정 요약">
      <span>{duration}초</span><span>24fps</span><span>{draft.shotSize}</span><span>{draft.lens}</span><span>{draft.angle}</span><span>{draft.cameraMovement.replace(" (Slow Dolly In)", "")}</span>
    </div>
  </div>;
}
