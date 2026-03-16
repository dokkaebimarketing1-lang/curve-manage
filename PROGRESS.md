# 커브 관리 — 프로젝트 진행률

**작성일:** 2026-03-16  
**배포 URL:** https://curve-manage.vercel.app  
**GitHub:** https://github.com/dokkaebimarketing1-lang/curve-manage  

---

## 전체 완성도: 68%

```
전체    ██████████████░░░░░░░  68%
기능    ███████████████████░   95%
UI      ████████████████░░░░   80%
운영    █████░░░░░░░░░░░░░░░   25%
```

---

## 1. 기능 구현 — 95%

### 페이지 (3개, 전부 완료)

| 페이지 | 경로 | 상태 | 주요 기능 |
|--------|------|------|-----------|
| 인플루언서 테이블 | `/influencers` | ✅ 완료 | 19컬럼 인라인 편집, 탭 필터, 벌크 액션, CSV 내보내기 |
| 광고 보드 | `/ads` | ✅ 완료 | 카드 CRUD, 폴더 관리, YouTube 썸네일 자동 추출 |
| CSV 임포트 | `/import` | ✅ 완료 | 드래그앤드롭, 자동 컬럼 매핑, 청크 처리(100행씩) |

### Server Actions (26개, 전부 구현)

| 파일 | 함수 | 상태 |
|------|------|------|
| influencer.ts | `getInfluencers`, `getTabCounts`, `getInfluencer`, `createInfluencer`, `updateInfluencer`, `deleteInfluencer`, `updateInfluencerField`, `crawlAllMissingImages`, `crawlAndUpdateInfluencer` | ✅ 전부 완료 |
| upload.ts | `uploadInfluencerImage` | ✅ 완료 |
| import.ts | `bulkCreateInfluencers` | ✅ 완료 |
| ads.ts | `getFolders`, `createFolder`, `updateFolder`, `deleteFolder`, `getAdCards`, `createAdCard`, `updateAdCard`, `deleteAdCard`, `moveAdCard` | ✅ 완료 |
| ad-card.ts | `getFolders`, `createFolder`, `deleteFolder`, `getAdCards`, `createAdCard`, `updateAdCard`, `deleteAdCard` | ⚠️ ads.ts와 중복 — 정리 필요 |

### 크롤러 (4종, 전부 구현)

| 플랫폼 | 파일 | 상태 | 구현 방식 |
|--------|------|------|-----------|
| Instagram | instagram.ts | ✅ 완료 | 3단계 폴백: i.instagram.com API → GraphQL → og:image |
| YouTube | youtube.ts | ✅ 완료 | YouTube Data API v3 (YOUTUBE_API_KEY 필요) |
| TikTok | tiktok.ts | ✅ 완료 | `__UNIVERSAL_DATA_FOR_REHYDRATION__` JSON → og:image 폴백 |
| 네이버 블로그 | naver-blog.ts | ✅ 완료 | 모바일 URL + 모바일 UA → PostView iframe 폴백 |

### 데이터베이스 (3 테이블, CRUD 100% 커버)

| 테이블 | 컬럼 수 | Actions 커버리지 |
|--------|---------|-----------------|
| influencers | 19 | ✅ 100% |
| ad_cards | 9 | ✅ 100% |
| folders | 5 | ✅ 100% |

---

## 2. UI / 디자인 — 80%

### 컴포넌트 현황

| 분류 | 사용 중 | 미사용 | 비고 |
|------|---------|--------|------|
| 레이아웃 | 3/3 | 0 | main-layout, sidebar, header |
| 커스텀 | 1/3 | 2 | image-cell 사용, color-badge·toast 미사용 |
| shadcn/ui | 8/14 | 6 | tabs, dropdown-menu, popover, scroll-area, skeleton, separator, command 미사용 |

### 인플루언서 테이블 컬럼 (19개, 전부 인라인 편집)

| 컬럼 | 편집 셀 타입 |
|------|-------------|
| NO | 표시 전용 |
| 닉네임, 성함, 연락처, 선정이유, 비고, 메일 | EditableTextCell |
| 프로필, 인기, 비인기 | UploadableImageCell |
| URL | EditableUrlCell (자동 크롤링) |
| 분류, 협업형태, 카테고리, 성별 | EditableSelectCell |
| 팔로워수, 단가 | EditableNumberCell |
| 무조건 | EditableMustDoCell |
| 관리 | ActionsCell (삭제) |

### 미완료 항목

| 항목 | 상태 | 설명 |
|------|------|------|
| 다크 모드 | ❌ 미구현 | CSS 변수 미정의, `dark:` 클래스 일부만 존재 |
| 모바일 반응형 | ⚠️ 부분 | 사이드바 w-[260px] 고정, 모바일 접기 없음 |
| 미사용 컴포넌트 정리 | ⚠️ 정리 필요 | 8개 컴포넌트 삭제 가능 |

---

## 3. 운영 준비 (Production) — 25%

| 항목 | 상태 | 상세 |
|------|------|------|
| 인증 (로그인/회원가입) | ❌ 없음 | Supabase Auth 미연동, 누구나 접근 가능 |
| 미들웨어 (라우트 보호) | ❌ 없음 | middleware.ts 파일 없음 |
| error.tsx (에러 바운더리) | ❌ 없음 | Server Action try-catch + toast만 존재 |
| loading.tsx (로딩 상태) | ❌ 없음 | skeleton 컴포넌트 설치만 됨, 미사용 |
| 환경변수 검증 | ❌ 없음 | `!` assertion 사용, 누락 시 런타임 크래시 |
| 테스트 | ❌ 없음 | 테스트 파일 0개, 인프라 미구성 |
| SEO (메타데이터) | ✅ 완료 | layout.tsx에 title, description, lang="ko" |
| TypeScript strict | ✅ 완료 | strict: true, `any` 타입 없음 |
| 접근성 (a11y) | ⚠️ 부분 | 시맨틱 HTML 사용, ARIA 라벨 부족 |

---

## 환경 정보

| 항목 | 값 |
|------|-----|
| Framework | Next.js 16.1.6 (Turbopack) |
| Styling | Tailwind CSS v4 (@theme inline) |
| UI Library | shadcn/ui + Radix UI |
| Database | Supabase (현재 로컬 전용) |
| Table | TanStack Table v8 |
| Hosting | Vercel |
| Git Branch | master |

### 필요 환경변수

```
NEXT_PUBLIC_SUPABASE_URL=     # Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=     # Supabase service role key
YOUTUBE_API_KEY=               # YouTube Data API v3
```

---

## 다음 단계 (우선순위)

1. **Supabase 호스팅 연결** — 프로덕션 DB 설정 + Vercel 환경변수 등록
2. **인증 구현** — Supabase Auth + 로그인 페이지 + middleware 라우트 보호
3. **에러/로딩 처리** — error.tsx, loading.tsx 추가
4. **중복 액션 정리** — ad-card.ts ↔ ads.ts 통합
5. **모바일 대응** — 사이드바 접기, 테이블 스크롤 최적화
6. **다크 모드** — CSS 변수 정의 + 토글 UI
