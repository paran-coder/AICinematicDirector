"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  getLocalAspectRatio,
  getLocalProject,
  saveLocalAspectRatio,
  type ProjectAspectRatio,
} from "@/lib/local-project-store";

type Menu = "aspect" | "settings" | null;
type ThemeChoice = "system" | "light" | "dark";

const aspectOptions: Array<{ value: ProjectAspectRatio; label: string; description: string }> = [
  { value: "16:9", label: "16:9", description: "가로형" },
  { value: "9:16", label: "9:16", description: "세로형" },
  { value: "1:1", label: "1:1", description: "정사각형" },
];

function projectIdFromPath(pathname: string): string | undefined {
  const match = pathname.match(/^\/projects\/([^/]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

function cssAspect(value: ProjectAspectRatio): string {
  if (value === "9:16") return "9 / 16";
  if (value === "1:1") return "1 / 1";
  return "16 / 9";
}

function applyTheme(choice: ThemeChoice) {
  if (typeof document === "undefined") return;
  if (choice === "system") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = choice;
}

export function TopbarControls({ active, showAspect = true }: { active: string; showAspect?: boolean }) {
  const pathname = usePathname();
  const projectId = projectIdFromPath(pathname);
  const [menu, setMenu] = useState<Menu>(null);
  const [aspectRatio, setAspectRatio] = useState<ProjectAspectRatio>("16:9");
  const [theme, setTheme] = useState<ThemeChoice>("system");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("acd-theme");
      const next: ThemeChoice = stored === "light" || stored === "dark" ? stored : "system";
      setTheme(next);
      applyTheme(next);
    } catch {
      setTheme("system");
    }
  }, []);

  useEffect(() => {
    if (!projectId) {
      setAspectRatio("16:9");
      document.documentElement.style.setProperty("--project-aspect", cssAspect("16:9"));
      return;
    }

    let activeRequest = true;
    void (async () => {
      try {
        const [storedAspect, project] = await Promise.all([
          getLocalAspectRatio(projectId),
          getLocalProject(projectId),
        ]);
        if (!activeRequest) return;
        const candidate = storedAspect ?? project?.aspectRatio;
        const next: ProjectAspectRatio = candidate === "9:16" || candidate === "1:1" ? candidate : "16:9";
        setAspectRatio(next);
        document.documentElement.style.setProperty("--project-aspect", cssAspect(next));
      } catch {
        if (activeRequest) {
          setAspectRatio("16:9");
          document.documentElement.style.setProperty("--project-aspect", cssAspect("16:9"));
        }
      }
    })();

    const onAspect = (event: Event) => {
      const detail = (event as CustomEvent<{ projectId: string; aspectRatio: ProjectAspectRatio }>).detail;
      if (!detail || detail.projectId !== projectId) return;
      setAspectRatio(detail.aspectRatio);
      document.documentElement.style.setProperty("--project-aspect", cssAspect(detail.aspectRatio));
    };
    window.addEventListener("acd:aspect-ratio", onAspect as EventListener);

    return () => {
      activeRequest = false;
      window.removeEventListener("acd:aspect-ratio", onAspect as EventListener);
    };
  }, [projectId]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setMenu(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(null);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  async function chooseAspect(value: ProjectAspectRatio) {
    setAspectRatio(value);
    document.documentElement.style.setProperty("--project-aspect", cssAspect(value));
    setMenu(null);
    if (!projectId) return;
    try {
      await saveLocalAspectRatio(projectId, value);
    } catch {
      // The project screen and generation flow still retain their current in-memory value.
    }
  }

  function chooseTheme(value: ThemeChoice) {
    setTheme(value);
    applyTheme(value);
    try {
      window.localStorage.setItem("acd-theme", value);
    } catch {
      // Theme still applies for the current session.
    }
    setMenu(null);
  }

  return (
    <div className="topbar-actions" ref={rootRef}>
      <Link className="quiet-button topbar-help-link" href="/guide" aria-current={active === "guide" ? "page" : undefined}>
        사용법
      </Link>

      {showAspect && (
        <div className="topbar-popover-anchor">
          <button
            type="button"
            className="quiet-button aspect-button"
            aria-haspopup="menu"
            aria-expanded={menu === "aspect"}
            onClick={() => setMenu((current) => current === "aspect" ? null : "aspect")}
          >
            <span>{aspectRatio}</span>
            <span className="topbar-chevron" aria-hidden="true">⌄</span>
          </button>
          {menu === "aspect" && (
            <div className="topbar-popover aspect-popover" role="menu" aria-label="화면 비율">
              <div className="topbar-popover-title">화면 비율</div>
              {aspectOptions.map((option) => (
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={aspectRatio === option.value}
                  className={`topbar-menu-item ${aspectRatio === option.value ? "is-active" : ""}`}
                  key={option.value}
                  onClick={() => void chooseAspect(option.value)}
                >
                  <span className="topbar-menu-check" aria-hidden="true">{aspectRatio === option.value ? "✓" : ""}</span>
                  <span><strong>{option.label}</strong><small>{option.description}</small></span>
                </button>
              ))}
              <p className="topbar-menu-note">프로젝트 생성과 미리보기에 함께 적용됩니다.</p>
            </div>
          )}
        </div>
      )}

      <div className="topbar-popover-anchor">
        <button
          type="button"
          className="icon-only settings-button"
          aria-label="설정"
          aria-haspopup="menu"
          aria-expanded={menu === "settings"}
          onClick={() => setMenu((current) => current === "settings" ? null : "settings")}
        >
          <span aria-hidden="true">⚙</span>
        </button>
        {menu === "settings" && (
          <div className="topbar-popover settings-popover" role="menu" aria-label="설정">
            <div className="topbar-popover-title">설정</div>
            <div className="topbar-setting-group">
              <span>화면 모드</span>
              <div className="theme-options" role="radiogroup" aria-label="화면 모드">
                {(["system", "light", "dark"] as ThemeChoice[]).map((value) => (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={theme === value}
                    className={theme === value ? "is-active" : ""}
                    key={value}
                    onClick={() => chooseTheme(value)}
                  >
                    {value === "system" ? "시스템" : value === "light" ? "라이트" : "다크"}
                  </button>
                ))}
              </div>
            </div>
            <div className="settings-storage-row">
              <span>저장</span>
              <strong>이 브라우저 · IndexedDB</strong>
            </div>
            <Link className="settings-guide-link" href="/guide#backup" onClick={() => setMenu(null)}>
              저장과 백업 사용법 →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
