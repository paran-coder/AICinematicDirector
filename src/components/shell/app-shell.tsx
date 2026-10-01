import Link from "next/link";
import { AppRail } from "./app-rail";
import { Breadcrumb } from "./breadcrumb";

export function AppShell({
  children,
  active,
  crumbs,
  showAspect = true,
}: {
  children: React.ReactNode;
  active: string;
  crumbs: string[];
  showAspect?: boolean;
}) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">AI Cinematic Director</div>
        <Breadcrumb items={crumbs} />
        <div className="topbar-actions">
          <Link className="quiet-button topbar-help-link" href="/guide" aria-current={active === "guide" ? "page" : undefined}>
            사용법
          </Link>
          {showAspect && <button className="quiet-button">16:9</button>}
          <button className="icon-only" aria-label="설정">⚙</button>
        </div>
      </header>
      <div className="shell-body">
        <AppRail active={active} />
        {children}
      </div>
    </div>
  );
}
