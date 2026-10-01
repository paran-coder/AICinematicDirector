export function WorkspaceHeader({ title, description, meta }: { title: string; description: string; meta?: string }) {
  return <div className="workspace-header"><div><div className="title-row"><h1>{title}</h1>{meta && <span className="meta-pill">{meta}</span>}</div><p>{description}</p></div><div className="workspace-tools"><button type="button" className="icon-only" aria-label="화면 맞춤">⌗</button><button type="button" className="icon-only" aria-label="전체 화면">⛶</button></div></div>;
}
