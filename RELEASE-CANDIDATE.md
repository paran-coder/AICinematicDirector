# AI Cinematic Director-v1.0.0 — Release Candidate

Date: 2026-10-01

## 상태

**Code-complete RC.** 제품의 v1.0.0 기능 범위는 코드 기준으로 닫혔다.

완료된 핵심 루프:

```text
프로젝트 편집/자동저장
→ 캐릭터/장면 Context
→ 샷 연출/자동저장
→ Consistency Resolve
→ Prompt Compile
→ Video Provider Submit
→ Status Polling
→ Result Review
→ Regenerate / Cancel / Select Version / Adjust Shot
```

## 이번 RC에서 추가 완료

- Generation 재생성 mutation
- Generation version 선택 및 `selected` persistence
- 진행 중 generation 취소 API/UI
- provider control URL(status/cancel) persistence
- Generation row에 기록된 provider를 기준으로 status/cancel dispatch
- 동일 Shot 버전 선택 transaction
- Drizzle schema와 initial migration의 index 정의 동기화
- Docker Compose PostgreSQL 개발 서비스
- DB round-trip verification script
- 유료 Higgsfield live verification script + explicit safety switch
- 현재 Next.js/React/Tailwind 핵심 버전 pin

## 현재 실행 검증

```text
Consistency tests             5/5 PASS
Prompt/Mock Provider          PASS (submit/poll/success/cancel)
Integration assertions       10/10 PASS
Internal import resolution    0 missing
TS/TSX syntax transpile       50 files / 0 errors
```

## 배포 승인 전 남은 3개 Gate

### Gate 1 — Production build

현재 작업 환경은 npm registry DNS 접근이 차단되어 `npm install`, full `typecheck`, `next build`를 실행하지 못했다.

외부 환경:

```bash
npm install
npm run typecheck
npm run build
```

### Gate 2 — PostgreSQL round-trip

현재 컨테이너에는 PostgreSQL/Docker runtime이 없다.

Docker가 있는 환경:

```bash
npm run db:up
export DATABASE_URL=postgresql://cinematic:cinematic@localhost:5432/cinematic_director
npm run rc:verify:db
```

검증 범위:
- migration
- deterministic seed
- Project read/update/read
- Shot read/update/read
- JSONB/relationship retrieval

### Gate 3 — Higgsfield live generation

API credentials가 제공되지 않아 실제 유료 요청은 실행하지 않았다.

의도하지 않은 과금을 막기 위해 live test는 explicit opt-in이다.

```bash
export HF_API_KEY_ID=...
export HF_API_KEY_SECRET=...
export ALLOW_PAID_GENERATION=1
npm run verify:higgsfield-live
```

Live verification은 최소 4초 480p Text-to-Video 요청을 사용한다.

## RC 판정

세 외부 Gate가 통과하면 `v1.0.0` release tag를 만들 수 있다. 그 전까지 상태는 `v1.0.0-rc.1`로 취급한다.
