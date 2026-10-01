# AI Cinematic Director-v1.0.0 — context-notes

## 제품
아이디어 → 캐릭터 → 장면 → 샷 → 생성으로 이어지는 AI 시네마틱 연출 도구.

## 핵심 모듈
- Character Factory
- Canonical Assets / State
- Consistency Engine
- Prompt Compiler
- VideoProvider

## v1.0.0 저장 원칙
개인/단일 사용자 중심으로 서버 DB를 두지 않는다.

- Browser IndexedDB: Project / Shot / Generation metadata
- Native Storage API: persistent storage request
- JSON Export/Import: 백업/복원
- 서버: API key 보호와 영상 생성만 담당

외부 PostgreSQL/Neon/Drizzle은 v1.0.0에서 사용하지 않는다.

## UI
Shot 화면이 디자인 기준.
- App Rail
- Browser
- Preview
- Inspector
- Consistency Bar
- Primary CTA
- System theme
- Korean-first
- Preview first

## Consistency
Scope: PROJECT / SCENE / SHOT / FREE
Conflict: AUTO_RESOLVE / WARN / BLOCK
Prompt Compiler는 Resolved State만 표현한다.

## OG
`/og-image.png` 1200×630 경로가 metadata에 선등록되어 있다.
