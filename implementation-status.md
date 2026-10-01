# AI Cinematic Director-v1.0.0 — Implementation Status

Date: 2026-10-01

## 이번 구현에서 완료한 항목

### PostgreSQL / Drizzle persistence
- `src/db/index.ts`: PostgreSQL/Drizzle connection module
- `src/db/schema.ts`: relational + JSONB schema
- `src/db/migrations/0000_initial.sql`: initial migration
- `src/db/seed.ts`: deterministic The Last Cassette seed
- `src/data/project-repository.ts`: Project/Shot read/update repository
- Project 700ms debounce autosave
- Shot 700ms debounce autosave
- Generation row + provider job id + output asset persistence
- `DATABASE_URL` 미설정 시 fixture read-only fallback

### Consistency UI integration
- nested Scene/Shot/User overrides flatten 후 resolve
- Shot autosave 직전 Consistency Engine 실행
- PROJECT scope Canon 변경값 저장 거부
- Canon 유지 결과를 UI에 `자동 복원`으로 노출
- Scene scope 날씨/시간대/조명과 Shot 값 차이를 `WARN`으로 노출
- ConsistencyBar에서 정상 상태는 압축, 이슈 발생 시 상세 표시

### Higgsfield / Seedance provider
- `HiggsfieldSeedanceProvider` 추가
- Seedance 2.5 Text-to-Video REST endpoint
- Seedance 2.5 Image-to-Video REST endpoint
- First Frame 존재 시 Image-to-Video 선택
- `/requests/{request_id}/status` polling
- `HF_API_KEY_ID` / `HF_API_KEY_SECRET` server-only 인증
- relative first frame URL을 `APP_URL`로 public URL 변환
- localhost/private development URL을 live provider에 전달하지 않도록 guard
- provider 응답을 앱의 queued/generating/success/error/cancelled 상태로 normalize

### Generation flow
- Client Prompt 전송 제거
- Server가 DB/fixture Shot을 읽고 Resolved State를 사용해 Prompt compile
- Provider submit 후 generation record 저장
- Poll 시 DB status update
- 성공 시 video asset 저장
- Generation 화면이 DB history를 읽는 구조로 전환
- 같은 연출로 재생성 → 새 generation version 생성
- 생성 결과 버전 선택/채택(selected flag)
- 진행 중 generation 취소
- 버전 선택 mutation은 동일 shot 내 transaction 처리
- generation row에 저장된 provider 이름으로 status/cancel dispatch
- provider status/cancel URL을 generation settings에 보존해 process 재시작에 대비

## 실행 검증

- Consistency tests: 5/5 passed
- Prompt/Mock Provider tests: passed (submit, polling, success, cancel)
- Integration assertions: 10/10 passed
- Internal import resolution: missing 0
- TS/TSX syntax transpile: 50 files, 0 syntax errors
- RC environment checker added
- Docker Compose PostgreSQL development service added

## 환경 때문에 실행하지 못한 검증

1. `npm install` / `next build` / full typecheck / Biome lint
   - 현재 환경에서 npm registry 요청이 timeout됨.
2. 실제 PostgreSQL migration / seed / round-trip
   - PostgreSQL runtime과 DATABASE_URL이 제공되지 않음.
3. 실제 Higgsfield 유료 generation
   - API credentials가 제공되지 않음.

## 실제 환경에서 다음 검증 명령

```bash
npm install
npm run db:up
npm run db:migrate
npm run db:seed
npm run verify:db
npm run typecheck
npm run build
npm run verify:consistency
npm run verify:provider
npm run verify:integration
```

Live provider:

```env
VIDEO_PROVIDER=higgsfield
HF_API_KEY_ID=...
HF_API_KEY_SECRET=...
APP_URL=https://publicly-reachable-app.example
```


## Release Candidate 판단

코드 기준 v1.0.0 RC 기능 범위는 완료되었다. 배포 승인 전 남은 외부 검증 gate는 다음 3개다.

1. 의존성 설치 후 `npm run typecheck && npm run build`
2. 실제 PostgreSQL에서 `npm run rc:verify:db`
3. 실제 Higgsfield credentials로 opt-in live generation 1회

유료 API 검증은 안전장치 때문에 `ALLOW_PAID_GENERATION=1`을 명시해야만 실행된다.
