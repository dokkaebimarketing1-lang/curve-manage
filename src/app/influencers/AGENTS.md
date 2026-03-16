# INFLUENCERS PAGE

메인 인플루언서 관리 테이블. 프로젝트에서 가장 복잡한 페이지.

## STRUCTURE
```
influencers/
├── page.tsx              # Server component — 데이터 fetch + 탭 카운트
├── influencer-table.tsx  # Client component — TanStack Table (정렬/필터/벌크/리사이즈)
├── columns.tsx           # 19개 컬럼 정의 + 인라인 편집 셀 컴포넌트 7종
└── detail-panel.tsx      # 행 더블클릭 → Sheet 상세보기
```

## WHERE TO LOOK
| Task | File | Notes |
|------|------|-------|
| 컬럼 추가/수정 | columns.tsx | `columns` 배열에 ColumnDef 추가, 편집 셀 컴포넌트 필요 |
| 필터/탭/검색 | influencer-table.tsx | URL searchParams 기반, 서버에서 재 fetch |
| 벌크 액션 추가 | influencer-table.tsx | `handleBulkDelete`, `handleBulkMoveTab` 패턴 참고 |
| 상세보기 필드 추가 | detail-panel.tsx | `fieldLabels` 배열에 추가 |

## CELL COMPONENT PATTERNS
| 컴포넌트 | 용도 | 저장 방식 |
|----------|------|----------|
| `EditableTextCell` | 텍스트 인라인 편집 | blur → `saveField()` |
| `EditableNumberCell` | 숫자 인라인 편집 | blur → `saveField()` |
| `EditableSelectCell` | 드롭다운 선택 | change → `saveField()` |
| `EditableMustDoCell` | 체크 토글 | click → `saveField()` |
| `EditableUrlCell` | URL + 자동 크롤링 | blur → `crawlAndUpdateInfluencer()` + `router.refresh()` |
| `UploadableImageCell` | 이미지 업로드 | file → `uploadInfluencerImage()` + `router.refresh()` |
| `ActionsCell` | 삭제 버튼 | confirm → `deleteInfluencer()` + `router.refresh()` |

## ANTI-PATTERNS
- `saveField()`에 `router.refresh()` 추가하지 말 것 — 깜빡거림 발생 (로컬 state로 충분)
- `updateInfluencerField`에 `revalidatePath` 추가하지 말 것 — 같은 이유
- `router.refresh()`는 크롤링/삭제/추가 등 전체 데이터가 변하는 경우에만 사용
- shadcn Select 대신 네이티브 `<select>` 사용 — 수십 개 셀에서 성능 이슈
