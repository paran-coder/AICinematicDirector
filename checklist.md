# AI Cinematic Director-v1.0.0 — checklist

## Phase 0 — 기준 문서
- [x] context-notes.md
- [x] checklist.md
- [x] README.md
- [x] User manual.md
- [x] implementation-spec.md
- [x] 구현 계획 승인

## Phase 1 — 프로젝트 기반
- [x] Next.js App Router + TypeScript 프로젝트 소스 생성
- [x] Tailwind CSS 설정 파일/토큰 작성
- [ ] shadcn/ui 실제 초기화 — npm registry 필요
- [x] 시스템 테마(System/Light/Dark) CSS 기반 구현
- [x] Biome 설정 파일 작성
- [ ] Vitest / Playwright 패키지 설치 및 실행 — npm registry 필요
- [x] 환경 변수 샘플(.env.example)
- [x] TS/TSX 48개 파일 syntax transpile 검사 0 errors
- [ ] next build / full typecheck / lint — 의존성 설치 후 재검증

## Phase 2 — Design Tokens + 공통 컴포넌트
- [x] semantic color tokens
- [x] typography scale
- [x] spacing / radius / motion tokens
- [x] AppShell / AppRail / Breadcrumb
- [x] BrowserPanel / BrowserItem
- [x] WorkspaceHeader / PreviewSurface
- [x] Inspector / InspectorSection
- [x] AssetReference / StateChip / StatusPill
- [x] ConsistencyBar + 상세 Warning/Auto-restore UI
- [x] reduced-motion 처리
- [ ] 전체 접근성 audit — Playwright/브라우저 환경 필요

## Phase 3 — 전체 화면
- [x] 프로젝트 화면
- [x] 캐릭터 화면
- [x] 장면 화면
- [x] 샷 화면
- [x] 생성 화면
- [x] The Last Cassette fixture 데이터
- [x] 화면 간 라우팅 소스 + 정적 클릭 프로토타입
- [x] Project 700ms debounce autosave
- [x] Shot 700ms debounce autosave
- [x] DB 미연결 시 fixture read-only fallback 표시

## Phase 4 — Database
- [x] PostgreSQL/Drizzle connection module 구현
- [x] Drizzle schema / 초기 SQL migration
- [x] 핵심 테이블 정의
- [x] deterministic The Last Cassette seed script
- [x] Project 실제 read/update repository
- [x] Shot 실제 read/update repository
- [x] Generation row / output asset persistence 코드
- [ ] 실제 PostgreSQL migration/seed 실행 — DATABASE_URL 및 PostgreSQL runtime 필요
- [ ] FK/JSONB 실제 DB round-trip 검증 — DATABASE_URL 필요

## Phase 5 — Consistency Engine
- [x] Default Scope Rule Map
- [x] Scope Override
- [x] State composition
- [x] nested Scene/Shot/User override flatten 처리
- [x] Conflict detection
- [x] AUTO_RESOLVE / WARN / BLOCK
- [x] Canon 하위 범위 변경 거부 + 자동복원 UI 반환
- [x] Scene 범위 날씨/시간대/조명과 Shot 값 차이 WARN
- [x] Resolved State 출력
- [x] 핵심 domain 실행 테스트

필수 테스트:
- [x] rain + tired + injured 합성
- [x] wet → dried temporal replacement
- [x] Canon hair color 변조 BLOCK
- [x] wardrobe transition WARN
- [x] shot expression override AUTO_RESOLVE
- [x] nested camera/expression override resolve
- [x] Scene weather vs Shot weather WARN
- [x] Canon 변경 시 자동복원 결과 생성

## Phase 6 — Prompt Compiler
- [x] Resolved State 기반 서버-side compile 경로
- [x] Seedance prompt sections
- [x] character/location/prop/style consistency instructions
- [x] camera/physics/lighting/audio
- [x] Generation API가 클라이언트 Prompt를 신뢰하지 않고 서버에서 재컴파일
- [x] 핵심 실행 테스트
- [ ] Prompt Preview Drawer UI

## Phase 7 — Generation Provider
- [x] VideoProvider interface
- [x] MockVideoProvider
- [x] provider_job_id DB 저장 코드
- [x] output asset DB 저장 코드
- [x] Higgsfield Seedance 2.5 REST adapter
- [x] Text-to-Video endpoint 선택
- [x] First Frame 존재 시 Image-to-Video endpoint 선택
- [x] `/requests/{request_id}/status` polling
- [x] server-only HF_API_KEY_ID / HF_API_KEY_SECRET
- [x] local/private first-frame URL 방지
- [x] 상태 응답 normalize unit-style 검증
- [ ] 라이브 Higgsfield 요청 검증 — API credentials 필요

## Phase 8 — Generation UX
- [x] queued / generating / success / error API 흐름
- [x] Generation DB history read 코드
- [x] Generate 화면이 DB 결과/asset을 읽는 구조
- [x] adjust shot 링크
- [x] version 번호 계산
- [x] regenerate 버튼 실제 mutation
- [x] use version selected flag mutation
- [x] cancel UI + provider cancel mutation

## Phase 9 — 품질
- [x] Consistency tests 5/5 통과
- [x] Prompt/Mock Provider tests 통과 (submit/poll/success/cancel)
- [x] Integration assertions 10/10 통과
- [x] TS/TSX 50 files syntax diagnostics 0 errors
- [x] Internal import resolution missing 0
- [ ] npm install
- [ ] next build
- [ ] full TypeScript typecheck
- [ ] Biome lint
- [ ] Playwright 핵심 플로우
- [ ] 실제 PostgreSQL round-trip
- [ ] 실제 Higgsfield generation

## Phase 10 — v1.0.0 Release Candidate
- [ ] 전체 체크리스트 완료
- [x] README 현재 구현 상태 반영
- [x] User manual 기본 흐름 반영
- [x] known limitations 기록
- [x] 코드 기준 release candidate 평가 완료 — 외부 환경 검증 3개 gate 남음

## 현재 실행 환경 메모
- npm registry 요청이 timeout되어 새 의존성 설치와 `next build`를 실행할 수 없음.
- PostgreSQL 실행 파일/서버가 제공되지 않아 실제 migration/seed/round-trip은 실행하지 못함.
- Higgsfield live credentials가 제공되지 않아 실제 유료 generation은 호출하지 않음.
- 대신 순수 domain/provider 테스트, Higgsfield 응답 normalize 테스트, 전체 TS/TSX syntax transpile을 실행함.
