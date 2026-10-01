# AI Cinematic Director-v1.0.0 — context-notes

## 1. 제품 기준선
AI Cinematic Director는 사용자의 영상 아이디어를 받아 캐릭터·장소·소품·스타일의 일관성을 유지하면서 장면(Scene) → 샷(Shot) → 생성(Generate)까지 연결하는 AI 영상 프리프로덕션/연출 도구다.

핵심 사용자 흐름:
프로젝트 → 캐릭터 → 장면 → 샷 → 생성 → 결과 검토 → 채택 / 재생성 / 샷 수정

핵심 구조:
Character Factory → Canonical Assets → Consistency Engine → Resolved State → Prompt Compiler → Video Provider

## 2. v1.0.0 범위
포함:
- 프로젝트 생성 및 Story Idea 입력
- Character 추출/수정
- Character Sheet 기준 상태
- Character State
- Location / Prop / Visual Style
- Scene Breakdown
- Shot Breakdown
- 연기 / 카메라 / 조명 연출
- First Frame/Reference Preview
- Consistency Engine
- Seedance 계열 Prompt Compiler
- 영상 생성 요청/상태/결과/재생성
- Generation version 선택
- 시스템 테마(Light/Dark/System)
- 자동 저장
- Empty / Loading / Warning / Error 상태

제외:
- NLE Timeline Editor
- 음악/보이스 스튜디오
- Lip Sync
- 팀 협업
- 댓글
- Marketplace
- 결제/구독
- 복잡한 버전 브랜치
- 다중 영상 모델 UI
- 장편 영화 제작 관리

## 3. UX 기준선
UI 기준 화면은 Shot 화면이다.
공통 구조:
- App Rail
- Breadcrumb
- Browser Panel
- Preview Surface
- Inspector
- Compact Consistency Bar
- Primary CTA

원칙:
1. Preview가 가장 강한 시각적 요소
2. 한국어 우선
3. 촬영 현장에서 자연스러운 고유 용어만 영어/음차 유지
4. Scope, JSON, Canon, Resolver 같은 내부 개념은 사용자에게 노출하지 않음
5. 정상 상태는 조용하게, 문제가 있을 때만 강조
6. Primary CTA는 화면당 하나
7. 자동 저장
8. 테마 기본값은 System
9. 모션은 상태 이해에 필요한 곳만
10. reduced-motion 지원

## 4. Consistency Engine
Scope:
- PROJECT
- SCENE
- SHOT
- FREE

기본 규칙:
- Character Identity → PROJECT
- Wardrobe / Physical State → SCENE
- Expression / Pose / Action → SHOT
- Micro Motion → FREE
- Location Structure → PROJECT
- Location Environment / Lighting → SCENE
- Prop Design → PROJECT
- Prop Condition → SCENE
- Style / Camera Language → PROJECT
- Cinematography Decision → SHOT

State 합성:
Base Asset + Persistent State + Scene State + Shot State + Explicit User Override = Resolved State

충돌 해결 우선순위:
1. Explicit User Override
2. Canon Protection
3. Specificity
4. Scope Proximity
5. State Category Logic
6. Temporal Order
7. Numeric Priority
8. Existing Value

충돌 액션:
- AUTO_RESOLVE
- WARN
- BLOCK

환경과 결과 State는 분리한다. 예: Rain != Character Wet.

## 5. 데이터 원칙
핵심 데이터:
- projects
- characters
- character_states
- locations
- props
- scenes
- scene_characters
- scene_props
- shots
- generations
- generation_assets

원칙:
- 관계가 중요한 것은 관계형 테이블
- 외형, 카메라, 상태 변화처럼 스키마가 변하기 쉬운 것은 JSONB
- Shot마다 Character 전체를 복사하지 않음
- 원본 + State + Scene + Shot override를 생성 직전에 resolve

## 6. Prompt Compiler 원칙
Prompt Compiler는 Consistency를 판단하지 않는다.

입력:
- Resolved Character
- Resolved Location
- Resolved Props
- Resolved Style
- Shot Direction

출력:
- Seedance용 구조화 Prompt

즉 Consistency Engine은 판단, Prompt Compiler는 표현을 담당한다.

## 7. 외부 Video Provider 원칙
초기 설계에서는 제공된 프롬프팅 자료와 API 계약을 분리했다. 이후 공식 Higgsfield API 문서를 별도로 검증했고 v1.0.0에 Seedance 2.5 REST adapter를 추가했다.

현재 공식 연결 기준:
- Text-to-Video: `POST https://api.higgsfield.ai/bytedance/seedance-2.5/text-to-video`
- Image-to-Video: `POST https://api.higgsfield.ai/bytedance/seedance-2.5/image-to-video`
- 상태 조회: `GET https://api.higgsfield.ai/requests/{request_id}/status`
- 인증: `Authorization: Key HF_API_KEY_ID:HF_API_KEY_SECRET`

제품 코드에서는 여전히 `VideoProvider` 인터페이스를 유지해 UI/Domain이 Higgsfield 전용 계약에 직접 의존하지 않는다. First Frame이 있으면 Image-to-Video, 없으면 Text-to-Video를 사용한다. 이미지 참조 URL은 Higgsfield가 접근 가능한 공개 URL이어야 한다.

## 8. 프로젝트 버전
프로젝트명: AI-Cinematic-Director-v1.0.0
이 문서를 구현 중 범위 판단의 기준선으로 사용한다.
