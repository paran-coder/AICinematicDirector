# AI Cinematic Director-v1.0.0

AI 영상 아이디어를 캐릭터·장면·샷 단위로 구조화하고, Consistency Engine을 통해 일관성을 유지한 뒤 Seedance 계열 영상 생성 프롬프트와 Generation flow로 연결하는 웹 애플리케이션.

## 핵심 사용자 흐름
프로젝트 → 캐릭터 → 장면 → 샷 → 생성 → 채택 / 재생성 / 샷 수정

## 추천 기술 스택

### Frontend
- Next.js App Router
- React
- TypeScript
- Tailwind CSS 4.x
- shadcn/ui + Radix
- Lucide Icons
- next-themes

### Client state
- Zustand: 현재 선택 항목과 편집 중 UI 상태
- TanStack Query: 서버 mutation, generation polling/status, 캐시

### Backend
- Next.js Route Handlers / Server Actions
- Zod validation

### Database
- PostgreSQL
- Drizzle ORM
- JSONB + relational hybrid

### Media storage
ObjectStorage interface로 추상화한다.
개발은 local/mock, 운영은 Vercel Blob 또는 S3-compatible storage를 선택할 수 있게 한다.

### Video generation
- VideoProvider interface
- MockVideoProvider 우선 구현
- Higgsfield Seedance 2.5 REST adapter 구현 완료
- 기본은 MockVideoProvider, `VIDEO_PROVIDER=higgsfield`일 때 실제 adapter 사용

### Quality
- Biome
- Vitest
- Testing Library
- Playwright

## 핵심 런타임 버전
- Next.js `16.3.8`
- React / React DOM `19.3.0`
- Tailwind CSS `^4.3.0`

실제 배포에서는 `npm install`로 생성되는 lockfile을 커밋해 transitive dependency까지 고정한다.

## 폴더 구조

```text
AI-Cinematic-Director-v1.0.0/
├─ context-notes.md
├─ checklist.md
├─ README.md
├─ User manual.md
├─ implementation-spec.md
├─ public/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx
│  │  ├─ globals.css
│  │  ├─ (workspace)/projects/
│  │  │  ├─ new/page.tsx
│  │  │  └─ [projectId]/
│  │  │     ├─ layout.tsx
│  │  │     ├─ page.tsx
│  │  │     ├─ characters/page.tsx
│  │  │     ├─ scenes/page.tsx
│  │  │     ├─ shots/[shotId]/page.tsx
│  │  │     └─ generations/page.tsx
│  │  └─ api/generations/
│  ├─ components/
│  │  ├─ ui/
│  │  ├─ shell/
│  │  ├─ workspace/
│  │  ├─ assets/
│  │  ├─ project/
│  │  ├─ character/
│  │  ├─ scene/
│  │  ├─ shot/
│  │  └─ generation/
│  ├─ domain/
│  │  ├─ consistency/
│  │  └─ prompt/
│  ├─ providers/
│  │  ├─ video/
│  │  └─ storage/
│  ├─ db/
│  ├─ stores/
│  ├─ hooks/
│  ├─ lib/
│  └─ test/
├─ drizzle.config.ts
├─ components.json
├─ biome.json
├─ playwright.config.ts
└─ package.json
```

## Architecture 원칙
- Server-first
- Client boundary 최소화
- Domain logic는 React 밖의 순수 TypeScript
- Provider isolation
- Shot 화면에서 확정한 App Rail / Browser / Preview / Inspector / Status 패턴 재사용

## 개발 우선순위
P0 Design System + App Shell
P1 Mock 데이터로 5개 화면 전체 동작
P2 Consistency Engine
P3 Database Persistence
P4 Prompt Compiler
P5 Generation Provider abstraction + Mock generation
P6 실제 Seedance/Higgsfield Provider ✓ 코드 구현
P7 테스트 / 접근성 / polish

외부 API와 DB보다 Mock full-flow를 먼저 완성한다.

## 현재 구현 상태

- 5개 화면 UI 소스 및 정적 클릭 프로토타입 구현
- 시스템 Light/Dark 테마 토큰 및 reduced-motion 구현
- PostgreSQL/Drizzle schema, connection module, migration, deterministic demo seed 작성
- Project/Shot 700ms debounce autosave API 및 repository 구현
- Generation row/provider_job_id/output asset persistence 구현
- Consistency Engine 핵심 테스트 5/5 통과
- Seedance Prompt Compiler 구현
- MockVideoProvider와 생성 API 흐름 구현
- Higgsfield Seedance 2.5 Text/Image-to-Video REST adapter 구현
- 서버에서 Resolved State → Prompt Compile → Provider submit으로 연결
- 8초 mock MP4 fixture 생성
- Generation 재생성 / 버전 선택 / 진행 중 취소 구현
- provider별 status/cancel dispatch 및 control URL persistence 구현
- Docker Compose PostgreSQL 개발 서비스와 DB round-trip 검증 스크립트 추가

### 현재 환경 제약
현재 실행 환경에서 npm registry 요청이 timeout되어 새 의존성 설치와 Next.js 실제 build는 수행하지 못했다. PostgreSQL 서버와 Higgsfield API credentials도 제공되지 않아 DB round-trip과 live generation은 실행하지 않았다. 대신 Consistency 5/5, Prompt/Mock Provider, Integration 10/10, TS/TSX 50개 파일 syntax diagnostics를 통과했다.


## 실제 연결 설정

```env
DATABASE_URL=postgres://...
VIDEO_PROVIDER=higgsfield
HF_API_KEY_ID=...
HF_API_KEY_SECRET=...
APP_URL=https://your-public-app.example
```

DB 초기화:

```bash
npm install
npm run db:migrate
npm run db:seed
```

Higgsfield mode에서는 First Frame을 사용할 경우 `APP_URL` 또는 향후 ObjectStorage adapter가 생성하는 이미지 URL이 외부에서 접근 가능해야 한다. 로컬 `localhost` 이미지는 의도적으로 거부한다.


## RC 검증 순서

```bash
cp .env.example .env.local
npm install
npm run db:up
export DATABASE_URL=postgresql://cinematic:cinematic@localhost:5432/cinematic_director
npm run rc:verify:db
npm run rc:verify
```

실제 Higgsfield 검증은 유료 요청을 자동 실행하지 않는다. credentials를 설정한 뒤 아래처럼 명시적으로 opt-in 해야 한다.

```bash
export HF_API_KEY_ID=...
export HF_API_KEY_SECRET=...
export ALLOW_PAID_GENERATION=1
npm run verify:higgsfield-live
```

Seedance Image-to-Video를 앱에서 사용할 때는 first frame URL이 외부에서 접근 가능해야 하므로 운영 `APP_URL`은 localhost가 아닌 공개 origin이어야 한다.
