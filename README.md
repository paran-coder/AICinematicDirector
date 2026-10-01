# AI Cinematic Director-v1.0.0

AI 영상 아이디어를 캐릭터·장면·샷 단위로 구조화하고 Consistency Engine을 통해 일관성을 유지한 뒤 Seedance 계열 영상 생성으로 연결하는 웹 애플리케이션입니다.

## 핵심 흐름
프로젝트 → 캐릭터 → 장면 → 샷 → 생성 → 채택 / 재생성 / 샷 수정

## v1.0.0 저장 방식 — Local First

서버 데이터베이스를 사용하지 않습니다.

- 프로젝트 편집값: 브라우저 IndexedDB
- 샷 연출값: 브라우저 IndexedDB
- 생성 기록/버전 선택: 브라우저 IndexedDB
- 백업/복원: JSON Export / Import
- 저장소 라이브러리: 없음 — 브라우저 표준 IndexedDB API 직접 사용
- 가능한 경우 `navigator.storage.persist()`로 영속 저장을 요청

따라서 별도의 Neon/PostgreSQL 계정, Drizzle ORM, DB migration이 필요하지 않습니다.

주의:
- 다른 브라우저/기기로 자동 동기화되지 않습니다.
- 사이트 데이터를 삭제하면 로컬 데이터도 삭제될 수 있습니다.
- 중요한 프로젝트는 프로젝트 화면에서 JSON 백업을 내보내는 것을 권장합니다.

## 서버가 담당하는 것

서버는 사용자 프로젝트 데이터를 저장하지 않습니다. 다음 역할만 담당합니다.

- Higgsfield API Key 보호
- Resolved Shot 데이터를 기반으로 Prompt 컴파일
- Video Provider 요청
- 생성 상태 polling / 취소 요청

브라우저는 현재 샷 연출값과 화면 비율을 생성 요청 시 서버에 전달하며, 서버는 이를 도메인 규칙으로 다시 구성해 Prompt를 만듭니다.

## 기술 스택
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Native IndexedDB
- Native Storage API
- Higgsfield Seedance 2.5 REST adapter
- Vitest / Playwright / Biome (개발 도구)

## 환경 변수

```env
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
APP_URL=https://your-app.vercel.app

VIDEO_PROVIDER=mock
HF_API_KEY_ID=
HF_API_KEY_SECRET=
ALLOW_PAID_GENERATION=0
```

DB 환경 변수는 없습니다.

## OG 이미지

루트 metadata는 다음 파일을 사용하도록 설정되어 있습니다.

```text
/public/og-image.png
1200 × 630
```

이미지를 해당 경로에 추가하면 Open Graph / Twitter large image에 사용됩니다.

## 주요 페이지
- `/projects/demo` — 프로젝트
- `/projects/demo/characters` — 캐릭터
- `/projects/demo/scenes` — 장면
- `/projects/demo/shots/shot-02` — 샷
- `/projects/demo/generations` — 생성 결과
- `/guide` — 자세한 사용법

## 검증

```bash
npm install
npm run typecheck
npm run verify:consistency
npm run verify:provider
npm run verify:integration
npm run build
```

실제 Higgsfield 유료 검증은 명시적으로 opt-in 합니다.

```bash
export VIDEO_PROVIDER=higgsfield
export HF_API_KEY_ID=...
export HF_API_KEY_SECRET=...
export APP_URL=https://your-app.vercel.app
export ALLOW_PAID_GENERATION=1
npm run verify:higgsfield-live
```
