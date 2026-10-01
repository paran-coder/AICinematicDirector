import Link from "next/link";
import packageInfo from "../../../package.json";
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
        <Link className="brand" href="/" aria-label={`AI Cinematic Director v${packageInfo.version} 홈`}>
          <span className="brand-name">AI Cinematic Director</span>
          <span className="brand-version">v{packageInfo.version}</span>
        </Link>
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
