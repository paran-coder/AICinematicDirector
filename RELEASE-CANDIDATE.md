# AI Cinematic Director-v1.0.0 — Release Candidate

Date: 2026-10-01

## 상태
v1.0.0은 Local-first RC입니다.

핵심 루프:
프로젝트 편집 → 브라우저 자동저장 → 캐릭터/장면 → 샷 연출 → Consistency Resolve → Prompt Compile → Video Provider → 결과 검토 → 재생성/버전 선택

## Persistence
외부 DB를 사용하지 않습니다.

- IndexedDB: 프로젝트 / 샷 / 생성 기록
- JSON Export/Import: 백업과 이동
- Server: 사용자 프로젝트 데이터 미보관

## 배포 승인 전 Gate
1. Production build 성공
2. IndexedDB 저장 후 새로고침 round-trip
3. JSON 백업 내보내기/가져오기 round-trip
4. 실제 Higgsfield generation 1회

## OG
`/og-image.png` 1200×630 파일을 추가하면 이미 등록된 Open Graph/Twitter metadata에서 사용합니다.
