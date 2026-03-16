// ============================================================
// 프로덕션 DB 인플루언서 일괄 크롤링
// 실행: npx tsx scripts/crawl-production.ts
// ============================================================
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { crawlInstagramProfile, isInstagramUrl } from '../src/lib/crawlers/instagram'
import { crawlYouTubeChannel, isYouTubeUrl } from '../src/lib/crawlers/youtube'
import { isTikTokUrl, crawlTikTokProfile } from '../src/lib/crawlers/tiktok'

// ── env 로드 ──
function loadEnv(path: string): Record<string, string> {
  try {
    return Object.fromEntries(
      readFileSync(path, 'utf8').split('\n')
        .filter(l => l && !l.startsWith('#') && l.includes('='))
        .map(l => {
          const idx = l.indexOf('=')
          return [
            l.slice(0, idx),
            l.slice(idx + 1).replace(/^"|"\s*$/g, '').replace(/\\n/g, '').trim(),
          ]
        })
    )
  } catch {
    return {}
  }
}

const prodEnv = loadEnv('.env.production.local')
const localEnv = loadEnv('.env.local')

// YouTube API 키 설정 (로컬 → 프로덕션 순으로 확인)
process.env.YOUTUBE_API_KEY = localEnv.YOUTUBE_API_KEY || prodEnv.YOUTUBE_API_KEY || ''

const supabase = createClient(
  prodEnv.NEXT_PUBLIC_SUPABASE_URL,
  prodEnv.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

// ── 네이버 블로그 프로필 이미지 추출 (홈페이지용) ──
const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'

async function crawlBlogProfile(blogUrl: string): Promise<string | null> {
  try {
    const parsed = new URL(blogUrl)
    const parts = parsed.pathname.split('/').filter(Boolean)
    const blogId = parts[0]
    if (!blogId) return null

    // 모바일 프로필 페이지에서 og:image 추출
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    try {
      const res = await fetch(`https://m.blog.naver.com/${blogId}`, {
        signal: controller.signal,
        headers: { 'User-Agent': MOBILE_UA, 'Accept': 'text/html' },
      })
      const html = await res.text()

      // og:image
      const ogMatch =
        html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ??
        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
      if (ogMatch?.[1]) return ogMatch[1]

      // 프로필 이미지 직접 추출
      const profileMatch = html.match(/(?:profile|buddy|author)[^"]*["']([^"']+\.(?:jpg|jpeg|png|gif|webp)[^"']*)/i)
      if (profileMatch?.[1]) return profileMatch[1]

      return null
    } finally {
      clearTimeout(timeoutId)
    }
  } catch {
    return null
  }
}

// ── 메인 크롤링 ──
async function crawlAll() {
  // URL이 있고 프로필 이미지가 없는 인플루언서
  const { data: influencers, error } = await supabase
    .from('influencers')
    .select('id, nickname, url, classification, profile_image_url')
    .not('url', 'is', null)
    .is('profile_image_url', null)
    .order('no', { ascending: true })

  if (error) {
    console.error('DB 조회 실패:', error.message)
    process.exit(1)
  }

  if (!influencers?.length) {
    console.log('크롤링 대상 없음 (모든 인플루언서에 프로필 이미지 있음)')
    return
  }

  console.log(`\n📷 ${influencers.length}건 프로필/영상 크롤링 시작...\n`)

  let success = 0
  let failed = 0
  let skipped = 0

  for (let i = 0; i < influencers.length; i++) {
    const inf = influencers[i]
    const url = inf.url as string
    const progress = `[${i + 1}/${influencers.length}]`
    const updateData: Record<string, unknown> = {}

    try {
      if (isInstagramUrl(url)) {
        const result = await crawlInstagramProfile(url)
        if (result.profileImage) updateData.profile_image_url = result.profileImage

      } else if (isYouTubeUrl(url)) {
        const result = await crawlYouTubeChannel(url)
        if (result.profileImage) updateData.profile_image_url = result.profileImage
        if (result.highViewVideos.length > 0) {
          updateData.high_view_video_url = result.highViewVideos[0].url
          updateData.high_view_video_thumbnail = result.highViewVideos[0].thumbnail
        }
        if (result.lowViewVideos.length > 0) {
          updateData.low_view_video_url = result.lowViewVideos[0].url
          updateData.low_view_video_thumbnail = result.lowViewVideos[0].thumbnail
        }

      } else if (isTikTokUrl(url)) {
        const result = await crawlTikTokProfile(url)
        if (result.profileImage) updateData.profile_image_url = result.profileImage

      } else if (url.includes('blog.naver.com')) {
        const profileImage = await crawlBlogProfile(url)
        if (profileImage) updateData.profile_image_url = profileImage

      } else {
        console.log(`  ${progress} ⏭️  ${inf.nickname} — 지원하지 않는 URL`)
        skipped++
        continue
      }

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('influencers')
          .update(updateData)
          .eq('id', inf.id)

        if (updateError) {
          console.log(`  ${progress} ❌ ${inf.nickname} — DB 업데이트 실패: ${updateError.message}`)
          failed++
        } else {
          const fields = Object.keys(updateData).join(', ')
          console.log(`  ${progress} ✅ ${inf.nickname} — ${fields}`)
          success++
        }
      } else {
        console.log(`  ${progress} ❌ ${inf.nickname} — 이미지 추출 실패`)
        failed++
      }
    } catch (err) {
      console.log(`  ${progress} ❌ ${inf.nickname} — ${String(err).slice(0, 80)}`)
      failed++
    }

    // Rate limiting
    const delayMs = isInstagramUrl(url) ? 3000 : url.includes('blog.naver.com') ? 1000 : 500
    await delay(delayMs)
  }

  console.log(`\n📊 크롤링 완료!`)
  console.log(`  ✅ 성공: ${success}건`)
  console.log(`  ❌ 실패: ${failed}건`)
  console.log(`  ⏭️  스킵: ${skipped}건`)
}

crawlAll().catch(err => {
  console.error('크롤링 실패:', err)
  process.exit(1)
})
