// ============================================================
// Instagram 인플루언서 프로필 이미지 재크롤링
// 방법: 여러 User-Agent 로테이션 + 5초 딜레이 + 다중 폴백
// 실행: npx tsx scripts/crawl-instagram.ts
// ============================================================
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// ── env 로드 ──
function loadEnv(path: string): Record<string, string> {
  try {
    return Object.fromEntries(
      readFileSync(path, 'utf8').split('\n')
        .filter(l => l && !l.startsWith('#') && l.includes('='))
        .map(l => {
          const idx = l.indexOf('=')
          return [l.slice(0, idx), l.slice(idx + 1).replace(/^"|"\s*$/g, '').replace(/\\n/g, '').trim()]
        })
    )
  } catch { return {} }
}

const prodEnv = loadEnv('.env.production.local')
const supabase = createClient(prodEnv.NEXT_PUBLIC_SUPABASE_URL, prodEnv.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

// ── User-Agent 로테이션 ──
const USER_AGENTS = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
]

const IG_APP_ID = '936619743392459'
const IG_APP_UA = 'Instagram 275.0.0.27.98 Android (33/13; 420dpi; 1080x2400; samsung; SM-G991B; o1s; exynos2100; en_US; 458229258)'

function extractUsername(url: string): string | null {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean)
    if (parts.length >= 1 && !['p', 'reel', 'stories', 'explore', 'accounts'].includes(parts[0])) {
      return parts[0]
    }
    return null
  } catch { return null }
}

function extractOgImage(html: string): string | undefined {
  const m = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
  return m?.[1]
}

// ── 크롤링 방법들 ──

/** 방법 1: i.instagram.com 내부 API */
async function method1_internalApi(username: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
      {
        headers: { 'User-Agent': IG_APP_UA, 'Accept': 'application/json', 'x-ig-app-id': IG_APP_ID },
        signal: AbortSignal.timeout(12000),
      }
    )
    if (!res.ok) return null
    const json = await res.json() as { data?: { user?: { profile_pic_url_hd?: string; profile_pic_url?: string } } }
    return json.data?.user?.profile_pic_url_hd ?? json.data?.user?.profile_pic_url ?? null
  } catch { return null }
}

/** 방법 2: www GraphQL API */
async function method2_graphql(username: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
      {
        headers: {
          'User-Agent': USER_AGENTS[0],
          'Accept': '*/*',
          'x-ig-app-id': IG_APP_ID,
          'x-requested-with': 'XMLHttpRequest',
          'sec-fetch-site': 'same-origin',
          'Referer': `https://www.instagram.com/${username}/`,
        },
        signal: AbortSignal.timeout(12000),
      }
    )
    if (!res.ok) return null
    const json = await res.json() as { data?: { user?: { profile_pic_url_hd?: string; profile_pic_url?: string } } }
    return json.data?.user?.profile_pic_url_hd ?? json.data?.user?.profile_pic_url ?? null
  } catch { return null }
}

/** 방법 3: 모바일 브라우저로 프로필 페이지 og:image 추출 */
async function method3_mobileOg(username: string, uaIndex: number): Promise<string | null> {
  try {
    const ua = USER_AGENTS[uaIndex % USER_AGENTS.length]
    const res = await fetch(`https://www.instagram.com/${username}/`, {
      headers: {
        'User-Agent': ua,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
      redirect: 'follow',
    })
    const html = await res.text()
    return extractOgImage(html) ?? null
  } catch { return null }
}

/** 방법 4: 외부 프록시 서비스 (noembed) */
async function method4_noembed(username: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://noembed.com/embed?url=https://www.instagram.com/${username}/`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (!res.ok) return null
    const json = await res.json() as { thumbnail_url?: string }
    return json.thumbnail_url ?? null
  } catch { return null }
}

// ── 메인 ──
async function crawlInstagram() {
  const { data: influencers, error } = await supabase
    .from('influencers')
    .select('id, nickname, url, profile_image_url')
    .eq('classification', 'instagram')
    .is('profile_image_url', null)
    .not('url', 'is', null)
    .order('no', { ascending: true })

  if (error) { console.error('DB 조회 실패:', error.message); return }
  if (!influencers?.length) { console.log('크롤링 대상 없음'); return }

  console.log(`\n📷 Instagram ${influencers.length}건 크롤링 시작 (4단계 폴백)...\n`)

  let success = 0, failed = 0

  for (let i = 0; i < influencers.length; i++) {
    const inf = influencers[i]
    const url = inf.url as string
    const username = extractUsername(url)
    const progress = `[${i + 1}/${influencers.length}]`

    if (!username) {
      console.log(`  ${progress} ⏭️  ${inf.nickname} — 유저네임 추출 실패`)
      failed++
      continue
    }

    let profileImage: string | null = null

    // 방법 1: 내부 API
    profileImage = await method1_internalApi(username)
    if (profileImage) {
      console.log(`  ${progress} ✅ ${inf.nickname} — 내부API`)
    }

    // 방법 2: GraphQL
    if (!profileImage) {
      await delay(1000)
      profileImage = await method2_graphql(username)
      if (profileImage) console.log(`  ${progress} ✅ ${inf.nickname} — GraphQL`)
    }

    // 방법 3: 모바일 og:image
    if (!profileImage) {
      await delay(1000)
      profileImage = await method3_mobileOg(username, i)
      if (profileImage) console.log(`  ${progress} ✅ ${inf.nickname} — 모바일OG`)
    }

    // 방법 4: noembed 프록시
    if (!profileImage) {
      await delay(500)
      profileImage = await method4_noembed(username)
      if (profileImage) console.log(`  ${progress} ✅ ${inf.nickname} — noembed`)
    }

    if (profileImage) {
      await supabase.from('influencers').update({ profile_image_url: profileImage }).eq('id', inf.id)
      success++
    } else {
      console.log(`  ${progress} ❌ ${inf.nickname} (@${username})`)
      failed++
    }

    // 5초 딜레이 (레이트리밋 방지)
    await delay(5000)
  }

  console.log(`\n📊 완료! 성공: ${success}건, 실패: ${failed}건`)
}

crawlInstagram().catch(err => { console.error('실패:', err); process.exit(1) })
