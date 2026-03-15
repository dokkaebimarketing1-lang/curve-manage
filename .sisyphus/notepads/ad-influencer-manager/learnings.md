## [2026-03-15] Task: T1 — Next.js Scaffold

### Package Manager
- `bun` is NOT available in the bash environment — use `npm` instead
- Command: `npm run build` (not `bun run build`)
- `npx` is available for running tools

### Project Details
- Next.js version: 16.1.6 (newer than planned 15, but OK)
- All packages installed successfully via npm
- Package manager: npm (package-lock.json present)
- `button.json` file exists at root — artifact from shadcn install, safe to ignore

### Directory Structure
- `src/app/` — App Router pages
- `src/components/ui/` — Shadcn UI components (16 components installed)
- `src/lib/` — utilities

### Shadcn Components Installed (16 total)
badge, button, card, command, dialog, dropdown-menu, input, popover, scroll-area, select, separator, sheet, skeleton, table, tabs, toast

### Important: All Radix UI packages in devDependencies
- @radix-ui/react-dialog → devDependencies (not dependencies) — may need to move to dependencies if build fails
- Using `sonner` for toasts (not shadcn toast) — `sonner` is in devDependencies

### Build
- Build works with: `npm run build`
- TypeScript check embedded in build (Turbopack)
- First build: 4.3s compile time

## [2026-03-16] Task: T2 — Supabase Client Setup

### Supabase Integration
- Installed: `@supabase/supabase-js` + `@supabase/ssr`
- Created 3 client files in `src/lib/supabase/`:
  1. **client.ts** — Browser client (createBrowserClient)
  2. **server.ts** — Server client (createServerClient with cookie handling)
  3. **admin.ts** — Admin client (Service Role Key, no auth)

### Key Decisions
- NO authentication middleware (1-user, no-auth setup)
- NO RLS policies (single-user app)
- Environment variables: warnings only (no errors thrown for missing .env)
- Server client: gracefully handles cookie errors in Server Components

### TypeScript
- All 3 files pass `npx tsc --noEmit` with no errors
- Fixed forEach callback to use block statement (not arrow expression)

## [2026-03-16] Task: T6 — Influencer CRUD Server Actions

### File Created
- `src/lib/actions/influencer.ts` — 6 server action functions

### Functions (all return `Promise<ActionResult<T>>`)
1. `getInfluencers(filters?)` — filtered list query with `.or()` for search
2. `getInfluencer(id)` — single row by id
3. `createInfluencer(data)` — insert with defaults (tab_category='listup', must_do=false)
4. `updateInfluencer(id, data)` — full update
5. `deleteInfluencer(id)` — delete by id
6. `updateInfluencerField(id, field, value)` — single field update (inline edit)

### Key Patterns
- `'use server'` directive at file top
- `revalidatePath('/influencers')` after mutations (create/update/delete)
- Supabase untyped client (no generics on `createClient()`) — queries return `any` which satisfies type assertions
- `InfluencerFilters` interface exported for use by UI components
- `createInfluencer` takes `Partial<InfluencerInsert>` for flexible creation
- TypeScript passes with no errors (`npx tsc --noEmit` exit 0)

## [2026-03-16] Task: T7 — Influencer Filter System

### Files Created
- `src/lib/filters/influencer-filters.ts` — InfluencerFilters interface + TAB_PRESETS
- `src/lib/filters/url-state.ts` — filtersToSearchParams() + searchParamsToFilters()

### TAB_PRESETS (8 items)
- all(전체), reference(참고), listup(리스트업), mcn(MCN회사), must(무조건), past(과거), group_buy_brand(공구 하는 브랜드), ad(광고)

### Key Design Decisions
- Server-side only utility (no client-side filtering)
- No external libraries — pure URLSearchParams
- VALID_TAB_CATEGORIES Set for safe tab parsing from URL params
- URL param mapping: tab_category→tab, collaboration_type→collab (shorter URL keys)
- searchParamsToFilters accepts `Record<string, string | string[] | undefined>` for Next.js App Router compatibility
- must_do strict parsing: only 'true'→true, 'false'→false (no truthy coercion)
- TypeScript passes with no errors (`npx tsc --noEmit` exit 0)

## [2026-03-16] Task: T9 — Storage Image Service

### File Created
- `src/lib/storage/image-service.ts` — 4 exported functions

### Functions
1. `uploadImage(buffer, path, contentType)` — Buffer → Supabase Storage upload (upsert)
2. `uploadImageFromUrl(sourceUrl, storagePath)` — fetch external URL → proxy to Storage
3. `deleteImage(path)` — remove from Storage
4. `getPublicUrl(path)` — returns public URL string (sync, no async)

### Key Design Decisions
- `'use server'` directive — server actions only
- Bucket name: `images` (constant)
- AbortController + setTimeout for 8s download timeout (Vercel 10s limit)
- 5MB max file size check on downloaded images
- User-Agent header on fetch to avoid bot-blocking
- `upsert: true` on upload — overwrites existing images at same path
- All async functions return `{ success, url?, error? }` pattern
- `getPublicUrl` is synchronous (no await needed)
- TypeScript passes with no errors (`npx tsc --noEmit` exit 0)

## [2026-03-16] Task: T8 — CSV Parser

### File Created
- `src/lib/csv/parser.ts` — CSV parsing with Korean header mapping

### Exports
- `parseInfluencerCSV(csvText: string): ParseResult` — main parser function
- `ParseResult` interface — { valid, errors, total }

### Key Features
- `HEADER_MAP`: 20 Korean header → English field mappings (including aliases like 팔로워/구독자수)
- `normalizeFollowerCount`: Handles 만, K/k, M/m suffixes + comma-separated numbers
- `normalizeMustDo`: Handles o/ㅇ/예/yes/true/1/y as truthy
- `rate` field: parseInt with comma removal
- Default values: tab_category='listup', must_do=false
- Validation: rows without nickname AND url are pushed to errors array
- Row numbering: i+2 (1-indexed + header row offset)

### Dependencies
- `papaparse` + `@types/papaparse` (already installed)
- No 'use client' directive — usable on both server and client
- TypeScript passes with no errors (`npx tsc --noEmit` exit 0)

## [2026-03-16] Task: T10 — YouTube API Crawler

### File Created
- `src/lib/crawlers/youtube.ts` — YouTube Data API v3 기반 채널/영상 크롤러

### Exports
- `isYouTubeUrl(url)` — youtube.com / youtu.be 도메인 판별
- `crawlYouTubeChannel(channelUrl)` — 프로필 이미지 + 고조회수/저조회수 영상 썸네일 URL 반환
- `crawlYouTubeVideo(videoUrl)` — 단일 영상 썸네일/제목 반환

### Key Design Decisions
- `'use server'` + `fetch`만 사용 (추가 라이브러리 없음)
- API 키는 `YOUTUBE_API_KEY` 필수, 미설정 시 명시적 에러 반환
- 채널 크롤링은 쿼터 최적화를 위해 uploads playlist 기반(`channels` + `playlistItems` + `videos`)으로 구현
- 영상 조회는 최대 50개만 수집 후 조회수 정렬로 상/하위 5개 선택
- 이미지 저장은 하지 않고 원본 URL만 반환 (Storage 업로드 미포함)
