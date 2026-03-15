const TIKTOK_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
const TIKTOK_TIMEOUT_MS = 8000

export interface TikTokVideo {
  videoId: string
  thumbnail: string
  url: string
}

export interface TikTokCrawlResult {
  platform: 'tiktok'
  profileImage?: string
  username?: string
  videos?: TikTokVideo[]
  postThumbnail?: string
  error?: string
}

interface TikTokHydrationUser {
  avatarLarger?: string
  avatarMedium?: string
  uniqueId?: string
}

interface TikTokHydrationItem {
  id?: string
  video?: {
    id?: string
    cover?: string
    dynamicCover?: string
    originCover?: string
  }
}

function extractHydrationJson(html: string): unknown {
  const hydrationMatch = html.match(
    /<script[^>]*id=["']__UNIVERSAL_DATA_FOR_REHYDRATION__["'][^>]*>([\s\S]*?)<\/script>/i
  )

  if (!hydrationMatch?.[1]) {
    return null
  }

  try {
    return JSON.parse(hydrationMatch[1])
  } catch {
    return null
  }
}

function extractOgImage(html: string): string | undefined {
  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
  return ogImageMatch?.[1]
}

async function fetchHtml(url: string, headers?: Record<string, string>): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIKTOK_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': TIKTOK_USER_AGENT,
        ...headers,
      },
    })

    return await response.text()
  } finally {
    clearTimeout(timeoutId)
  }
}

function extractProfileFromHydration(hydrationData: unknown): Pick<TikTokCrawlResult, 'profileImage' | 'username' | 'videos'> {
  const scopedData = hydrationData as
    | {
        __DEFAULT_SCOPE__?: {
          'webapp.user-detail'?: {
            userInfo?: {
              user?: TikTokHydrationUser
            }
            itemList?: string[]
          }
          webapp?: {
            'user-detail'?: {
              userInfo?: {
                user?: TikTokHydrationUser
              }
              itemList?: string[]
            }
          }
          ItemModule?: Record<string, TikTokHydrationItem>
        }
      }
    | null

  const defaultScope = scopedData?.__DEFAULT_SCOPE__
  const userDetail = defaultScope?.['webapp.user-detail'] ?? defaultScope?.webapp?.['user-detail']
  const user = userDetail?.userInfo?.user

  const profileImage = user?.avatarLarger ?? user?.avatarMedium
  const username = user?.uniqueId

  const itemIds = userDetail?.itemList ?? []
  const itemModule = defaultScope?.ItemModule ?? {}
  const videos = itemIds
    .map((itemId) => {
      const item = itemModule[itemId]
      const videoId = item?.video?.id ?? item?.id
      const thumbnail = item?.video?.cover ?? item?.video?.dynamicCover ?? item?.video?.originCover

      if (!videoId || !thumbnail) {
        return null
      }

      return {
        videoId,
        thumbnail,
        url: `https://www.tiktok.com/@${username ?? ''}/video/${videoId}`,
      }
    })
    .filter((video): video is TikTokVideo => video !== null)

  return {
    profileImage,
    username,
    videos: videos.length > 0 ? videos : undefined,
  }
}

export function isTikTokUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.hostname === 'tiktok.com' || parsed.hostname.endsWith('.tiktok.com')
  } catch {
    return false
  }
}

export async function crawlTikTokProfile(profileUrl: string): Promise<TikTokCrawlResult> {
  try {
    const html = await fetchHtml(profileUrl, {
      'Accept-Language': 'ko-KR,ko;q=0.9',
    })

    const hydrationData = extractHydrationJson(html)
    if (hydrationData) {
      const { profileImage, username, videos } = extractProfileFromHydration(hydrationData)
      if (profileImage) {
        return { platform: 'tiktok', profileImage, username, videos }
      }
    }

    const profileImage = extractOgImage(html)
    if (!profileImage) {
      return { platform: 'tiktok', error: 'TikTok 크롤링 실패. 이미지를 수동으로 업로드해주세요.' }
    }

    return { platform: 'tiktok', profileImage }
  } catch (error) {
    return { platform: 'tiktok', error: `TikTok 크롤링 실패. (${String(error)})` }
  }
}

export async function crawlTikTokVideo(videoUrl: string): Promise<TikTokCrawlResult> {
  try {
    const html = await fetchHtml(videoUrl)
    const postThumbnail = extractOgImage(html)

    if (!postThumbnail) {
      return { platform: 'tiktok', error: 'TikTok 영상 썸네일 추출 실패. 이미지를 수동으로 업로드해주세요.' }
    }

    return { platform: 'tiktok', postThumbnail }
  } catch (error) {
    return { platform: 'tiktok', error: `TikTok 영상 크롤링 실패. (${String(error)})` }
  }
}
