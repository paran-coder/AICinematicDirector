# AI Cinematic Director-v1.0.0 — implementation-spec

## Architecture

```text
Next.js UI
  ├─ Native IndexedDB
  │   ├─ Project draft
  │   ├─ Shot draft
  │   └─ Generation history
  ├─ Consistency Engine (client/domain)
  └─ Server Generation API
      ├─ Prompt Compiler
      └─ VideoProvider
          ├─ Mock
          └─ Higgsfield Seedance 2.5
```

## Persistence

외부 DB를 사용하지 않는다. 브라우저 표준 IndexedDB를 직접 사용한다.

Keys:
- `project:{projectId}`
- `shot:{projectId}:{shotId}`
- `generations:{projectId}`

Autosave:
- Project: 700ms debounce
- Shot: 700ms debounce

Durability:
- 가능한 경우 `navigator.storage.persist()`
- 사용자 백업은 JSON Export/Import

## Security
Higgsfield API credentials는 서버 환경 변수에만 존재한다.
IndexedDB에는 API key를 저장하지 않는다.

## Generation
브라우저가 현재 Shot draft와 aspect ratio를 서버에 전달한다.
서버는 fixture/context + Consistency Engine으로 Resolved State를 다시 만들고 Prompt Compiler를 실행한 뒤 Provider에 요청한다.

생성 결과 metadata와 version selection은 IndexedDB에 저장한다.
영상 바이너리를 IndexedDB에 장기 보관하지 않는다.

## External dependencies
런타임 필수 의존성은 Next.js / React만 유지한다.
DB ORM 및 외부 persistence 라이브러리를 사용하지 않는다.

## Backup format
```json
{
  "format": "ai-cinematic-director",
  "version": 1,
  "projectId": "demo",
  "exportedAt": "...",
  "records": []
}
```

영상 파일 자체는 백업 JSON에 포함하지 않는다.
