# AI Cinematic Director-v1.0.0 — checklist

## 제품/UX
- [x] 프로젝트
- [x] 캐릭터
- [x] 장면
- [x] 샷
- [x] 생성
- [x] Shot 기준 UI polish
- [x] 시스템 Light/Dark
- [x] reduced-motion
- [x] 자세한 /guide 페이지
- [x] 1200×630 /og-image.png metadata 선등록

## Local-first Persistence
- [x] 외부 PostgreSQL/Neon 계획 제거
- [x] Drizzle/Postgres 의존 제거
- [x] Native IndexedDB 저장소
- [x] Project 700ms autosave
- [x] Shot 700ms autosave
- [x] Generation history 로컬 저장
- [x] Version selection 로컬 저장
- [x] navigator.storage.persist() 요청
- [x] JSON backup export
- [x] JSON backup import
- [ ] 배포 브라우저 reload round-trip QA
- [ ] JSON export/import 실제 QA

## Consistency Engine
- [x] PROJECT / SCENE / SHOT / FREE
- [x] State composition
- [x] AUTO_RESOLVE / WARN / BLOCK
- [x] Canon 보호
- [x] Scene 환경과 Shot override 경고
- [x] 핵심 테스트 5/5

## Generation
- [x] Prompt Compiler
- [x] MockVideoProvider
- [x] Higgsfield Seedance 2.5 REST adapter
- [x] Text/Image-to-Video
- [x] 상태 polling
- [x] 재생성
- [x] 버전 선택
- [x] 취소 API
- [ ] 실제 Higgsfield live generation

## 품질 Gate
- [x] Integration assertions
- [ ] npm install / typecheck
- [ ] next build
- [ ] Playwright 핵심 flow
- [ ] 배포본 Local-first QA
