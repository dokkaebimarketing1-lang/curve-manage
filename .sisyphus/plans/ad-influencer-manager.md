# 광고/인플루언서 웹 관리 도구

## TL;DR

> **Quick Summary**: 구글시트 기반의 인플루언서/광고 관리를 이미지 지원이 가능한 웹 앱으로 대체. 인플루언서 테이블 뷰(인라인 편집 + URL 크롤링 자동화) + 광고 레퍼런스 보드(Pinterest/Snipit 스타일 카드 그리드)의 2개 모듈 구축.
> 
> **Deliverables**:
> - 인플루언서 관리 페이지 (18필드 테이블 + 인라인 편집 + URL 크롤링)
> - 광고 레퍼런스 보드 페이지 (폴더 네비게이션 + 카드 그리드 + URL 크롤링)
> - CSV 데이터 임포트 기능
> - Vercel 배포
> 
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 5 waves
> **Critical Path**: T1 → T3 → T6 → T10 → T14 → T18 → T22 → Final

---

## Context

### Original Request
Notion 페이지 "파일 정리 (광고 / 인플루언서)"에서 의뢰. 엑셀/구글시트로 광고와 인플루언서 데이터를 관리하는데 이미지 첨부가 어려워서, 웹 기반 관리 도구로 전환 요청.

### Interview Summary
**Key Discussions**:
- **기술 스택**: Next.js + Supabase + Vercel 확정
- **크롤링 범위**: Instagram + YouTube + TikTok + 일반 URL(OG태그) 4개 플랫폼
- **편집 방식**: 인라인 셀 편집 (스프레드시트 스타일) 선택
- **인증**: 없음 (1인 사용)
- **데이터 이전**: 기존 구글시트에서 CSV 업로드
- **탭 구조**: 기존 시트 탭(참고/리스트업/mcn/무조건/과거/공구브랜드/광고)을 필터/프리셋으로 변환
- **영상 크롤링**: 채널 URL 진입 → 영상 목록 분석 → 조회수 높은/낮은 영상 썸네일 자동 추출

**Research Findings**:
- **유광기**: 테이블+이미지+컬러태그 인플루언서 관리 도구 (참조 UI)
- **뷰트랩**: 채널 분석 도구, 썸네일+조회수+평점 표시 (참조 UI)
- **Snipit**: 콘텐츠 레퍼런스 보드, 폴더+카드그리드+검색 (참조 UI)
- **기존 시트 구조**: 18개 컬럼 (NO, 닉네임, 프로필, 조회수 높은/낮은 영상, URL, 분류, 협업형태, 카테고리, 팔로워수, 성함, 성별, 연락처, 무조건, 선정이유, 비고, 메일, 단가)

### Metis Review
**Identified Gaps** (addressed):
- Instagram/TikTok 크롤링 불안정 → 수동 이미지 업로드 fallback을 1급 기능으로 구현
- 인라인 편집 복잡도 3-5배 → 사용자 선택 존중, TanStack Table 편집 모드 활용
- 인증 없는 PII 노출 → 사용자 결정 존중
- Vercel 10초 함수 timeout → 크롤링 경량화, HTTP 기반만 사용 (Puppeteer 금지)
- CDN URL 만료 → 모든 이미지 Supabase Storage로 프록시 저장
- YouTube API 쿼터 (10,000/day) → 채널당 약 21유닛 소비, 일일 ~475채널 가능
- Supabase 무료 1GB 저장 → 이미지 압축 필수

---

## Work Objectives

### Core Objective
구글시트를 대체하는 이미지 중심 웹 관리 도구 구축. 인플루언서 데이터의 테이블형 관리 + 광고 레퍼런스의 비주얼 보드형 관리를 하나의 Next.js 앱으로 통합.

### Concrete Deliverables
- Next.js 15 앱 (App Router)
- Supabase DB (influencers, ad_cards, folders, categories 테이블)
- Supabase Storage (이미지 저장)
- 인플루언서 관리 페이지 (`/influencers`)
- 광고 레퍼런스 보드 페이지 (`/ads`)
- CSV 임포트 기능
- 크롤링 엔진 (YouTube API + Instagram/TikTok HTML 파싱 + OG태그)
- Vercel 배포 설정

### Definition of Done
- [ ] `/influencers` 페이지에서 18필드 테이블이 표시되고 인라인 편집 가능
- [ ] URL 입력 시 프로필+영상 썸네일이 자동 크롤링되어 이미지로 표시
- [ ] 필터 프리셋(참고/리스트업/mcn/무조건/과거/공구브랜드/광고)으로 필터링 가능
- [ ] `/ads` 페이지에서 폴더 네비게이션 + 카드 그리드가 표시
- [ ] URL 입력 시 썸네일이 자동 크롤링되어 카드로 생성
- [ ] CSV 파일 업로드로 기존 데이터 임포트 가능
- [ ] `bun run build` 성공
- [ ] Vercel 배포 URL로 접속 가능

### Must Have
- 인플루언서 18필드 CRUD (생성/조회/수정/삭제)
- 인라인 셀 편집 (셀 클릭 → 직접 입력)
- URL → 프로필 이미지 + 영상 썸네일 자동 크롤링
- 이미지 수동 업로드 fallback (크롤링 실패 시)
- 광고 카드 CRUD + 폴더 관리
- URL → 썸네일 자동 크롤링 (광고 보드용)
- CSV 임포트 (구글시트 → 새 시스템)
- 필터/검색 기능
- 이미지 Supabase Storage 프록시 저장

### Must NOT Have (Guardrails)
- 인라인 편집 외 별도의 폼/드로어 편집 UI (이중 구현 금지)
- Puppeteer/Playwright 기반 크롤링 (Vercel 서버리스 비호환)
- 정기적/자동 재크롤링 (v1 범위 아님)
- 실시간 동기화 / 다중 사용자 기능
- 스프레드시트 수식/조건부서식/셀 병합
- 인플루언서↔광고 모듈 간 교차 참조
- AI 자동 분류/추천 기능
- 다크모드/테마 변경
- PDF/Excel 내보내기
- 18필드 외 추가 필드 (승인 없이)
- 배치 크롤링 (v1은 1건씩만)
- 외부 CDN URL 직접 저장 (반드시 Supabase Storage 경유)

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (신규 프로젝트)
- **Automated tests**: None (Agent QA가 주 검증 수단)
- **Framework**: N/A

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (playwright skill) — Navigate, interact, assert DOM, screenshot
- **API/Backend**: Use Bash (curl) — Send requests, assert status + response fields
- **Build**: `bun run build` — exit code 0

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — 5 parallel tasks):
├── T1: Next.js 15 + Tailwind + Shadcn UI 프로젝트 스캐폴딩 [quick]
├── T2: Supabase 클라이언트 설정 (서버+브라우저) [quick]
├── T3: DB 스키마 설계 + 마이그레이션 (influencers, ad_cards, folders, categories) [quick]
├── T4: UI 공통 컴포넌트 (레이아웃, 네비게이션, 토스트, 로딩) [visual-engineering]
├── T5: 디자인 시스템 토큰 + 색상 태그 시스템 [quick]

Wave 2 (인플루언서 데이터 레이어 — 5 parallel tasks):
├── T6: 인플루언서 CRUD Server Actions (depends: T2, T3) [unspecified-high]
├── T7: 카테고리/태그 시스템 + 필터 쿼리 빌더 (depends: T3) [unspecified-high]
├── T8: CSV 파서 + 필드 검증 + 정규화 (depends: T3) [unspecified-high]
├── T9: 이미지 업로드 서비스 (Supabase Storage) (depends: T2) [unspecified-high]
├── T10: 크롤링 엔진 — YouTube Data API v3 (depends: T9) [deep]

Wave 3 (크롤링 + 인플루언서 UI — 6 parallel tasks):
├── T11: 크롤링 엔진 — Instagram HTML/OG 파싱 (depends: T9) [deep]
├── T12: 크롤링 엔진 — TikTok HTML hydration 파싱 (depends: T9) [deep]
├── T13: 크롤링 엔진 — 일반 URL OG태그 추출 (depends: T9) [unspecified-high]
├── T14: 크롤링 오케스트레이터 (URL 감지→라우팅→Storage 저장→fallback) (depends: T10,T11,T12,T13) [deep]
├── T15: 인플루언서 테이블 UI — TanStack Table + 컬럼 정의 + 이미지 셀 (depends: T5, T6) [visual-engineering]
├── T16: 인플루언서 인라인 편집 — TanStack Table 편집 모드 (depends: T15) [deep]

Wave 4 (인플루언서 완성 + 광고 보드 — 6 parallel tasks):
├── T17: 인플루언서 필터바 + 탭 프리셋 + URL 상태 (depends: T7, T15) [visual-engineering]
├── T18: 인플루언서 행 추가 + 크롤링 연동 + 수동 업로드 (depends: T14, T16) [deep]
├── T19: 광고 카드+폴더 CRUD Server Actions (depends: T2, T3) [unspecified-high]
├── T20: 광고 보드 — 사이드바 폴더 네비게이션 (depends: T4, T19) [visual-engineering]
├── T21: 광고 보드 — Masonry 카드 그리드 (depends: T5, T19) [visual-engineering]
├── T22: 광고 카드 생성 (URL 크롤링 프리뷰 + 수동입력) (depends: T14, T19) [deep]

Wave 5 (통합 + 마무리 — 5 parallel tasks):
├── T23: 광고 카드 상세 모달 + 편집 + 삭제 (depends: T21, T22) [visual-engineering]
├── T24: CSV 임포트 UI (파일 업로드 + 미리보기 + 진행률) (depends: T8, T15) [visual-engineering]
├── T25: 검색 기능 (인플루언서 텍스트 검색 + 광고 보드 검색) (depends: T15, T21) [unspecified-high]
├── T26: 에러 바운더리 + 로딩 스켈레톤 + 빈 상태 + 반응형 (depends: T16, T23) [visual-engineering]
├── T27: Vercel 배포 설정 + 환경변수 + 최종 빌드 (depends: ALL) [quick]

Wave FINAL (After ALL — 4 parallel review tasks):
├── F1: Plan compliance audit (oracle)
├── F2: Code quality review (unspecified-high)
├── F3: Real manual QA (unspecified-high + playwright)
└── F4: Scope fidelity check (deep)

Critical Path: T1 → T3 → T6 → T15 → T16 → T18 → T27 → Final
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 6 (Waves 3, 4)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| T1 | — | T2-T5 | 1 |
| T2 | — | T6, T9, T19 | 1 |
| T3 | — | T6, T7, T8, T19 | 1 |
| T4 | — | T20 | 1 |
| T5 | — | T15, T21 | 1 |
| T6 | T2, T3 | T15 | 2 |
| T7 | T3 | T17 | 2 |
| T8 | T3 | T24 | 2 |
| T9 | T2 | T10, T11, T12, T13 | 2 |
| T10 | T9 | T14 | 2 |
| T11 | T9 | T14 | 3 |
| T12 | T9 | T14 | 3 |
| T13 | T9 | T14 | 3 |
| T14 | T10-T13 | T18, T22 | 3 |
| T15 | T5, T6 | T16, T17, T24, T25 | 3 |
| T16 | T15 | T18, T26 | 3 |
| T17 | T7, T15 | — | 4 |
| T18 | T14, T16 | — | 4 |
| T19 | T2, T3 | T20, T21, T22 | 4 |
| T20 | T4, T19 | — | 4 |
| T21 | T5, T19 | T23, T25 | 4 |
| T22 | T14, T19 | T23 | 4 |
| T23 | T21, T22 | T26 | 5 |
| T24 | T8, T15 | — | 5 |
| T25 | T15, T21 | — | 5 |
| T26 | T16, T23 | — | 5 |
| T27 | ALL | Final | 5 |

### Agent Dispatch Summary

- **Wave 1 (5)**: T1→`quick`, T2→`quick`, T3→`quick`, T4→`visual-engineering`, T5→`quick`
- **Wave 2 (5)**: T6→`unspecified-high`, T7→`unspecified-high`, T8→`unspecified-high`, T9→`unspecified-high`, T10→`deep`
- **Wave 3 (6)**: T11→`deep`, T12→`deep`, T13→`unspecified-high`, T14→`deep`, T15→`visual-engineering`, T16→`deep`
- **Wave 4 (6)**: T17→`visual-engineering`, T18→`deep`, T19→`unspecified-high`, T20→`visual-engineering`, T21→`visual-engineering`, T22→`deep`
- **Wave 5 (5)**: T23→`visual-engineering`, T24→`visual-engineering`, T25→`unspecified-high`, T26→`visual-engineering`, T27→`quick`
- **FINAL (4)**: F1→`oracle`, F2→`unspecified-high`, F3→`unspecified-high`, F4→`deep`

---

## TODOs

- [ ] 1. Next.js 15 + Tailwind + Shadcn UI 프로젝트 스캐폴딩

  **What to do**:
  - `bunx create-next-app@latest` 으로 Next.js 15 프로젝트 생성 (App Router, TypeScript, Tailwind CSS, src/ 디렉토리 사용)
  - `bunx shadcn@latest init` 으로 Shadcn UI 초기화
  - 필요한 Shadcn 컴포넌트 사전 설치: Button, Input, Dialog, Sheet, Table, Select, Badge, Toast, Tabs, Card, DropdownMenu, Popover, Command, Separator, Skeleton, ScrollArea
  - `bun add @tanstack/react-table` TanStack Table v8 설치
  - `bun add papaparse @types/papaparse` CSV 파서 설치
  - `bun add metascraper metascraper-image metascraper-title metascraper-description metascraper-url` OG태그 추출 설치
  - 프로젝트 루트에 `.env.example` 생성 (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, YOUTUBE_API_KEY)
  - `bun run build` 성공 확인

  **Must NOT do**:
  - Pages Router 사용 금지 (App Router만)
  - 불필요한 라이브러리 추가 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
    - 단순 스캐폴딩 작업이므로 추가 스킬 불필요

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T2, T3, T4, T5)
  - **Blocks**: T2, T3, T4, T5 (모든 Wave 1 태스크가 T1 완료 후 시작)
  - **Blocked By**: None

  **References**:
  - **External**: Next.js 15 공식 문서 (App Router), Shadcn UI 설치 가이드, TanStack Table v8 문서

  **Acceptance Criteria**:
  **QA Scenarios (MANDATORY):**
  ```
  Scenario: 프로젝트 빌드 성공
    Tool: Bash
    Steps:
      1. Run `bun run build`
      2. Check exit code is 0
    Expected Result: 빌드 성공, exit code 0
    Evidence: .sisyphus/evidence/task-1-build-success.txt

  Scenario: 개발 서버 시작
    Tool: Bash
    Steps:
      1. Run `bun run dev &` (백그라운드)
      2. Wait 5 seconds
      3. `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`
    Expected Result: HTTP 200
    Evidence: .sisyphus/evidence/task-1-dev-server.txt

  Scenario: Shadcn 컴포넌트 설치 확인
    Tool: Bash
    Steps:
      1. Check `src/components/ui/button.tsx` exists
      2. Check `src/components/ui/table.tsx` exists
      3. Check `src/components/ui/dialog.tsx` exists
    Expected Result: 모든 파일 존재
    Evidence: .sisyphus/evidence/task-1-shadcn-check.txt
  ```

  **Commit**: YES
  - Message: `chore(scaffold): init next.js 15 + tailwind + shadcn ui`
  - Files: `package.json, tailwind.config.ts, components.json, src/`
  - Pre-commit: `bun run build`

- [ ] 2. Supabase 클라이언트 설정

  **What to do**:
  - `bun add @supabase/supabase-js @supabase/ssr` 설치
  - `src/lib/supabase/client.ts` — 브라우저용 Supabase 클라이언트 생성 함수
  - `src/lib/supabase/server.ts` — 서버 컴포넌트/Server Action용 Supabase 클라이언트 생성 함수 (cookies 사용)
  - `src/lib/supabase/admin.ts` — Service Role Key를 사용하는 관리자 클라이언트 (크롤링 후 이미지 저장용)
  - 환경변수 검증 유틸리티 작성

  **Must NOT do**:
  - 인증 미들웨어 구현 금지 (인증 없음으로 결정)
  - RLS 정책 설정 금지 (1인 사용 + 인증 없음)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T3, T4, T5)
  - **Blocks**: T6, T9, T19
  - **Blocked By**: T1 (프로젝트 존재해야 함)

  **References**:
  - **External**: `@supabase/ssr` 공식 문서, Next.js App Router with Supabase 가이드

  **Acceptance Criteria**:
  **QA Scenarios (MANDATORY):**
  ```
  Scenario: Supabase 클라이언트 파일 존재 확인
    Tool: Bash
    Steps:
      1. Check `src/lib/supabase/client.ts` exists
      2. Check `src/lib/supabase/server.ts` exists
      3. Check `src/lib/supabase/admin.ts` exists
    Expected Result: 3개 파일 모두 존재
    Evidence: .sisyphus/evidence/task-2-files-check.txt

  Scenario: 타입 체크 통과
    Tool: Bash
    Steps:
      1. Run `bunx tsc --noEmit`
    Expected Result: exit code 0
    Evidence: .sisyphus/evidence/task-2-typecheck.txt
  ```

  **Commit**: YES
  - Message: `feat(supabase): setup client for server + browser`
  - Files: `src/lib/supabase/`
  - Pre-commit: `bunx tsc --noEmit`

- [ ] 3. DB 스키마 설계 + 마이그레이션

  **What to do**:
  - `supabase/migrations/` 디렉토리에 SQL 마이그레이션 파일 생성
  - **influencers 테이블**: id (uuid), no (serial), nickname (text), profile_image_url (text), high_view_video_url (text), high_view_video_thumbnail (text), low_view_video_url (text), low_view_video_thumbnail (text), url (text), classification (text), collaboration_type (text), category (text), follower_count (bigint), real_name (text), gender (text), contact (text), must_do (boolean), selection_reason (text), notes (text), email (text), rate (integer), tab_category (text, default 'listup'), created_at (timestamptz), updated_at (timestamptz)
  - **ad_cards 테이블**: id (uuid), folder_id (uuid FK), url (text), thumbnail_url (text), title (text), one_line_review (text), reference_brand (text), source_handle (text), tags (text[]), created_at (timestamptz), updated_at (timestamptz)
  - **folders 테이블**: id (uuid), name (text), parent_id (uuid FK nullable, self-referencing), sort_order (integer), created_at (timestamptz)
  - `src/lib/types/database.ts` — TypeScript 타입 정의 (Supabase generate types 대신 수동 정의)
  - **tab_category ENUM 값**: 'reference' (참고), 'listup' (리스트업), 'mcn' (mcn회사), 'must' (무조건), 'past' (과거), 'group_buy_brand' (공구 하는 브랜드), 'ad' (광고)

  **Must NOT do**:
  - RLS 정책 추가 금지
  - 불필요한 인덱스 추가 금지 (기본 PK만)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T2, T4, T5)
  - **Blocks**: T6, T7, T8, T19
  - **Blocked By**: T1

  **References**:
  - **Pattern References**: Notion 페이지의 기능명세 시트 — 18개 컬럼 정의 (NO, 닉네임, 프로필, 조회수높은영상, 조회수낮은영상, URL, 분류, 협업형태, 카테고리, 팔로워수, 성함, 성별, 연락처, 무조건, 선정이유, 비고, 메일, 단가)
  - **External**: Supabase SQL migration 문서

  **Acceptance Criteria**:
  **QA Scenarios (MANDATORY):**
  ```
  Scenario: 마이그레이션 파일 존재 + 타입 파일 존재
    Tool: Bash
    Steps:
      1. Check `supabase/migrations/` has at least 1 .sql file
      2. Check `src/lib/types/database.ts` exists
      3. Run `bunx tsc --noEmit`
    Expected Result: 파일 존재 + 타입 체크 통과
    Evidence: .sisyphus/evidence/task-3-schema-check.txt

  Scenario: SQL 문법 검증
    Tool: Bash
    Steps:
      1. Read migration SQL file
      2. Verify CREATE TABLE influencers has 22+ columns
      3. Verify CREATE TABLE ad_cards has 11+ columns
      4. Verify CREATE TABLE folders has 5+ columns
      5. Verify tab_category field exists with default value
    Expected Result: 모든 테이블/컬럼 정의 완전
    Evidence: .sisyphus/evidence/task-3-sql-verify.txt
  ```

  **Commit**: YES
  - Message: `feat(db): create schema migrations for all tables`
  - Files: `supabase/migrations/, src/lib/types/database.ts`
  - Pre-commit: `bunx tsc --noEmit`

- [ ] 4. UI 공통 컴포넌트 (레이아웃, 네비게이션)

  **What to do**:
  - `src/app/layout.tsx` — 루트 레이아웃 (한국어, Pretendard/Noto Sans KR 폰트)
  - `src/components/layout/sidebar.tsx` — 좌측 사이드바 네비게이션 (인플루언서/광고보드/CSV임포트 메뉴)
  - `src/components/layout/header.tsx` — 상단 헤더 (페이지 제목, 검색바 슬롯)
  - `src/components/layout/main-layout.tsx` — 사이드바 + 컨텐츠 영역 조합 레이아웃
  - `src/components/ui/toast-provider.tsx` — 토스트 알림 프로바이더
  - `src/app/influencers/page.tsx` — 인플루언서 페이지 빈 껍데기
  - `src/app/ads/page.tsx` — 광고 보드 페이지 빈 껍데기
  - `src/app/import/page.tsx` — CSV 임포트 페이지 빈 껍데기
  - 기본 `/` 라우트는 `/influencers`로 리다이렉트

  **Must NOT do**:
  - 인증 관련 UI 추가 금지
  - 다크모드 토글 추가 금지

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`vercel-react-best-practices`]
    - `vercel-react-best-practices`: Next.js App Router 레이아웃 패턴 최적화

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T2, T3, T5)
  - **Blocks**: T20
  - **Blocked By**: T1

  **References**:
  - **External**: Next.js App Router Layout 문서, Shadcn UI Sidebar 컴포넌트

  **Acceptance Criteria**:
  **QA Scenarios (MANDATORY):**
  ```
  Scenario: 네비게이션 동작 확인
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to http://localhost:3000
      2. Verify redirect to /influencers
      3. Click sidebar "광고 보드" link
      4. Verify URL is /ads
      5. Click sidebar "CSV 임포트" link
      6. Verify URL is /import
    Expected Result: 모든 네비게이션 동작
    Evidence: .sisyphus/evidence/task-4-navigation.png

  Scenario: 레이아웃 구조 확인
    Tool: Playwright
    Steps:
      1. Navigate to /influencers
      2. Assert sidebar element exists
      3. Assert header element exists
      4. Assert main content area exists
    Expected Result: 사이드바+헤더+컨텐츠 3영역 레이아웃
    Evidence: .sisyphus/evidence/task-4-layout.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add layout, navigation, toast, loading components`
  - Files: `src/app/layout.tsx, src/components/layout/, src/app/influencers/, src/app/ads/, src/app/import/`
  - Pre-commit: `bun run build`

- [ ] 5. 디자인 시스템 토큰 + 색상 태그 시스템

  **What to do**:
  - `src/lib/design/colors.ts` — 컬러 태그 시스템 정의 (유광기 참조: 선호=green, 검토중=yellow, PPL확정=blue, 진행중=orange, 완료=gray, 거절=red 등 최소 8개 색상)
  - `src/lib/design/constants.ts` — 분류(classification), 협업형태(collaboration_type), 카테고리(category), 성별(gender) 선택지 상수 정의
  - `src/components/ui/color-badge.tsx` — 컬러 배지 컴포넌트 (태그 표시용)
  - `src/components/ui/image-cell.tsx` — 테이블 이미지 셀 컴포넌트 (썸네일 표시 + 클릭 시 확대 + 로딩 중 스켈레톤 + 깨진 이미지 fallback)
  - tab_category 상수 정의 (7개: reference/listup/mcn/must/past/group_buy_brand/ad)

  **Must NOT do**:
  - 다크모드 색상 정의 금지
  - CSS-in-JS 라이브러리 추가 금지 (Tailwind만 사용)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T2, T3, T4)
  - **Blocks**: T15, T21
  - **Blocked By**: T1

  **References**:
  - **Pattern References**: 유광기 스크린샷 — 다색 상태 배지 (선호/검토중/PPL확정/진행중 등)
  - **External**: Tailwind CSS 색상 팔레트, Shadcn UI Badge 컴포넌트

  **Acceptance Criteria**:
  **QA Scenarios (MANDATORY):**
  ```
  Scenario: 색상 상수 + 배지 컴포넌트 존재
    Tool: Bash
    Steps:
      1. Check `src/lib/design/colors.ts` exists and exports TAG_COLORS
      2. Check `src/lib/design/constants.ts` exports CLASSIFICATION_OPTIONS, COLLABORATION_TYPES, CATEGORIES, TAB_CATEGORIES
      3. Check `src/components/ui/color-badge.tsx` exists
      4. Check `src/components/ui/image-cell.tsx` exists
      5. Run `bunx tsc --noEmit`
    Expected Result: 모든 파일/export 존재 + 타입 체크 통과
    Evidence: .sisyphus/evidence/task-5-design-check.txt
  ```

  **Commit**: YES
  - Message: `feat(design): add design tokens + color tag system`
  - Files: `src/lib/design/, src/components/ui/color-badge.tsx, src/components/ui/image-cell.tsx`
  - Pre-commit: `bunx tsc --noEmit`

- [ ] 6. 인플루언서 CRUD Server Actions

  **What to do**:
  - `src/lib/actions/influencer.ts` — Server Actions:
    - `getInfluencers(filters?)` — 필터 조건으로 인플루언서 목록 조회 (tab_category, classification, collaboration_type, category, search 텍스트)
    - `getInfluencer(id)` — 단일 인플루언서 조회
    - `createInfluencer(data)` — 새 인플루언서 생성
    - `updateInfluencer(id, data)` — 인플루언서 정보 수정 (인라인 편집 시 개별 필드 업데이트 지원)
    - `deleteInfluencer(id)` — 인플루언서 삭제 (확인 후 하드 삭제)
    - `updateInfluencerField(id, field, value)` — 단일 필드만 업데이트 (인라인 편집 최적화)
  - `src/lib/actions/influencer.ts` 내부에서 Supabase server client 사용
  - 에러 핸들링: try/catch + 구조화된 에러 반환 `{ success: boolean, data?, error? }`

  **Must NOT do**:
  - REST API 라우트 생성 금지 (Server Actions만 사용)
  - 클라이언트에서 Supabase 직접 호출 금지

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with T7, T8, T9, T10)
  - **Blocks**: T15
  - **Blocked By**: T2, T3

  **References**:
  - **API/Type References**: `src/lib/types/database.ts` — Influencer 타입 정의 (T3에서 생성)
  - **Pattern References**: `src/lib/supabase/server.ts` — 서버 클라이언트 사용법 (T2에서 생성)
  - **External**: Next.js Server Actions 문서, Supabase JS Client 쿼리 빌더

  **Acceptance Criteria**:
  **QA Scenarios (MANDATORY):**
  ```
  Scenario: CRUD 함수 존재 및 타입 체크
    Tool: Bash
    Steps:
      1. Check `src/lib/actions/influencer.ts` exports getInfluencers, createInfluencer, updateInfluencer, deleteInfluencer, updateInfluencerField
      2. Run `bunx tsc --noEmit`
    Expected Result: 모든 함수 export + 타입 체크 통과
    Evidence: .sisyphus/evidence/task-6-crud-check.txt
  ```

  **Commit**: YES
  - Message: `feat(influencer): add CRUD server actions`
  - Files: `src/lib/actions/influencer.ts`
  - Pre-commit: `bunx tsc --noEmit`

- [ ] 7. 카테고리/태그 시스템 + 필터 쿼리 빌더

  **What to do**:
  - `src/lib/filters/influencer-filters.ts`:
    - `buildInfluencerQuery(filters: InfluencerFilters)` — Supabase 쿼리 빌더 (tab_category, classification, collaboration_type, category, gender, must_do, search 텍스트 필터 조합)
    - 탭 프리셋 매핑: `TAB_PRESETS` 상수 — 각 탭에 해당하는 필터 조합 정의
      - '참고' → tab_category='reference'
      - '리스트업' → tab_category='listup'
      - 'mcn회사' → tab_category='mcn'
      - '무조건' → tab_category='must' 또는 must_do=true
      - '과거' → tab_category='past'
      - '공구 하는 브랜드' → tab_category='group_buy_brand'
      - '광고' → tab_category='ad'
  - `src/lib/filters/url-state.ts` — URL 검색 파라미터 ↔ 필터 상태 변환 유틸리티 (nuqs 또는 수동 구현)

  **Must NOT do**:
  - 서버 사이드 필터링 외 클라이언트 사이드 필터링 구현 금지

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: T17
  - **Blocked By**: T3

  **References**:
  - **Pattern References**: 기존 구글시트 탭 구조 (참고/리스트업/mcn회사/무조건/과거/공구브랜드/광고)
  - **API/Type References**: `src/lib/types/database.ts`, `src/lib/design/constants.ts`

  **Acceptance Criteria**:
  **QA Scenarios (MANDATORY):**
  ```
  Scenario: 필터 빌더 + 탭 프리셋 확인
    Tool: Bash
    Steps:
      1. Check `src/lib/filters/influencer-filters.ts` exports buildInfluencerQuery, TAB_PRESETS
      2. Verify TAB_PRESETS has exactly 7 entries
      3. Run `bunx tsc --noEmit`
    Expected Result: 7개 프리셋 + 타입 체크 통과
    Evidence: .sisyphus/evidence/task-7-filters-check.txt
  ```

  **Commit**: YES
  - Message: `feat(filter): add category/tag system + filter query builder`
  - Files: `src/lib/filters/`
  - Pre-commit: `bunx tsc --noEmit`

- [ ] 8. CSV 파서 + 필드 검증 + 정규화

  **What to do**:
  - `src/lib/csv/parser.ts`:
    - `parseInfluencerCSV(file: File)` — PapaParse로 CSV 파싱 + 한국어 헤더 → 영어 필드명 매핑
    - 헤더 매핑: NO→no, 닉네임→nickname, 프로필→profile_image_url, URL→url, 분류→classification, 협업 형태→collaboration_type, 카테고리→category, 팔로워/구독자수→follower_count, 성함→real_name, 성별→gender, 연락처→contact, 무조건→must_do, 선정 이유→selection_reason, 비고→notes, 메일→email, 단가→rate
    - 팔로워 수 정규화: "10만"→100000, "100K"→100000, "100,000"→100000
    - must_do 정규화: "O"/"ㅇ"/"예"/"yes"→true, 나머지→false
    - 행별 검증 결과 반환: `{ valid: Row[], errors: {row: number, field: string, message: string}[] }`

  **Must NOT do**:
  - 이미지 필드(프로필, 영상 썸네일)의 CSV 값은 URL로만 처리, 이미지 파일 임포트 금지
  - CSV 컬럼 매핑 UI 구현 금지 (이 태스크에서는 파서만, UI는 T24)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: T24
  - **Blocked By**: T3

  **References**:
  - **External**: PapaParse 문서 (bun add papaparse)
  - **API/Type References**: `src/lib/types/database.ts` — Influencer 타입

  **Acceptance Criteria**:
  **QA Scenarios (MANDATORY):**
  ```
  Scenario: CSV 파서 함수 존재 + 타입 체크
    Tool: Bash
    Steps:
      1. Check `src/lib/csv/parser.ts` exports parseInfluencerCSV
      2. Run `bunx tsc --noEmit`
    Expected Result: 함수 export + 타입 체크 통과
    Evidence: .sisyphus/evidence/task-8-csv-check.txt
  ```

  **Commit**: YES
  - Message: `feat(csv): add parser with field validation + normalization`
  - Files: `src/lib/csv/`
  - Pre-commit: `bunx tsc --noEmit`

- [ ] 9. 이미지 업로드 서비스 (Supabase Storage)

  **What to do**:
  - `src/lib/storage/image-service.ts`:
    - `uploadImage(buffer: Buffer, path: string, contentType: string)` — Supabase Storage에 이미지 업로드 후 공개 URL 반환
    - `uploadImageFromUrl(sourceUrl: string, storagePath: string)` — 외부 URL에서 이미지 다운로드 → 5MB 이하로 리사이즈/압축 → Supabase Storage에 업로드 → 공개 URL 반환
    - `deleteImage(path: string)` — Storage에서 이미지 삭제
    - `getPublicUrl(path: string)` — Storage 공개 URL 생성
  - 이미지 경로 규칙: `influencers/{influencer_id}/{type}.{ext}` (type: profile, high_video, low_video)
  - 광고 카드 이미지: `ads/{card_id}/thumbnail.{ext}`
  - Supabase Storage 버킷 'images' 생성 스크립트 (또는 마이그레이션에 포함)
  - 이미지 다운로드 시 8초 타임아웃 (Vercel 10초 제한 고려)
  - sharp 또는 기본 Buffer 처리로 이미지 압축 (5MB 이하)

  **Must NOT do**:
  - 클라이언트 사이드 직접 업로드 금지 (Server Action 경유만)
  - 외부 CDN URL 그대로 저장 금지 (반드시 Supabase Storage로 프록시)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: T10, T11, T12, T13
  - **Blocked By**: T2

  **References**:
  - **External**: Supabase Storage JS 문서 (upload, getPublicUrl)
  - **Pattern References**: `src/lib/supabase/admin.ts` — Service Role 클라이언트 사용

  **Acceptance Criteria**:
  **QA Scenarios (MANDATORY):**
  ```
  Scenario: 이미지 서비스 함수 존재 + 타입 체크
    Tool: Bash
    Steps:
      1. Check `src/lib/storage/image-service.ts` exports uploadImage, uploadImageFromUrl, deleteImage, getPublicUrl
      2. Run `bunx tsc --noEmit`
    Expected Result: 4개 함수 export + 타입 체크 통과
    Evidence: .sisyphus/evidence/task-9-storage-check.txt

  Scenario: 수동 이미지 업로드 Server Action 동작 (에러 없음)
    Tool: Bash
    Steps:
      1. Run `bun run build`
    Expected Result: 빌드 성공
    Evidence: .sisyphus/evidence/task-9-build.txt
  ```

  **Commit**: YES
  - Message: `feat(storage): add image upload service via supabase`
  - Files: `src/lib/storage/`
  - Pre-commit: `bun run build`

- [ ] 10. 크롤링 엔진 — YouTube Data API v3

  **What to do**:
  - `src/lib/crawlers/youtube.ts`:
    - `crawlYouTubeChannel(channelUrl: string)` — YouTube 채널 URL에서:
      1. 채널 ID 추출 (URL 패턴 파싱: /@handle, /channel/UCXXX, /c/customname)
      2. YouTube Data API `channels.list` → 채널 프로필 이미지 (snippet.thumbnails.high.url)
      3. YouTube Data API `search.list` (order=viewCount, type=video, maxResults=5) → 조회수 높은 영상 5개 썸네일
      4. YouTube Data API `search.list` (order=date, type=video, maxResults=50) → 최근 영상 중 조회수 낮은 5개 필터링 → 썸네일
      5. `videos.list` (statistics) → 정확한 조회수 가져오기
    - 반환 타입: `{ profileImage: string, highViewVideos: {title, thumbnail, viewCount, url}[], lowViewVideos: {title, thumbnail, viewCount, url}[] }`
    - `isYouTubeUrl(url: string)` — YouTube URL 판별 유틸리티
    - YouTube API 키: 환경변수 `YOUTUBE_API_KEY`
    - API 쿼터 효율화: 채널당 최대 ~21 유닛 소비 (channels.list 3 + search.list 200 + videos.list 3)
    - 에러 핸들링: API 키 없음, 쿼터 초과, 채널 없음 등

  **Must NOT do**:
  - YouTube HTML 스크래핑 금지 (공식 API만 사용)
  - 50개 이상 영상 조회 금지 (쿼터 절약)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: T14
  - **Blocked By**: T9

  **References**:
  - **External**: YouTube Data API v3 공식 문서 (channels.list, search.list, videos.list)
  - **Pattern References**: `src/lib/storage/image-service.ts` — uploadImageFromUrl 사용

  **Acceptance Criteria**:
  **QA Scenarios (MANDATORY):**
  ```
  Scenario: YouTube 크롤러 함수 존재 + URL 판별
    Tool: Bash
    Steps:
      1. Check `src/lib/crawlers/youtube.ts` exports crawlYouTubeChannel, isYouTubeUrl
      2. Run `bunx tsc --noEmit`
    Expected Result: 함수 export + 타입 체크 통과
    Evidence: .sisyphus/evidence/task-10-youtube-check.txt

  Scenario: URL 패턴 인식 검증
    Tool: Bash
    Steps:
      1. Create a small test script that calls isYouTubeUrl with various patterns:
         - "https://www.youtube.com/@channelname" → true
         - "https://youtube.com/channel/UCxxxxxx" → true
         - "https://youtu.be/dQw4w9WgXcQ" → true
         - "https://www.instagram.com/user" → false
      2. Run the script
    Expected Result: 모든 판별 결과 정확
    Evidence: .sisyphus/evidence/task-10-url-patterns.txt
  ```

  **Commit**: YES
  - Message: `feat(crawl): add youtube data api v3 crawler`
  - Files: `src/lib/crawlers/youtube.ts`
  - Pre-commit: `bunx tsc --noEmit`

- [ ] 11. 크롤링 엔진 — Instagram HTML/OG 파싱

  **What to do**:
  - `src/lib/crawlers/instagram.ts`:
    - `crawlInstagramProfile(profileUrl: string)` — Instagram 프로필 URL에서:
      1. HTTP GET으로 HTML 페치 (User-Agent 설정)
      2. OG 태그에서 프로필 이미지 추출 (og:image)
      3. HTML 내 JSON-LD 또는 meta 태그에서 추가 정보 추출 시도
      4. 릴스/포스트 URL이면 해당 콘텐츠의 og:image 추출
    - `crawlInstagramPost(postUrl: string)` — 개별 포스트/릴스 URL에서 og:image 추출
    - `isInstagramUrl(url: string)` — Instagram URL 판별
    - 반환 타입: `{ profileImage?: string, postThumbnail?: string, error?: string }`
    - **중요**: Instagram은 비공식 방법이므로 실패 가능성 높음. 에러 시 `{ error: "크롤링 실패. 수동으로 이미지를 업로드해주세요." }` 반환
    - 타임아웃: 8초

  **Must NOT do**:
  - Instagram 로그인 필요 기능 접근 금지
  - 비공개 계정 크롤링 시도 금지
  - Puppeteer/Playwright 사용 금지

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with T12, T13, T14, T15, T16)
  - **Blocks**: T14
  - **Blocked By**: T9

  **References**:
  - **External**: metascraper 문서 (OG 태그 추출)

  **Acceptance Criteria**:
  **QA Scenarios (MANDATORY):**
  ```
  Scenario: Instagram 크롤러 함수 존재
    Tool: Bash
    Steps:
      1. Check `src/lib/crawlers/instagram.ts` exports crawlInstagramProfile, crawlInstagramPost, isInstagramUrl
      2. Run `bunx tsc --noEmit`
    Expected Result: 함수 export + 타입 체크 통과
    Evidence: .sisyphus/evidence/task-11-instagram-check.txt
  ```

  **Commit**: YES
  - Message: `feat(crawl): add instagram og/html parser`
  - Files: `src/lib/crawlers/instagram.ts`
  - Pre-commit: `bunx tsc --noEmit`

- [ ] 12. 크롤링 엔진 — TikTok HTML hydration 파싱

  **What to do**:
  - `src/lib/crawlers/tiktok.ts`:
    - `crawlTikTokProfile(profileUrl: string)` — TikTok 프로필 URL에서:
      1. HTTP GET으로 HTML 페치
      2. `__UNIVERSAL_DATA_FOR_REHYDRATION__` JSON 데이터에서 프로필 이미지 + 인기 영상 썸네일 추출
      3. OG 태그 fallback
    - `crawlTikTokVideo(videoUrl: string)` — 개별 영상 URL에서 og:image 추출
    - `isTikTokUrl(url: string)` — TikTok URL 판별
    - 반환 타입: `{ profileImage?: string, videos?: {thumbnail, url}[], error?: string }`
    - **중요**: TikTok hydration 데이터는 변경될 수 있어 불안정. 에러 시 fallback 메시지 반환
    - 타임아웃: 8초

  **Must NOT do**:
  - TikTok API 사용 금지 (공식 API는 비즈니스 계정만)
  - Puppeteer 사용 금지

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: T14
  - **Blocked By**: T9

  **References**:
  - **External**: TikTok HTML 구조 분석 (hydration data pattern)

  **Acceptance Criteria**:
  **QA Scenarios (MANDATORY):**
  ```
  Scenario: TikTok 크롤러 함수 존재
    Tool: Bash
    Steps:
      1. Check `src/lib/crawlers/tiktok.ts` exports crawlTikTokProfile, crawlTikTokVideo, isTikTokUrl
      2. Run `bunx tsc --noEmit`
    Expected Result: 함수 export + 타입 체크 통과
    Evidence: .sisyphus/evidence/task-12-tiktok-check.txt
  ```

  **Commit**: YES
  - Message: `feat(crawl): add tiktok html hydration parser`
  - Files: `src/lib/crawlers/tiktok.ts`
  - Pre-commit: `bunx tsc --noEmit`

- [ ] 13. 크롤링 엔진 — 일반 URL OG태그 추출

  **What to do**:
  - `src/lib/crawlers/og.ts`:
    - `crawlOGTags(url: string)` — 일반 URL에서 metascraper로:
      1. og:image → 썸네일 이미지
      2. og:title → 제목
      3. og:description → 설명
      4. og:site_name → 사이트명
    - 반환 타입: `{ image?: string, title?: string, description?: string, siteName?: string }`
    - metascraper 플러그인: image, title, description, url
    - 타임아웃: 8초

  **Must NOT do**:
  - 복잡한 HTML 파싱 금지 (metascraper에 위임)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: T14
  - **Blocked By**: T9

  **References**:
  - **External**: metascraper npm 문서

  **Acceptance Criteria**:
  **QA Scenarios (MANDATORY):**
  ```
  Scenario: OG 크롤러 함수 존재
    Tool: Bash
    Steps:
      1. Check `src/lib/crawlers/og.ts` exports crawlOGTags
      2. Run `bunx tsc --noEmit`
    Expected Result: 함수 export + 타입 체크 통과
    Evidence: .sisyphus/evidence/task-13-og-check.txt
  ```

  **Commit**: YES
  - Message: `feat(crawl): add generic url og tag extractor`
  - Files: `src/lib/crawlers/og.ts`
  - Pre-commit: `bunx tsc --noEmit`

- [ ] 14. 크롤링 오케스트레이터

  **What to do**:
  - `src/lib/crawlers/orchestrator.ts`:
    - `detectPlatform(url: string)` — URL에서 플랫폼 자동 감지 (youtube/instagram/tiktok/other)
    - `crawlUrl(url: string)` — 플랫폼 감지 → 해당 크롤러 호출 → 이미지 다운로드 → Supabase Storage 프록시 저장 → 공개 URL 반환
    - 통합 반환 타입: `CrawlResult { platform, profileImage?, videos?: {thumbnail, title, viewCount, url}[], ogData?: {image, title, description}, error? }`
  - `src/lib/actions/crawl.ts` — Server Action:
    - `crawlInfluencerUrl(influencerId: string, url: string)` — URL 크롤링 → 결과를 influencers 테이블에 업데이트 (profile_image_url, high_view_video_thumbnail, low_view_video_thumbnail)
    - `crawlAdCardUrl(url: string)` — URL 크롤링 → 광고 카드용 결과 반환 (썸네일 + 제목 + 설명)
    - `uploadManualImage(entityType: 'influencer'|'ad_card', entityId: string, field: string, formData: FormData)` — 수동 이미지 업로드 Server Action
  - 크롤링 실패 시 자동으로 "수동 업로드" 모드 전환 안내 메시지 반환
  - 전체 타임아웃: 8초 (개별 크롤러 타임아웃 + 이미지 업로드)

  **Must NOT do**:
  - 배치 크롤링 기능 금지 (1건씩만)
  - 크롤링 결과 캐싱 금지 (항상 실시간)
  - 재크롤링 예약 금지

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (T10-T13 완료 후)
  - **Parallel Group**: Wave 3 (T10-T13과 같은 Wave지만 의존성으로 순차)
  - **Blocks**: T18, T22
  - **Blocked By**: T10, T11, T12, T13

  **References**:
  - **Pattern References**: `src/lib/crawlers/youtube.ts`, `instagram.ts`, `tiktok.ts`, `og.ts` — 각 크롤러
  - **Pattern References**: `src/lib/storage/image-service.ts` — uploadImageFromUrl
  - **Pattern References**: `src/lib/actions/influencer.ts` — updateInfluencer

  **Acceptance Criteria**:
  **QA Scenarios (MANDATORY):**
  ```
  Scenario: 오케스트레이터 + Server Action 존재
    Tool: Bash
    Steps:
      1. Check `src/lib/crawlers/orchestrator.ts` exports detectPlatform, crawlUrl
      2. Check `src/lib/actions/crawl.ts` exports crawlInfluencerUrl, crawlAdCardUrl, uploadManualImage
      3. Run `bunx tsc --noEmit`
    Expected Result: 모든 함수 export + 타입 체크 통과
    Evidence: .sisyphus/evidence/task-14-orchestrator-check.txt

  Scenario: 플랫폼 감지 정확도
    Tool: Bash
    Steps:
      1. Create test script calling detectPlatform with:
         - "https://www.youtube.com/@channel" → "youtube"
         - "https://www.instagram.com/user" → "instagram"
         - "https://www.tiktok.com/@user" → "tiktok"
         - "https://naver.com" → "other"
      2. Run test script
    Expected Result: 모든 판별 정확
    Evidence: .sisyphus/evidence/task-14-platform-detect.txt
  ```

  **Commit**: YES
  - Message: `feat(crawl): add orchestrator with url detection + storage proxy + fallback`
  - Files: `src/lib/crawlers/orchestrator.ts, src/lib/actions/crawl.ts`
  - Pre-commit: `bunx tsc --noEmit`

- [ ] 15. 인플루언서 테이블 UI — TanStack Table + 컬럼 정의 + 이미지 셀

  **What to do**:
  - `src/app/influencers/page.tsx` — 인플루언서 페이지 (서버 컴포넌트, 초기 데이터 fetch)
  - `src/app/influencers/influencer-table.tsx` — 클라이언트 컴포넌트, TanStack Table v8:
    - 18개 컬럼 정의 (columnDefs)
    - NO: 번호 (좁은 컬럼)
    - 닉네임: 텍스트 (고정 컬럼)
    - 프로필: image-cell 컴포넌트 (썸네일 60x60, 클릭 시 확대)
    - 조회수 높은 영상: image-cell 컴포넌트 (썸네일 80x60)
    - 조회수 낮은 영상: image-cell 컴포넌트 (썸네일 80x60)
    - URL: 링크 (아이콘 + 클릭 시 새탭)
    - 분류/협업형태/카테고리: color-badge 컴포넌트
    - 팔로워/구독자수: 숫자 포맷 (K/M 축약)
    - 나머지: 텍스트
  - 수평 스크롤 지원 (18컬럼 테이블)
  - 로딩 스켈레톤 상태
  - 빈 상태 메시지 ("등록된 인플루언서가 없습니다")
  - 행 삭제 버튼 (확인 다이얼로그)

  **Must NOT do**:
  - 인라인 편집 기능 구현 금지 (T16에서 별도 구현)
  - 가상화(virtualization) 구현 금지 (v1)
  - 컬럼 드래그 재배치 금지

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`vercel-react-best-practices`]
    - `vercel-react-best-practices`: Server/Client 컴포넌트 분리 패턴

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with T11-T14)
  - **Blocks**: T16, T17, T24, T25
  - **Blocked By**: T5, T6

  **References**:
  - **Pattern References**: `src/components/ui/image-cell.tsx` — 이미지 셀 컴포넌트 (T5)
  - **Pattern References**: `src/components/ui/color-badge.tsx` — 컬러 배지 컴포넌트 (T5)
  - **API/Type References**: `src/lib/actions/influencer.ts` — getInfluencers (T6)
  - **API/Type References**: `src/lib/types/database.ts` — Influencer 타입 (T3)
  - **External**: TanStack Table v8 문서 (column definitions, sorting, filtering)

  **Acceptance Criteria**:
  **QA Scenarios (MANDATORY):**
  ```
  Scenario: 테이블 렌더링 확인
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to http://localhost:3000/influencers
      2. Assert table element exists (selector: `table` or `[role="table"]`)
      3. Assert at least 18 column headers visible (or horizontal scroll reveals them)
      4. Screenshot the table
    Expected Result: 18컬럼 테이블 렌더링
    Evidence: .sisyphus/evidence/task-15-table-render.png

  Scenario: 빈 상태 표시
    Tool: Playwright
    Steps:
      1. Navigate to /influencers (데이터 없을 때)
      2. Assert empty state message visible (text contains "인플루언서")
    Expected Result: 빈 상태 메시지 표시
    Evidence: .sisyphus/evidence/task-15-empty-state.png
  ```

  **Commit**: YES
  - Message: `feat(influencer-ui): add tanstack table with columns + image cells`
  - Files: `src/app/influencers/`
  - Pre-commit: `bun run build`

- [ ] 16. 인플루언서 인라인 편집 — TanStack Table 편집 모드

  **What to do**:
  - `src/app/influencers/editable-cell.tsx` — 편집 가능한 셀 컴포넌트:
    - 텍스트 셀: 클릭 → input으로 전환 → Enter/blur로 저장 → 즉시 Server Action 호출(updateInfluencerField)
    - 숫자 셀: 클릭 → number input → Enter/blur 저장
    - 선택 셀 (분류/협업형태/카테고리/성별): 클릭 → Select 드롭다운 → 선택 시 즉시 저장
    - 불리언 셀 (무조건): 체크박스 토글 → 즉시 저장
    - 이미지 셀: 클릭 → 이미지 확대 팝오버 (편집은 별도 업로드 버튼)
    - URL 셀: 클릭 → input + "크롤링" 버튼
  - `src/app/influencers/influencer-table.tsx` 수정 — TanStack Table의 `meta.updateData` 활용
  - 편집 중 시각적 피드백: 셀 border 하이라이트, 저장 중 로딩 표시
  - 저장 실패 시 토스트 에러 메시지 + 값 롤백
  - Escape 키로 편집 취소
  - Tab 키로 다음 셀 이동

  **Must NOT do**:
  - 복사/붙여넣기 기능 금지 (v1)
  - 셀 병합 금지
  - 조건부 서식 금지
  - 수식 기능 금지

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`vercel-react-best-practices`]
    - `vercel-react-best-practices`: React 상태 관리 최적화 (빈번한 리렌더 방지)

  **Parallelization**:
  - **Can Run In Parallel**: NO (T15 완료 후)
  - **Parallel Group**: Wave 3 (T15 의존)
  - **Blocks**: T18, T26
  - **Blocked By**: T15

  **References**:
  - **Pattern References**: `src/app/influencers/influencer-table.tsx` — 기존 테이블 (T15)
  - **API/Type References**: `src/lib/actions/influencer.ts` — updateInfluencerField (T6)
  - **External**: TanStack Table v8 Editable Data 가이드

  **Acceptance Criteria**:
  **QA Scenarios (MANDATORY):**
  ```
  Scenario: 인라인 텍스트 편집
    Tool: Playwright (playwright skill)
    Preconditions: 1건 이상의 인플루언서 데이터 존재
    Steps:
      1. Navigate to /influencers
      2. Click on a 닉네임 cell
      3. Type "테스트닉네임변경"
      4. Press Enter
      5. Wait 1 second
      6. Reload page
      7. Assert the cell still shows "테스트닉네임변경"
    Expected Result: 인라인 편집 후 값이 DB에 저장됨
    Evidence: .sisyphus/evidence/task-16-inline-edit.png

  Scenario: 드롭다운 선택 편집
    Tool: Playwright
    Steps:
      1. Click on a 분류 cell
      2. Assert dropdown/select appears
      3. Select a different option
      4. Assert cell updates immediately
    Expected Result: 선택 즉시 저장
    Evidence: .sisyphus/evidence/task-16-dropdown-edit.png

  Scenario: Escape로 편집 취소
    Tool: Playwright
    Steps:
      1. Click on a 닉네임 cell
      2. Type "변경할내용"
      3. Press Escape
      4. Assert original value remains
    Expected Result: 편집 취소, 원래 값 유지
    Evidence: .sisyphus/evidence/task-16-escape-cancel.png
  ```

  **Commit**: YES
  - Message: `feat(influencer-ui): add inline cell editing mode`
  - Files: `src/app/influencers/editable-cell.tsx, src/app/influencers/influencer-table.tsx`
  - Pre-commit: `bun run build`

- [ ] 17. 인플루언서 필터바 + 탭 프리셋 + URL 상태

  **What to do**:
  - `src/app/influencers/filter-bar.tsx` — 필터바 컴포넌트:
    - 탭 프리셋 버튼 7개 (참고/리스트업/mcn회사/무조건/과거/공구브랜드/광고) — 유광기 참조: 상단 탭 형태
    - 추가 필터: 분류 드롭다운, 협업형태 드롭다운, 카테고리 드롭다운, 성별 드롭다운
    - 필터 적용 시 URL 검색 파라미터 업데이트 (?tab=listup&classification=xxx)
    - 필터 초기화 버튼
    - 활성 필터 배지 표시
  - URL 상태 연동: 페이지 로드 시 URL 파라미터에서 필터 복원 (브라우저 뒤로가기 지원)
  - 필터 변경 시 Server Action 재호출 → 테이블 데이터 갱신

  **Must NOT do**:
  - 클라이언트 사이드 필터링 금지 (서버 사이드만)
  - 필터 저장/커스텀 프리셋 금지

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`vercel-react-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with T18-T22)
  - **Blocks**: —
  - **Blocked By**: T7, T15

  **References**:
  - **Pattern References**: `src/lib/filters/influencer-filters.ts` — TAB_PRESETS, buildInfluencerQuery (T7)
  - **Pattern References**: `src/lib/filters/url-state.ts` — URL 파라미터 변환 (T7)
  - **Pattern References**: 유광기 스크린샷 — 상단 탭 형태 필터

  **Acceptance Criteria**:
  **QA Scenarios (MANDATORY):**
  ```
  Scenario: 탭 프리셋 필터링
    Tool: Playwright
    Steps:
      1. Navigate to /influencers
      2. Click "mcn회사" 탭 버튼
      3. Assert URL contains "tab=mcn"
      4. Assert table shows only mcn 카테고리 데이터
    Expected Result: 탭 클릭 시 필터 적용 + URL 업데이트
    Evidence: .sisyphus/evidence/task-17-tab-filter.png

  Scenario: URL 상태 복원
    Tool: Playwright
    Steps:
      1. Navigate directly to /influencers?tab=must
      2. Assert "무조건" 탭이 활성 상태
      3. Assert table shows filtered data
    Expected Result: URL에서 필터 상태 복원
    Evidence: .sisyphus/evidence/task-17-url-state.png
  ```

  **Commit**: YES
  - Message: `feat(influencer-ui): add filter bar + tab presets + url state`
  - Files: `src/app/influencers/filter-bar.tsx`
  - Pre-commit: `bun run build`

- [ ] 18. 인플루언서 행 추가 + 크롤링 연동 + 수동 업로드

  **What to do**:
  - `src/app/influencers/add-influencer-dialog.tsx` — 새 인플루언서 추가 다이얼로그:
    - URL 입력 필드 + "크롤링" 버튼
    - 크롤링 버튼 클릭 → crawlInfluencerUrl Server Action 호출
    - 크롤링 진행 중 로딩 스피너 표시
    - 크롤링 성공 시: 프로필 이미지 + 인기/비인기 영상 썸네일 미리보기 표시
    - 크롤링 실패 시: "크롤링 실패" 토스트 + 수동 업로드 버튼 활성화
    - 수동 이미지 업로드: 파일 선택 → uploadManualImage Server Action → 미리보기
    - 닉네임 + URL 입력 → "저장" 클릭 → createInfluencer → 테이블에 새 행 추가
    - 영상 썸네일 선택 UI: 크롤링 결과 중 조회수 높은/낮은 영상 목록에서 선택
  - 기존 인플루언서 행의 이미지 셀에도 "크롤링" / "업로드" 버튼 추가 (T16의 이미지 셀 확장)
  - `revalidatePath('/influencers')` 호출로 테이블 자동 갱신

  **Must NOT do**:
  - 배치 크롤링 (여러 URL 동시) 금지
  - 자동 재크롤링 금지

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`vercel-react-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: —
  - **Blocked By**: T14, T16

  **References**:
  - **Pattern References**: `src/lib/actions/crawl.ts` — crawlInfluencerUrl, uploadManualImage (T14)
  - **Pattern References**: `src/lib/actions/influencer.ts` — createInfluencer (T6)
  - **Pattern References**: `src/app/influencers/editable-cell.tsx` — 이미지 셀 (T16)

  **Acceptance Criteria**:
  **QA Scenarios (MANDATORY):**
  ```
  Scenario: 새 인플루언서 추가 + URL 크롤링
    Tool: Playwright
    Steps:
      1. Navigate to /influencers
      2. Click "추가" button
      3. Enter nickname "테스트인플루언서"
      4. Enter URL "https://www.youtube.com/@MrBeast"
      5. Click "크롤링" button
      6. Wait for crawl result (max 10 seconds)
      7. Assert profile image preview appears
      8. Click "저장"
      9. Assert new row appears in table
    Expected Result: 인플루언서 추가 + 크롤링 이미지 표시
    Evidence: .sisyphus/evidence/task-18-add-crawl.png

  Scenario: 크롤링 실패 시 수동 업로드
    Tool: Playwright
    Steps:
      1. Open add dialog
      2. Enter invalid URL "https://invalid-url-xyz.com"
      3. Click "크롤링"
      4. Wait for failure message
      5. Assert "수동 업로드" button appears
      6. Assert error toast shown
    Expected Result: 실패 처리 + 수동 업로드 대안 제공
    Evidence: .sisyphus/evidence/task-18-crawl-fail.png
  ```

  **Commit**: YES
  - Message: `feat(influencer-ui): add row creation + crawl integration + manual upload`
  - Files: `src/app/influencers/add-influencer-dialog.tsx`
  - Pre-commit: `bun run build`

- [ ] 19. 광고 카드+폴더 CRUD Server Actions

  **What to do**:
  - `src/lib/actions/ads.ts` — Server Actions:
    - `getFolders()` — 폴더 목록 조회 (트리 구조)
    - `createFolder(name, parentId?)` — 폴더 생성
    - `updateFolder(id, name)` — 폴더 이름 변경
    - `deleteFolder(id)` — 폴더 삭제 (내부 카드는 미분류로 이동)
    - `getAdCards(folderId?)` — 광고 카드 목록 조회 (폴더별 또는 전체)
    - `createAdCard(data)` — 광고 카드 생성 (url, thumbnail_url, title, one_line_review, reference_brand, folder_id, tags)
    - `updateAdCard(id, data)` — 광고 카드 수정
    - `deleteAdCard(id)` — 광고 카드 삭제 (이미지도 Storage에서 삭제)
    - `moveAdCard(cardId, targetFolderId)` — 카드 폴더 이동

  **Must NOT do**:
  - 인플루언서 모듈과 교차 참조 금지
  - 카드 정렬/순서 기능 금지 (v1)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: T20, T21, T22
  - **Blocked By**: T2, T3

  **References**:
  - **API/Type References**: `src/lib/types/database.ts` — AdCard, Folder 타입 (T3)
  - **Pattern References**: `src/lib/actions/influencer.ts` — CRUD 패턴 참조 (T6)

  **Acceptance Criteria**:
  **QA Scenarios (MANDATORY):**
  ```
  Scenario: CRUD 함수 존재 + 타입 체크
    Tool: Bash
    Steps:
      1. Check exports: getFolders, createFolder, updateFolder, deleteFolder, getAdCards, createAdCard, updateAdCard, deleteAdCard, moveAdCard
      2. Run `bunx tsc --noEmit`
    Expected Result: 9개 함수 export + 타입 체크 통과
    Evidence: .sisyphus/evidence/task-19-ads-crud.txt
  ```

  **Commit**: YES
  - Message: `feat(ads): add cards + folders CRUD server actions`
  - Files: `src/lib/actions/ads.ts`
  - Pre-commit: `bunx tsc --noEmit`

- [ ] 20. 광고 보드 — 사이드바 폴더 네비게이션

  **What to do**:
  - `src/app/ads/page.tsx` — 광고 보드 페이지 (서버 컴포넌트)
  - `src/app/ads/folder-sidebar.tsx` — 폴더 사이드바:
    - 폴더 트리 목록 표시 (2단계 중첩까지)
    - "전체 보드" 항목 (모든 카드 표시)
    - 폴더 선택 시 해당 폴더의 카드만 표시
    - 폴더 추가 버튼 (+ 아이콘)
    - 폴더 이름 변경 (더블클릭)
    - 폴더 삭제 (우클릭 메뉴 또는 삭제 아이콘)
    - 활성 폴더 하이라이트
  - Snipit 참조: 좌측 사이드바에 폴더 트리 + 폴더명 + 카드 수 표시

  **Must NOT do**:
  - 드래그앤드롭 폴더 재배치 금지
  - 3단계 이상 중첩 금지
  - 폴더 아이콘/색상 커스텀 금지

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`vercel-react-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: —
  - **Blocked By**: T4, T19

  **References**:
  - **Pattern References**: Snipit 스크린샷 — 좌측 사이드바 폴더 트리 (Notion 페이지 이미지)
  - **API/Type References**: `src/lib/actions/ads.ts` — getFolders, createFolder, deleteFolder (T19)

  **Acceptance Criteria**:
  **QA Scenarios (MANDATORY):**
  ```
  Scenario: 폴더 사이드바 표시 + 폴더 추가
    Tool: Playwright
    Steps:
      1. Navigate to /ads
      2. Assert folder sidebar exists
      3. Assert "전체 보드" item visible
      4. Click folder add button
      5. Enter folder name "테스트폴더"
      6. Submit
      7. Assert new folder appears in sidebar
    Expected Result: 폴더 생성 + 사이드바 표시
    Evidence: .sisyphus/evidence/task-20-folder-sidebar.png
  ```

  **Commit**: YES
  - Message: `feat(ads-ui): add sidebar folder navigation`
  - Files: `src/app/ads/page.tsx, src/app/ads/folder-sidebar.tsx`
  - Pre-commit: `bun run build`

- [ ] 21. 광고 보드 — Masonry 카드 그리드

  **What to do**:
  - `src/app/ads/card-grid.tsx` — 카드 그리드 컴포넌트:
    - CSS Grid 또는 masonic 라이브러리로 masonry 레이아웃
    - 반응형: 데스크탑 4열, 태블릿 3열, 모바일 2열
    - 각 카드: 썸네일 이미지 (aspect-ratio 유지) + 제목 (2줄 truncate) + 참고 브랜드 배지 + 한줄평 (1줄 truncate)
    - 카드 hover 시 약간의 그림자/스케일 효과
    - 이미지 로딩 실패 시 placeholder 표시
    - 빈 폴더 상태: "이 폴더에 카드가 없습니다. URL을 입력하여 카드를 추가해보세요"
  - Snipit 참조: 카드 그리드 + 이미지 중심 레이아웃

  **Must NOT do**:
  - 무한 스크롤 금지 (v1, 페이지네이션 또는 전체 로드)
  - 카드 드래그 재배치 금지

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`vercel-react-best-practices`, `web-design-guidelines`]
    - `web-design-guidelines`: 카드 UI 접근성 + 반응형 설계

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: T23, T25
  - **Blocked By**: T5, T19

  **References**:
  - **Pattern References**: Snipit 스크린샷 — 카드 그리드 레이아웃 (Notion 페이지 이미지)
  - **Pattern References**: `src/components/ui/image-cell.tsx` — 이미지 로딩/fallback 패턴 (T5)
  - **API/Type References**: `src/lib/actions/ads.ts` — getAdCards (T19)

  **Acceptance Criteria**:
  **QA Scenarios (MANDATORY):**
  ```
  Scenario: 카드 그리드 렌더링
    Tool: Playwright
    Steps:
      1. Navigate to /ads
      2. Assert card grid container exists
      3. If cards exist, assert at least one card has thumbnail image
      4. Screenshot
    Expected Result: 카드 그리드 레이아웃 표시
    Evidence: .sisyphus/evidence/task-21-card-grid.png

  Scenario: 빈 상태 표시
    Tool: Playwright
    Steps:
      1. Navigate to /ads, select empty folder
      2. Assert empty state message visible
    Expected Result: 빈 폴더 안내 메시지
    Evidence: .sisyphus/evidence/task-21-empty.png
  ```

  **Commit**: YES
  - Message: `feat(ads-ui): add masonry card grid`
  - Files: `src/app/ads/card-grid.tsx`
  - Pre-commit: `bun run build`

- [ ] 22. 광고 카드 생성 (URL 크롤링 프리뷰 + 수동입력)

  **What to do**:
  - `src/app/ads/add-card-dialog.tsx` — 카드 추가 다이얼로그:
    - URL 입력 필드 + "크롤링" 버튼
    - 크롤링 결과 미리보기: 썸네일 이미지 + 제목 + 설명 (자동 채움)
    - 수동 입력 필드: 한줄평, 참고 브랜드, 태그 (쉼표 구분), 폴더 선택
    - 크롤링 실패 시: 수동 이미지 업로드 + 수동 제목 입력
    - 폴더 선택 드롭다운 (기존 폴더 목록 + "새 폴더" 옵션)
    - "저장" 클릭 → createAdCard Server Action → 카드 그리드에 새 카드 추가

  **Must NOT do**:
  - 여러 URL 동시 크롤링 금지
  - 카드 중복 URL 검사 금지 (v1)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`vercel-react-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: T23
  - **Blocked By**: T14, T19

  **References**:
  - **Pattern References**: `src/lib/actions/crawl.ts` — crawlAdCardUrl (T14)
  - **Pattern References**: `src/lib/actions/ads.ts` — createAdCard (T19)
  - **Pattern References**: `src/app/influencers/add-influencer-dialog.tsx` — 크롤링 UI 패턴 (T18)

  **Acceptance Criteria**:
  **QA Scenarios (MANDATORY):**
  ```
  Scenario: URL 크롤링으로 카드 생성
    Tool: Playwright
    Steps:
      1. Navigate to /ads
      2. Click "카드 추가" button
      3. Enter URL (예: naver blog URL)
      4. Click "크롤링"
      5. Wait for preview (max 10s)
      6. Enter 한줄평 "좋은 레퍼런스"
      7. Enter 참고 브랜드 "테스트브랜드"
      8. Select folder
      9. Click "저장"
      10. Assert new card appears in grid
    Expected Result: 카드 생성 + 그리드에 표시
    Evidence: .sisyphus/evidence/task-22-add-card.png
  ```

  **Commit**: YES
  - Message: `feat(ads-ui): add card creation with url crawl preview`
  - Files: `src/app/ads/add-card-dialog.tsx`
  - Pre-commit: `bun run build`

- [ ] 23. 광고 카드 상세 모달 + 편집 + 삭제

  **What to do**:
  - `src/app/ads/card-detail-modal.tsx` — 카드 상세 모달:
    - 풀사이즈 썸네일 이미지
    - 제목, URL (클릭 시 새탭)
    - 한줄평 (편집 가능 인라인)
    - 참고 브랜드 (편집 가능)
    - 태그 목록 (추가/삭제 가능)
    - 폴더 변경 드롭다운
    - 삭제 버튼 (확인 다이얼로그)
    - 닫기 버튼 (X 또는 오버레이 클릭)
  - 카드 수정 시 updateAdCard Server Action 호출
  - 삭제 시 deleteAdCard → 카드 + Storage 이미지 삭제

  **Must NOT do**:
  - 이미지 편집/크롭 금지
  - 카드 간 이동 (이전/다음) 금지

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`vercel-react-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with T24-T27)
  - **Blocks**: T26
  - **Blocked By**: T21, T22

  **References**:
  - **Pattern References**: Snipit 스크린샷 — 카드 상세 뷰 (참고 브랜드, 한줄평 표시)
  - **API/Type References**: `src/lib/actions/ads.ts` — updateAdCard, deleteAdCard (T19)

  **Acceptance Criteria**:
  **QA Scenarios (MANDATORY):**
  ```
  Scenario: 카드 상세 모달 열기 + 편집
    Tool: Playwright
    Steps:
      1. Navigate to /ads
      2. Click on a card
      3. Assert modal opens with full image
      4. Edit 한줄평 to "수정된 한줄평"
      5. Close modal
      6. Reopen same card
      7. Assert 한줄평 shows "수정된 한줄평"
    Expected Result: 모달 표시 + 편집 저장
    Evidence: .sisyphus/evidence/task-23-card-modal.png

  Scenario: 카드 삭제
    Tool: Playwright
    Steps:
      1. Open card detail modal
      2. Click 삭제 button
      3. Confirm deletion dialog
      4. Assert card removed from grid
    Expected Result: 카드 삭제 + 그리드에서 제거
    Evidence: .sisyphus/evidence/task-23-card-delete.png
  ```

  **Commit**: YES
  - Message: `feat(ads-ui): add card detail modal + edit + delete`
  - Files: `src/app/ads/card-detail-modal.tsx`
  - Pre-commit: `bun run build`

- [ ] 24. CSV 임포트 UI

  **What to do**:
  - `src/app/import/page.tsx` — CSV 임포트 페이지:
    - 파일 업로드 영역 (드래그앤드롭 + 파일 선택 버튼)
    - 업로드 후 미리보기 테이블 (처음 10행 표시)
    - 검증 결과 표시 (성공 N건, 에러 N건)
    - 에러 행 하이라이트 + 에러 메시지 표시
    - "임포트" 버튼 → createInfluencer를 반복 호출 → 진행률 바 표시
    - 완료 후 "/influencers"로 리다이렉트
    - 다운로드 가능한 샘플 CSV 템플릿 제공

  **Must NOT do**:
  - 컬럼 매핑 UI 금지 (헤더 자동 매핑만)
  - 이미지 컬럼의 URL 자동 크롤링 금지 (텍스트로만 저장)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`vercel-react-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5
  - **Blocks**: —
  - **Blocked By**: T8, T15

  **References**:
  - **Pattern References**: `src/lib/csv/parser.ts` — parseInfluencerCSV (T8)
  - **Pattern References**: `src/lib/actions/influencer.ts` — createInfluencer (T6)

  **Acceptance Criteria**:
  **QA Scenarios (MANDATORY):**
  ```
  Scenario: CSV 파일 업로드 + 미리보기
    Tool: Playwright
    Steps:
      1. Navigate to /import
      2. Upload a CSV file with header row + 3 data rows
      3. Assert preview table shows 3 rows
      4. Assert validation status shows
    Expected Result: CSV 파싱 + 미리보기 표시
    Evidence: .sisyphus/evidence/task-24-csv-preview.png

  Scenario: CSV 임포트 실행
    Tool: Playwright
    Steps:
      1. After preview, click "임포트" button
      2. Assert progress bar appears
      3. Wait for completion
      4. Assert redirect to /influencers
      5. Assert imported data visible in table
    Expected Result: 데이터 임포트 + 테이블에 반영
    Evidence: .sisyphus/evidence/task-24-csv-import.png
  ```

  **Commit**: YES
  - Message: `feat(import): add csv import ui with preview + progress`
  - Files: `src/app/import/`
  - Pre-commit: `bun run build`

- [ ] 25. 검색 기능

  **What to do**:
  - `src/components/search/search-bar.tsx` — 통합 검색 컴포넌트:
    - 인플루언서 검색: 닉네임, 성함, 비고, 선정이유 필드에서 텍스트 매칭 (ilike)
    - 광고 보드 검색: 제목, 한줄평, 참고 브랜드, 태그에서 텍스트 매칭
    - 검색어 입력 → 300ms debounce → Server Action 호출
    - 검색 결과 테이블/그리드 자동 갱신
    - 검색어 URL 파라미터에 반영 (?search=xxx)

  **Must NOT do**:
  - 전문 검색(full-text search) 금지 (단순 ilike만)
  - AI/시맨틱 검색 금지

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5
  - **Blocks**: —
  - **Blocked By**: T15, T21

  **References**:
  - **Pattern References**: `src/lib/filters/influencer-filters.ts` — search 필터 (T7)
  - **Pattern References**: `src/app/influencers/filter-bar.tsx` — URL 상태 연동 (T17)

  **Acceptance Criteria**:
  **QA Scenarios (MANDATORY):**
  ```
  Scenario: 인플루언서 검색
    Tool: Playwright
    Steps:
      1. Navigate to /influencers
      2. Type "테스트" in search bar
      3. Wait 500ms
      4. Assert table filters to matching results
      5. Assert URL contains "search=테스트"
    Expected Result: 검색 결과 필터링 + URL 반영
    Evidence: .sisyphus/evidence/task-25-search.png
  ```

  **Commit**: YES
  - Message: `feat(search): add text search for influencers + ad board`
  - Files: `src/components/search/`
  - Pre-commit: `bun run build`

- [ ] 26. 에러 바운더리 + 로딩 스켈레톤 + 빈 상태 + 반응형

  **What to do**:
  - `src/app/error.tsx` — 전역 에러 바운더리 (재시도 버튼)
  - `src/app/influencers/loading.tsx` — 인플루언서 페이지 로딩 스켈레톤 (테이블 형태)
  - `src/app/ads/loading.tsx` — 광고 보드 페이지 로딩 스켈레톤 (카드 그리드 형태)
  - 반응형 디자인 검증:
    - 데스크탑 (1200px+): 사이드바 펼침 + 전체 테이블/그리드
    - 태블릿 (768-1199px): 사이드바 접힘 가능 + 축소된 테이블/그리드
    - 모바일 (767px-): 사이드바 드로어 + 카드 2열
  - 이미지 로드 실패 시 깨진 이미지 대신 placeholder 아이콘 표시
  - 토스트 알림 위치/스타일 일관성 확인

  **Must NOT do**:
  - 모바일 네이티브 앱 대응 금지
  - 오프라인 모드 금지

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`web-design-guidelines`]
    - `web-design-guidelines`: 접근성 + 반응형 디자인 검증

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5
  - **Blocks**: —
  - **Blocked By**: T16, T23

  **References**:
  - **External**: Next.js Error/Loading 컨벤션 문서
  - **Pattern References**: 모든 페이지 컴포넌트

  **Acceptance Criteria**:
  **QA Scenarios (MANDATORY):**
  ```
  Scenario: 에러 바운더리 동작
    Tool: Playwright
    Steps:
      1. Navigate to an erroring page (or trigger error)
      2. Assert error boundary UI shows with retry button
    Expected Result: 에러 바운더리 표시 + 재시도 가능
    Evidence: .sisyphus/evidence/task-26-error-boundary.png

  Scenario: 반응형 — 모바일 뷰
    Tool: Playwright
    Steps:
      1. Set viewport to 375x812 (iPhone)
      2. Navigate to /influencers
      3. Assert layout adapts (사이드바 숨김 또는 드로어)
      4. Navigate to /ads
      5. Assert cards in 2-column grid
    Expected Result: 반응형 레이아웃 동작
    Evidence: .sisyphus/evidence/task-26-responsive-mobile.png
  ```

  **Commit**: YES
  - Message: `feat(polish): add error boundaries + skeletons + empty states + responsive`
  - Files: `src/app/error.tsx, src/app/*/loading.tsx, 반응형 관련`
  - Pre-commit: `bun run build`

- [ ] 27. Vercel 배포 설정

  **What to do**:
  - `.env.example` 최종 확인 (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, YOUTUBE_API_KEY)
  - `next.config.ts` — 이미지 도메인 설정 (Supabase Storage 도메인, YouTube 이미지 CDN)
  - `vercel.json` — 함수 타임아웃 설정 (maxDuration: 10)
  - `bun run build` 최종 성공 확인
  - `bunx tsc --noEmit` 최종 타입 체크
  - git init + .gitignore 설정
  - 배포 가이드 문서 (환경변수 설정 방법)

  **Must NOT do**:
  - 실제 Vercel 배포 실행 금지 (설정만, 배포는 사용자가)
  - .env 파일 커밋 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (모든 태스크 완료 후)
  - **Parallel Group**: Wave 5 (마지막)
  - **Blocks**: Final Verification
  - **Blocked By**: ALL (T1-T26)

  **References**:
  - **External**: Vercel 배포 문서, Next.js 배포 가이드

  **Acceptance Criteria**:
  **QA Scenarios (MANDATORY):**
  ```
  Scenario: 최종 빌드 성공
    Tool: Bash
    Steps:
      1. Run `bun run build`
      2. Run `bunx tsc --noEmit`
    Expected Result: 둘 다 exit code 0
    Evidence: .sisyphus/evidence/task-27-final-build.txt

  Scenario: 환경변수 예시 파일 확인
    Tool: Bash
    Steps:
      1. Check `.env.example` exists
      2. Verify it contains NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, YOUTUBE_API_KEY
    Expected Result: 4개 환경변수 정의
    Evidence: .sisyphus/evidence/task-27-env-check.txt
  ```

  **Commit**: YES
  - Message: `chore(deploy): configure vercel + env vars + final build`
  - Files: `vercel.json, next.config.ts, .env.example, .gitignore`
  - Pre-commit: `bun run build`

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `bunx tsc --noEmit` + `bun run build`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Types [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-module navigation. Test edge cases: empty state, invalid URL, very long text. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **T1**: `chore(scaffold): init next.js 15 + tailwind + shadcn ui` — package.json, tailwind.config.ts, components.json
- **T2**: `feat(supabase): setup client for server + browser` — lib/supabase/
- **T3**: `feat(db): create schema migrations for all tables` — supabase/migrations/
- **T4**: `feat(ui): add layout, navigation, toast, loading components` — components/layout/
- **T5**: `feat(design): add design tokens + color tag system` — lib/design/
- **T6**: `feat(influencer): add CRUD server actions` — lib/actions/influencer.ts
- **T7**: `feat(filter): add category/tag system + filter query builder` — lib/filters/
- **T8**: `feat(csv): add parser with field validation + normalization` — lib/csv/
- **T9**: `feat(storage): add image upload service via supabase` — lib/storage/
- **T10**: `feat(crawl): add youtube data api v3 crawler` — lib/crawlers/youtube.ts
- **T11**: `feat(crawl): add instagram og/html parser` — lib/crawlers/instagram.ts
- **T12**: `feat(crawl): add tiktok html hydration parser` — lib/crawlers/tiktok.ts
- **T13**: `feat(crawl): add generic url og tag extractor` — lib/crawlers/og.ts
- **T14**: `feat(crawl): add orchestrator with url detection + storage proxy + fallback` — lib/crawlers/orchestrator.ts
- **T15**: `feat(influencer-ui): add tanstack table with columns + image cells` — app/influencers/
- **T16**: `feat(influencer-ui): add inline cell editing mode` — app/influencers/
- **T17**: `feat(influencer-ui): add filter bar + tab presets + url state` — app/influencers/
- **T18**: `feat(influencer-ui): add row creation + crawl integration + manual upload` — app/influencers/
- **T19**: `feat(ads): add cards + folders CRUD server actions` — lib/actions/ads.ts
- **T20**: `feat(ads-ui): add sidebar folder navigation` — app/ads/
- **T21**: `feat(ads-ui): add masonry card grid` — app/ads/
- **T22**: `feat(ads-ui): add card creation with url crawl preview` — app/ads/
- **T23**: `feat(ads-ui): add card detail modal + edit + delete` — app/ads/
- **T24**: `feat(import): add csv import ui with preview + progress` — app/import/
- **T25**: `feat(search): add text search for influencers + ad board` — components/search/
- **T26**: `feat(polish): add error boundaries + skeletons + empty states + responsive` — components/
- **T27**: `chore(deploy): configure vercel + env vars + final build` — vercel.json, .env.example

---

## Success Criteria

### Verification Commands
```bash
bun run build        # Expected: Build successful, exit code 0
bunx tsc --noEmit    # Expected: No type errors, exit code 0
```

### Final Checklist
- [ ] 인플루언서 18필드 테이블 표시 + 인라인 편집 동작
- [ ] URL 크롤링으로 프로필+영상 썸네일 자동 추출 (YouTube/Instagram/TikTok)
- [ ] 크롤링 실패 시 수동 이미지 업로드 동작
- [ ] 필터 프리셋 7개 (참고/리스트업/mcn/무조건/과거/공구브랜드/광고) 동작
- [ ] 광고 보드: 폴더 네비게이션 + 카드 그리드 표시
- [ ] 광고 카드: URL 크롤링 → 썸네일+한줄평+참고브랜드 카드 생성
- [ ] CSV 업로드로 기존 데이터 임포트 동작
- [ ] 검색 기능 동작
- [ ] Vercel 배포 URL 접속 가능
- [ ] 모든 이미지가 Supabase Storage에 저장됨 (외부 CDN URL 없음)
