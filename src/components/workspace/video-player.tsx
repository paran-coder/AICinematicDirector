"use client";

import { useEffect, useRef, useState } from "react";

function Icon({ name }: { name: "play" | "pause" | "volume" | "muted" | "expand" }) {
  if (name === "play") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 7 8 5-8 5z"/></svg>;
  if (name === "pause") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7v10M15 7v10"/></svg>;
  if (name === "muted") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 10v4h3l4 3V7l-4 3H5zM16 10l4 4m0-4-4 4"/></svg>;
  if (name === "volume") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 10v4h3l4 3V7l-4 3H5zM15 9.5a4 4 0 0 1 0 5M17.5 7a7 7 0 0 1 0 10"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5m0-5 6 6M16 3h5v5m0-5-6 6M8 21H3v-5m0 5 6-6M16 21h5v-5m0 5-6-6"/></svg>;
}

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  return `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`;
}

export function VideoPlayer({ src, poster, durationHint }: { src: string; poster?: string; durationHint?: number }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationHint ?? 0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onLoaded = () => setDuration(Number.isFinite(video.duration) ? video.duration : (durationHint ?? 0));
    const onTime = () => setCurrentTime(video.currentTime);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onPause);
    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onPause);
    };
  }, [durationHint]);

  async function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) await video.play();
    else video.pause();
  }

  function seek(value: number) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value;
    setCurrentTime(value);
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  async function fullscreen() {
    if (rootRef.current?.requestFullscreen) await rootRef.current.requestFullscreen();
  }

  const safeDuration = duration || durationHint || 0;
  return <div className="video-player" ref={rootRef}>
    <video ref={videoRef} poster={poster} preload="metadata" playsInline onClick={togglePlay}><source src={src} type="video/mp4"/>생성 결과 영상을 재생할 수 없습니다.</video>
    <div className="video-controls">
      <button type="button" className="video-control-button" onClick={togglePlay} aria-label={playing ? "일시정지" : "재생"}><Icon name={playing ? "pause" : "play"}/></button>
      <span className="video-time">{formatTime(currentTime)} / {formatTime(safeDuration)}</span>
      <input className="video-progress" type="range" min={0} max={safeDuration || 1} step={0.01} value={Math.min(currentTime, safeDuration || 1)} onChange={(event) => seek(Number(event.target.value))} aria-label="영상 재생 위치"/>
      <button type="button" className="video-control-button" onClick={toggleMute} aria-label={muted ? "음소거 해제" : "음소거"}><Icon name={muted ? "muted" : "volume"}/></button>
      <button type="button" className="video-control-button" onClick={fullscreen} aria-label="전체 화면"><Icon name="expand"/></button>
    </div>
  </div>;
}
