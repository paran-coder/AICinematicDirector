# AI Cinematic Director-v1.0.0 — Implementation Status

Date: 2026-10-01

## Persistence 방향 변경

v1.0.0은 PostgreSQL/Neon/Drizzle을 사용하지 않는 Local-first 구조로 변경했습니다.

현재 저장 대상:
- Project form
- Shot direction
- Generation history
- Selected generation version

저장 위치:
- 브라우저 IndexedDB

추가:
- `navigator.storage.persist()` 요청
- 프로젝트 JSON 백업 내보내기
- 프로젝트 JSON 백업 가져오기

제거:
- PostgreSQL
- Drizzle ORM
- SQL migration/seed
- DB persistence API
- DB 관련 환경 변수와 검증 Gate

## 서버 역할
- Higgsfield credentials 보호
- Prompt compile
- Video Provider submit/status/cancel

## 기존 핵심 기능
- 5개 핵심 화면
- Consistency Engine
- Seedance Prompt Compiler
- MockVideoProvider
- Higgsfield Seedance 2.5 REST adapter
- Generation 재생성 / 버전 선택 / 취소
- 시스템 Light/Dark
- Shot UI polish
- 자세한 `/guide` 사용법
- 1200×630 `/og-image.png` Open Graph metadata

## 남은 외부 검증
1. Vercel production build
2. 배포 브라우저에서 IndexedDB autosave → reload round-trip
3. JSON backup export/import round-trip
4. Higgsfield credentials로 live generation 1회

서버 DB 검증은 더 이상 필요하지 않습니다.
