export interface InstagramCrawlResult {
  platform: 'instagram'
  profileImage?: string
  postThumbnail?: string
  username?: string
  error?: string
}

const INSTAGRAM_ERROR_MESSAGE = 'Instagram 크롤링 실패. 이미지를 수동으로 업로드해주세요.'
const INSTAGRAM_POST_ERROR_MESSAGE = 'Instagram 포스트 크롤링 실패. 이미지를 수동으로 업로드해주세요.'

// Instagram 모바일 앱 User-Agent (API 접근에 필수)
const INSTAGRAM_APP_UA =
  'Instagram 275.0.0.27.98 Android (33/13; 420dpi; 1080x2400; samsung; SM-G991B; o1s; exynos2100; en_US; 458229258)'

// Instagram 내부 앱 ID (공개값, 모든 웹 요청에 사용됨)
const IG_APP_ID = '936619743392459'

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

export function isInstagramUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['instagram.com', 'www.instagram.com'].includes(parsed.hostname)
  } catch {
    return false
  }
}

/** URL에서 Instagram 유저네임 추출 */
function extractUsernameFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    const parts = parsed.pathname.split('/').filter(Boolean)
    // /username/ or /username/reels/ etc.
    if (parts.length >= 1 && !['p', 'reel', 'stories', 'explore', 'accounts'].includes(parts[0])) {
      return parts[0]
    }
    return null
  } catch {
    return null
  }
}

function extractOgImage(html: string): string | undefined {
  const ogImageMatch =
    html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ??
    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)

  return ogImageMatch?.[1]
}

/** 방법 1: Instagram 내부 API (i.instagram.com) — 인증 불필요 */
async function fetchViaInternalApi(username: string): Promise<{ profileImage?: string; error?: string }> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 12000)

  try {
    const response = await fetch(
      `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': INSTAGRAM_APP_UA,
          'Accept': 'application/json',
          'x-ig-app-id': IG_APP_ID,
        },
      }
    )

    if (!response.ok) {
      return { error: `API 응답 ${response.status}` }
    }

    const json = await response.json() as {
      status?: string
      data?: {
        user?: {
          profile_pic_url_hd?: string
          profile_pic_url?: string
        }
      }
    }

    const user = json.data?.user
    const profileImage = user?.profile_pic_url_hd ?? user?.profile_pic_url

    if (profileImage) {
      return { profileImage }
    }

    return { error: 'API 응답에 프로필 이미지 없음' }
  } catch (error) {
    return { error: String(error) }
  } finally {
    clearTimeout(timeoutId)
  }
}

/** 방법 2: www GraphQL endpoint (?__a=1&__d=dis) */
async function fetchViaGraphQL(username: string): Promise<{ profileImage?: string; error?: string }> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 12000)

  try {
    const response = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': BROWSER_UA,
          'Accept': '*/*',
          'x-ig-app-id': IG_APP_ID,
          'x-requested-with': 'XMLHttpRequest',
          'sec-fetch-site': 'same-origin',
          'sec-fetch-mode': 'cors',
          'sec-fetch-dest': 'empty',
          'Referer': `https://www.instagram.com/${username}/`,
        },
      }
    )

    if (!response.ok) {
      return { error: `GraphQL 응답 ${response.status}` }
    }

    const json = await response.json() as {
      data?: { user?: { profile_pic_url_hd?: string; profile_pic_url?: string } }
    }

    const user = json.data?.user
    const profileImage = user?.profile_pic_url_hd ?? user?.profile_pic_url
    if (profileImage) return { profileImage }

    return { error: 'GraphQL 응답에 프로필 이미지 없음' }
  } catch (error) {
    return { error: String(error) }
  } finally {
    clearTimeout(timeoutId)
  }
}

/** 방법 3: og:image 기반 HTML 파싱 (최후 폴백) */
async function fetchViaOgImage(url: string): Promise<{ profileImage?: string; username?: string; error?: string }> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': BROWSER_UA,
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8',
        'Accept': 'text/html,application/xhtml+xml',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-dest': 'document',
      },
    })

    const html = await response.text()
    const profileImage = extractOgImage(html)
    const usernameMatch =
      html.match(/"username":"([^"]+)"/) ??
      html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']https?:\/\/www\.instagram\.com\/([^/"']+)/i)
    const username = usernameMatch?.[1]

    return { profileImage, username }
  } catch (error) {
    return { error: String(error) }
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function crawlInstagramProfile(profileUrl: string): Promise<InstagramCrawlResult> {
  // URL에서 유저네임 추출
  const username = extractUsernameFromUrl(profileUrl)

  if (username) {
    // 방법 1: 내부 API (i.instagram.com)
    const apiResult = await fetchViaInternalApi(username)
    if (apiResult.profileImage) {
      return { platform: 'instagram', profileImage: apiResult.profileImage, username }
    }

    // 방법 2: www GraphQL endpoint
    const graphqlResult = await fetchViaGraphQL(username)
    if (graphqlResult.profileImage) {
      return { platform: 'instagram', profileImage: graphqlResult.profileImage, username }
    }
  }

  // 방법 3: og:image 폴백
  const ogResult = await fetchViaOgImage(profileUrl)
  if (ogResult.profileImage) {
    return { platform: 'instagram', profileImage: ogResult.profileImage, username: username ?? ogResult.username }
  }

  return { platform: 'instagram', error: INSTAGRAM_ERROR_MESSAGE, username: username ?? undefined }
}

export async function crawlInstagramPost(postUrl: string): Promise<InstagramCrawlResult> {
  // 포스트는 og:image 방식으로 시도
  const ogResult = await fetchViaOgImage(postUrl)
  if (ogResult.profileImage) {
    return { platform: 'instagram', postThumbnail: ogResult.profileImage }
  }

  return { platform: 'instagram', error: INSTAGRAM_POST_ERROR_MESSAGE }
}
