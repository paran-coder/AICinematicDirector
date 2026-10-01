import Image from "next/image";
import Link from "next/link";
import type { ShotListItem, ShotWorkspaceData } from "@/domain/workspace/types";

export function BrowserPanel({ projectId, scene, shots, selectedShotId }: { projectId: string; scene: ShotWorkspaceData["scene"]; shots: ShotListItem[]; selectedShotId: string }) {
  return <aside className="browser-panel">
    <div className="browser-context"><span className="eyebrow">장면 {String(scene.order).padStart(2,"0")}</span><h2>{scene.title}</h2><p>{scene.description}</p></div>
    <div className="search-row"><input aria-label="샷 검색" placeholder="샷 검색..."/><button className="icon-only" aria-label="필터">≡</button></div>
    <div className="browser-list">
      {shots.map((shot) => <Link key={shot.id} href={`/projects/${projectId}/shots/${shot.routeId}`} className={`browser-item ${shot.routeId === selectedShotId ? "is-selected" : ""}`}>
        <Image src={shot.image} alt="" width={84} height={62} sizes="84px"/><span className="browser-copy"><span className="browser-number">{String(shot.order).padStart(2,"0")}</span><strong>{shot.title}</strong><small>{shot.description}</small></span><span className="duration">{shot.duration}s</span>
      </Link>)}
    </div>
    <button className="add-button">＋ 샷 추가</button>
  </aside>;
}
