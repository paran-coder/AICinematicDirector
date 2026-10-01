import Image from "next/image";
import Link from "next/link";
import { demoProject } from "@/test/fixtures/the-last-cassette";

const references = [
  {
    label: "대표 이미지",
    src: "/fixtures/mina-old-shop-main.jpg",
    alt: "Mina 대표 기준 이미지",
  },
  {
    label: "보조 참조",
    src: "/fixtures/shot-medium.jpg",
    alt: "Mina 미디엄 샷 보조 참조",
  },
  {
    label: "분위기 참조",
    src: "/fixtures/shot-wide.jpg",
    alt: "Mina와 장소 분위기 참조",
  },
  {
    label: "얼굴 클로즈업",
    src: "/fixtures/shot-closeup.jpg",
    alt: "Mina 얼굴 클로즈업 참조",
  },
] as const;

export function CharacterScreen() {
  const c = demoProject.character;

  return (
    <main className="stage">
      <div className="character-workspace">
        <aside className="entity-list">
          <span className="eyebrow">캐릭터</span>
          <h2>{c.name}</h2>
          <article className="entity-card is-selected">
            <Image src="/fixtures/mina-portrait.jpg" alt="Mina" width={72} height={72} sizes="72px" />
            <div>
              <strong>Mina</strong>
              <small>32세 · 한국인 여성</small>
            </div>
          </article>
          <button className="add-button">＋ 캐릭터 추가</button>
        </aside>

        <section className="character-preview">
          <div className="stage-heading">
            <span className="eyebrow">캐릭터 기준 이미지</span>
            <h1>Mina</h1>
            <p>영상 전체에서 캐릭터의 외형과 분위기를 유지하기 위한 참조 이미지를 확인합니다.</p>
          </div>

          <div className="preview-media">
            <Image
              src="/fixtures/mina-old-shop-main.jpg"
              alt="Mina 캐릭터 대표 기준 이미지"
              width={1280}
              height={720}
              sizes="(max-width: 1200px) 70vw, 55vw"
            />
          </div>

          <div className="reference-grid">
            {references.map((reference) => (
              <article key={reference.label}>
                <Image src={reference.src} alt={reference.alt} width={240} height={240} sizes="160px" />
                <span>{reference.label}</span>
              </article>
            ))}
          </div>
          <p className="reference-note">
            현재 이미지는 앵글별 정면·측면·후면 시트가 아니라 캐릭터 일관성용 참조 세트입니다.
          </p>
        </section>

        <aside className="character-inspector">
          <h2>기준 모습</h2>
          <p>고정된 특징은 프로젝트 전체에서 유지됩니다.</p>
          <dl className="definition-list">
            <div><dt>머리</dt><dd>짧은 검은 보브컷 🔒</dd></div>
            <div><dt>눈</dt><dd>갈색 🔒</dd></div>
            <div><dt>체형</dt><dd>마른 체형 🔒</dd></div>
            <div><dt>고유 특징</dt><dd>왼쪽 눈 아래 작은 점 🔒</dd></div>
          </dl>
          <h3>상태</h3>
          <div className="chip-row">{c.states.map((state) => <span key={state} className="state-chip">{state}</span>)}</div>
          <div className="stage-actions character-actions">
            <span className="autosave">✓ 기준 이미지 준비됨</span>
            <Link className="primary-link" href="/projects/demo/scenes">캐릭터 확정 →</Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
