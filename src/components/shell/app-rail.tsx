import Link from "next/link";
import { CharacterIcon, GenerateIcon, ProjectIcon, SceneIcon, ShotIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

const items = [
  { id: "project", label: "프로젝트", Icon: ProjectIcon, href: "/projects/demo" },
  { id: "character", label: "캐릭터", Icon: CharacterIcon, href: "/projects/demo/characters" },
  { id: "scene", label: "장면", Icon: SceneIcon, href: "/projects/demo/scenes" },
  { id: "shot", label: "샷", Icon: ShotIcon, href: "/projects/demo/shots/shot-02" },
  { id: "generate", label: "생성", Icon: GenerateIcon, href: "/projects/demo/generations" },
] as const;

export function AppRail({ active = "shot" }: { active?: string }) {
  return (
    <nav className="app-rail" aria-label="주요 탐색">
      <div className="app-mark" aria-hidden="true">A</div>
      <div className="rail-items">
        {items.map(({ id, label, Icon, href }) => (
          <Link key={id} href={href} className={cn("rail-item", active === id && "is-active")} aria-current={active === id ? "page" : undefined}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
      <div className="rail-bottom"><button className="avatar-button" aria-label="프로필">P</button></div>
    </nav>
  );
}
