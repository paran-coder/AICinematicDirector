import { AppRail } from "./app-rail";
import { Breadcrumb } from "./breadcrumb";

export function AppShell({ children, active, crumbs }: { children: React.ReactNode; active: string; crumbs: string[] }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">AI Cinematic Director</div>
        <Breadcrumb items={crumbs} />
        <div className="topbar-actions"><button className="quiet-button">16:9</button><button className="icon-only" aria-label="설정">⚙</button></div>
      </header>
      <div className="shell-body"><AppRail active={active} />{children}</div>
    </div>
  );
}
