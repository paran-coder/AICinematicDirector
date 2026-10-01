import { AppRail } from "./app-rail";
import { Breadcrumb } from "./breadcrumb";
import { TopbarControls } from "./topbar-controls";

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
        <TopbarControls active={active} showAspect={showAspect} />
      </header>
      <div className="shell-body">
        <AppRail active={active} />
        {children}
      </div>
    </div>
  );
}
