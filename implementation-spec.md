# AI Cinematic Director-v1.0.0 — implementation-spec

## 1. 구현 목표
프로젝트 생성 → 캐릭터 확정 → 장면 구성 → 샷 구성/편집 → Consistency Resolve → Prompt Compile → Generation 요청 → 결과 버전 관리까지 실제로 동작시키는 것이 목표다.

## 2. 기술 스택
Application:
- Next.js App Router
- React
- TypeScript strict mode

UI:
- Tailwind CSS 4.x
- shadcn/ui + Radix
- Lucide
- next-themes

State:
- Zustand
- TanStack Query

Validation:
- Zod

Persistence:
- PostgreSQL
- Drizzle ORM

Tests:
- Vitest
- Testing Library
- Playwright

Tooling:
- pnpm
- Biome

## 3. App routes
- /projects/new
- /projects/[projectId]
- /projects/[projectId]/characters
- /projects/[projectId]/scenes
- /projects/[projectId]/shots/[shotId]
- /projects/[projectId]/generations

API:
- POST /api/generations
- GET /api/generations/:generationId

## 4. DB schema

projects:
id, name, story, duration_seconds, aspect_ratio, genre, visual_style(jsonb), timestamps

characters:
id, project_id, name, canon(jsonb), character_sheet(jsonb), status, timestamps

character_states:
id, character_id, name, category, priority, changes(jsonb), carry_forward, conflicts_with(jsonb), replaces(jsonb), timestamps

locations:
id, project_id, name, canon(jsonb), timestamps

props:
id, project_id, name, canon(jsonb), timestamps

scenes:
id, project_id, scene_order, title, description, location_id, environment(jsonb), mood(jsonb), timestamps

scene_characters:
scene_id, character_id, active_state_ids(jsonb), scene_overrides(jsonb)

scene_props:
scene_id, prop_id, state(jsonb)

shots:
id, scene_id, shot_order, title, description, duration_seconds, character_direction(jsonb), camera(jsonb), lighting(jsonb), environment_overrides(jsonb), shot_overrides(jsonb), first_frame_asset_url, timestamps

generations:
id, shot_id, provider, status, provider_job_id, resolved_snapshot(jsonb), compiled_prompt, settings(jsonb), error(jsonb), selected, timestamps

generation_assets:
id, generation_id, kind, url, mime_type, width, height, duration_seconds, metadata(jsonb), created_at

## 5. Domain types
Scope = PROJECT | SCENE | SHOT | FREE
ConflictAction = AUTO_RESOLVE | WARN | BLOCK

CharacterStateCategory:
environment | physical | wardrobe | condition | emotion | story | temporary

## 6. Consistency Engine
구성:
- scope-rules.ts
- state-composer.ts
- conflict-resolver.ts
- resolve-character.ts
- resolve-location.ts
- resolve-props.ts
- resolve-style.ts
- types.ts

Pipeline:
load canon
→ apply scope rules
→ load persistent states
→ load scene states
→ load shot overrides
→ explicit overrides
→ merge non-conflicts
→ detect conflicts
→ resolve
→ resolved snapshot

resolver는 가능한 한 pure function으로 구현한다.

## 7. Prompt Compiler
입력:
Resolved Character / Location / Props / Style / Shot Direction

출력 섹션:
GLOBAL STYLE
CHARACTERS
LOCATION
PROPS
FIRST FRAME / BLOCKING
ACTION
CAMERA
OPTICS
PHYSICS
LIGHTING
AUDIO
CONSISTENCY RULES

Prompt Compiler는 conflict를 판단하지 않는다.

## 8. Video Provider
interface:
- submit(input) -> jobId
- getStatus(jobId) -> provider result
- optional cancel(jobId)

구현:
- `MockVideoProvider`: 로컬/개발용
- `HiggsfieldSeedanceProvider`: 공식 Higgsfield REST API 기반

공식 연결:
- Seedance 2.5 Text-to-Video: `/bytedance/seedance-2.5/text-to-video`
- Seedance 2.5 Image-to-Video: `/bytedance/seedance-2.5/image-to-video`
- 상태: `/requests/{request_id}/status`
- 인증: 서버 환경 변수의 `HF_API_KEY_ID` / `HF_API_KEY_SECRET`

First Frame이 있으면 Image-to-Video를 선택한다. 참조 이미지는 Higgsfield에서 접근 가능한 공개 URL이어야 하며 localhost/private URL은 adapter가 거부한다.

## 9. Generation state machine
queued → generating → success
queued/generating → error
queued/generating → cancelled

재생성 시 기존 generation을 덮어쓰지 않고 새 generation을 만든다.

## 10. Frontend state
Server source of truth:
project / characters / scenes / shots / generation jobs/results

Zustand:
selectedCharacterId / selectedSceneId / selectedShotId / inspector UI / draft / drawer state

서버 canonical data 전체를 Zustand에 복제하지 않는다.

## 11. Autosave
- Project와 Shot 편집은 local draft 유지
- 700ms idle 후 PATCH mutation
- 저장 중/완료/실패 상태 표시
- 저장 실패 시 local draft 유지
- `DATABASE_URL`이 없으면 fixture read-only fallback으로 동작하며 UI에 DB 미연결 상태 표시
- Shot PATCH 직전에 Consistency Engine을 실행해 BLOCK path를 저장 payload에서 제거하고 WARN/AUTO-RESTORE 결과를 UI에 반환

## 12. Theme
next-themes
defaultTheme=system
enableSystem=true
semantic token 기반, 컴포넌트에서 hex 직접 사용 금지

## 13. UI ownership
shadcn primitive:
Button, Input, Textarea, Select, Tabs, Sheet, Dialog, Popover, Tooltip, Skeleton, Separator, ScrollArea, DropdownMenu

제품 컴포넌트:
AppShell, AppRail, BrowserPanel, BrowserItem, WorkspaceHeader, PreviewSurface, Inspector, InspectorSection, AssetReference, StateChip, StatusPill, ConsistencyBar, WarningPanel, GenerationCard, VersionCard

## 14. Responsive
>=1440: Rail + Browser + Preview + Inspector
1024–1439: compact Browser + 360px Inspector
768–1023: Inspector를 Sheet로
<768: 생성 상태 확인/결과 승인 중심

## 15. Accessibility
semantic HTML, keyboard controls, visible focus, label 연결, color-only status 금지, reduced-motion, video controls keyboard 접근

## 16. 핵심 테스트
Domain:
- State merge
- conflict resolution
- canon block
- temporal replacement
- prompt compilation

UI:
- selected shot 변경 시 Preview/Inspector 동기화
- warning resolve
- autosave status
- system theme

E2E:
새 프로젝트 → 캐릭터 확정 → 장면 → 샷 → 연출 변경 → 일관성 통과 → Mock Generate → 버전 사용

## 17. 구현 순서
1. App foundation + tokens + shell — 구현
2. The Last Cassette mock fixture로 5개 화면 완성 — 구현
3. Consistency Engine + 실행 테스트 — 구현
4. PostgreSQL/Drizzle persistence 코드 + autosave — 구현, 실제 DB round-trip 미검증
5. Prompt Compiler — 구현
6. Mock Generation Provider — 구현
7. Higgsfield Seedance 2.5 REST adapter — 구현, live credential 검증 미실행
8. E2E/accessibility/polish — 남음

실제 외부 API보다 Mock full-flow를 먼저 완성한다.

## 18. 완료 기준
1. 프로젝트 생성부터 결과 선택까지 이동 가능
2. Shot 화면의 위계 유지
3. Consistency Engine 핵심 테스트 통과
4. Prompt Compiler가 Resolved State만 입력
5. provider 교체 가능
6. Light/Dark/System 작동
7. 저장 실패 시 변경 내용 보존
8. 주요 keyboard flow 사용 가능
9. Playwright 핵심 E2E 통과
10. README/User manual 최신 상태

## 19. RC Generation lifecycle amendment

Generation review is complete when the user can perform all of the following without editing prompts manually:

```text
Generate
→ Poll status
→ Review result
→ Regenerate same direction
→ Select a version
→ Return to Shot and adjust
```

Running requests may also be cancelled when the provider exposes cancellation.

Provider lifecycle data is persisted in `generations.settings.providerControl`:

```ts
{
  statusUrl?: string
  cancelUrl?: string
}
```

Status/cancel operations must dispatch using the `provider` stored on the Generation row, not the application's current `VIDEO_PROVIDER` setting. This keeps existing jobs operable if the configured default provider changes later.

Version selection is a transaction: clear `selected` for the same shot, then set the chosen successful Generation to `selected=true`.

## 20. RC external acceptance gates

Code-complete RC is promoted to v1.0.0 only after:

1. dependency install + full TypeScript check + production build,
2. PostgreSQL migration/seed/read-write round-trip,
3. one explicitly approved live Higgsfield request.

The live verification script requires `ALLOW_PAID_GENERATION=1` to prevent accidental paid calls.
