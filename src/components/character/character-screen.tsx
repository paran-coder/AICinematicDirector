"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  addLocalCharacter,
  getLocalCharacters,
  type LocalCharacter,
} from "@/lib/local-project-store";
import { demoProject } from "@/test/fixtures/the-last-cassette";

const references = [
  { label: "대표 이미지", src: "/fixtures/mina-old-shop-main.jpg", alt: "Mina 대표 기준 이미지" },
  { label: "보조 참조", src: "/fixtures/shot-medium.jpg", alt: "Mina 미디엄 샷 보조 참조" },
  { label: "분위기 참조", src: "/fixtures/shot-wide.jpg", alt: "Mina와 장소 분위기 참조" },
  { label: "얼굴 클로즈업", src: "/fixtures/shot-closeup.jpg", alt: "Mina 얼굴 클로즈업 참조" },
] as const;

type SelectedCharacter =
  | { kind: "demo"; id: string; name: string }
  | { kind: "local"; character: LocalCharacter };

export function CharacterScreen({ projectId }: { projectId: string }) {
  const c = demoProject.character;
  const [characters, setCharacters] = useState<LocalCharacter[]>([]);
  const [selected, setSelected] = useState<SelectedCharacter>({ kind: "demo", id: c.id, name: c.name });
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let active = true;
    void getLocalCharacters(projectId).then((items) => {
      if (active) setCharacters(items);
    });
    return () => { active = false; };
  }, [projectId]);

  const selectedLocal = selected.kind === "local" ? selected.character : undefined;
  const selectedName = selected.kind === "demo" ? c.name : selected.character.name;
  const selectedSummary = useMemo(() => {
    if (!selectedLocal) return "32세 · 한국인 여성";
    const ageText = selectedLocal.age ? `${selectedLocal.age}세` : "나이 미설정";
    return `${ageText} · ${selectedLocal.description || "설명 없음"}`;
  }, [selectedLocal]);

  async function createCharacter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    if (!trimmedName) {
      setFormError("캐릭터 이름을 입력해 주세요.");
      return;
    }

    const parsedAge = age.trim() ? Number(age) : undefined;
    if (parsedAge !== undefined && (!Number.isFinite(parsedAge) || parsedAge < 1 || parsedAge > 120)) {
      setFormError("나이는 1~120 사이로 입력해 주세요.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const character: LocalCharacter = {
        id: `character-${Date.now()}`,
        name: trimmedName,
        age: parsedAge,
        description: trimmedDescription || "설명 미입력",
        createdAt: new Date().toISOString(),
      };
      const next = await addLocalCharacter(projectId, character);
      setCharacters(next);
      setSelected({ kind: "local", character });
      setCreateOpen(false);
      setName("");
      setAge("");
      setDescription("");
    } catch {
      setFormError("캐릭터를 저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="stage">
      <div className="character-workspace">
        <aside className="entity-list">
          <span className="eyebrow">캐릭터</span>
          <h2>{selectedName}</h2>

          <button
            type="button"
            className={`entity-card character-card-button ${selected.kind === "demo" ? "is-selected" : ""}`}
            onClick={() => setSelected({ kind: "demo", id: c.id, name: c.name })}
          >
            <Image src="/fixtures/mina-portrait.jpg" alt="Mina" width={72} height={72} sizes="72px" />
            <span>
              <strong>Mina</strong>
              <small>32세 · 한국인 여성</small>
            </span>
          </button>

          {characters.map((character) => (
            <button
              type="button"
              key={character.id}
              className={`entity-card character-card-button ${selected.kind === "local" && selected.character.id === character.id ? "is-selected" : ""}`}
              onClick={() => setSelected({ kind: "local", character })}
            >
              <span className="character-avatar-fallback" aria-hidden="true">{character.name.slice(0, 1).toUpperCase()}</span>
              <span>
                <strong>{character.name}</strong>
                <small>{character.age ? `${character.age}세 · ` : ""}{character.description}</small>
              </span>
            </button>
          ))}

          <button type="button" className="add-button" onClick={() => setCreateOpen(true)}>＋ 캐릭터 추가</button>
        </aside>

        <section className="character-preview">
          {selected.kind === "demo" ? (
            <>
              <div className="stage-heading">
                <span className="eyebrow">캐릭터 기준 이미지</span>
                <h1>Mina</h1>
                <p>영상 전체에서 캐릭터의 외형과 분위기를 유지하기 위한 참조 이미지를 확인합니다.</p>
              </div>
              <div className="preview-media">
                <Image src="/fixtures/mina-old-shop-main.jpg" alt="Mina 캐릭터 대표 기준 이미지" width={1280} height={720} sizes="(max-width: 1200px) 70vw, 55vw" />
              </div>
              <div className="reference-grid">
                {references.map((reference) => (
                  <article key={reference.label}>
                    <Image src={reference.src} alt={reference.alt} width={240} height={240} sizes="160px" />
                    <span>{reference.label}</span>
                  </article>
                ))}
              </div>
              <p className="reference-note">현재 이미지는 앵글별 정면·측면·후면 시트가 아니라 캐릭터 일관성용 참조 세트입니다.</p>
            </>
          ) : (
            <>
              <div className="stage-heading">
                <span className="eyebrow">캐릭터 기준 이미지</span>
                <h1>{selectedLocal?.name}</h1>
                <p>{selectedLocal?.description}</p>
              </div>
              <div className="character-empty-preview">
                <span className="character-empty-avatar" aria-hidden="true">{selectedLocal?.name.slice(0, 1).toUpperCase()}</span>
                <strong>기준 이미지가 아직 없습니다.</strong>
                <p>이 캐릭터의 외형 기준 이미지는 이후 이미지 생성/참조 단계에서 준비할 수 있습니다.</p>
              </div>
            </>
          )}
        </section>

        <aside className="character-inspector">
          <h2>기준 모습</h2>
          <p>{selected.kind === "demo" ? "고정된 특징은 프로젝트 전체에서 유지됩니다." : "새 캐릭터의 기본 정보입니다."}</p>

          {selected.kind === "demo" ? (
            <>
              <dl className="definition-list">
                <div><dt>머리</dt><dd>짧은 검은 보브컷 🔒</dd></div>
                <div><dt>눈</dt><dd>갈색 🔒</dd></div>
                <div><dt>체형</dt><dd>마른 체형 🔒</dd></div>
                <div><dt>고유 특징</dt><dd>왼쪽 눈 아래 작은 점 🔒</dd></div>
              </dl>
              <h3>상태</h3>
              <div className="chip-row">{c.states.map((state) => <span key={state} className="state-chip">{state}</span>)}</div>
            </>
          ) : (
            <dl className="definition-list">
              <div><dt>이름</dt><dd>{selectedLocal?.name}</dd></div>
              <div><dt>나이</dt><dd>{selectedLocal?.age ? `${selectedLocal.age}세` : "미설정"}</dd></div>
              <div><dt>설명</dt><dd>{selectedLocal?.description}</dd></div>
              <div><dt>저장</dt><dd>이 브라우저</dd></div>
            </dl>
          )}

          <div className="stage-actions character-actions">
            <span className="autosave">{selected.kind === "demo" ? "✓ 기준 이미지 준비됨" : "✓ 캐릭터 정보 저장됨"}</span>
            <Link className="primary-link" href="/projects/demo/scenes">캐릭터 확정 →</Link>
          </div>
        </aside>
      </div>

      {createOpen && (
        <div className="character-dialog-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setCreateOpen(false);
        }}>
          <section className="character-dialog" role="dialog" aria-modal="true" aria-labelledby="character-dialog-title">
            <div className="character-dialog-header">
              <div>
                <span className="eyebrow">새 캐릭터</span>
                <h2 id="character-dialog-title">캐릭터 추가</h2>
              </div>
              <button type="button" className="icon-only" aria-label="닫기" onClick={() => setCreateOpen(false)}>×</button>
            </div>
            <form onSubmit={createCharacter}>
              <label>이름<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="예: Joon" /></label>
              <label>나이 <span>선택</span><input inputMode="numeric" value={age} onChange={(event) => setAge(event.target.value)} placeholder="예: 29" /></label>
              <label>한 줄 설명<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="예: 차분하지만 경계심이 강한 사진작가" /></label>
              {formError ? <p className="character-form-error" role="alert">{formError}</p> : null}
              <div className="character-dialog-actions">
                <button type="button" className="secondary-action" onClick={() => setCreateOpen(false)}>취소</button>
                <button type="submit" className="primary-button" disabled={saving}>{saving ? "추가 중..." : "캐릭터 추가"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
