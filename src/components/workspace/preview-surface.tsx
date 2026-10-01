import Image from "next/image";
import { PlayIcon } from "@/components/icons";

export function PreviewSurface({ image, duration }: { image: string; duration: number }) {
  const frames = Array.from({ length: 7 }, () => image);
  return <div className="preview-block">
    <div className="preview-media">
      <Image src={image} alt="현재 샷의 첫 프레임" width={1280} height={720} priority sizes="(max-width: 1024px) 100vw, 55vw"/>
      <div className="playback"><button aria-label="재생"><PlayIcon/></button><span>0:00 / 0:{String(duration).padStart(2,"0")}</span><div className="scrubber"><span/></div><span aria-hidden="true">◕</span><span aria-hidden="true">⛶</span></div>
    </div>
    <div className="filmstrip"><button className="icon-only" aria-label="이전 프레임">‹</button>{frames.map((frame,i)=><Image key={i} className={i===0?"is-active":""} src={frame} alt="" width={78} height={48} sizes="78px"/>)}<button className="icon-only" aria-label="다음 프레임">›</button></div>
  </div>;
}
