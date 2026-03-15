export interface NaverBlogCrawlResult {
  platform: 'blog'
  thumbnail?: string
  error?: string
}

const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'

export function isNaverBlogUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.hostname === 'blog.naver.com' || parsed.hostname === 'm.blog.naver.com'
  } catch {
    return false
  }
}

/** blog.naver.com URL에서 blogId와 logNo 추출 */
function parseBlogUrl(url: string): { blogId: string; logNo: string } | null {
  try {
    const parsed = new URL(url)

    // 형식 1: blog.naver.com/{blogId}/{logNo}
    const pathParts = parsed.pathname.split('/').filter(Boolean)
    if (pathParts.length >= 2 && /^\d+$/.test(pathParts[1])) {
      return { blogId: pathParts[0], logNo: pathParts[1] }
    }

    // 형식 2: blog.naver.com/PostView.naver?blogId=xxx&logNo=xxx
    const blogId = parsed.searchParams.get('blogId')
    const logNo = parsed.searchParams.get('logNo')
    if (blogId && logNo) {
      return { blogId, logNo }
    }

    return null
  } catch {
    return null
  }
}

function extractOgImage(html: string): string | undefined {
  const match =
    html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ??
    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
  return match?.[1]
}

/** 방법 1: 모바일 URL — og:image가 서버 렌더링됨 */
async function fetchViaMobile(blogId: string, logNo: string): Promise<{ thumbnail?: string; error?: string }> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(`https://m.blog.naver.com/${blogId}/${logNo}`, {
      signal: controller.signal,
      headers: {
        'User-Agent': MOBILE_UA,
        'Accept-Language': 'ko-KR,ko;q=0.9',
        'Accept': 'text/html',
      },
    })

    const html = await response.text()
    const thumbnail = extractOgImage(html)

    if (thumbnail) return { thumbnail }
    return { error: '모바일 페이지에서 og:image를 찾을 수 없습니다' }
  } catch (error) {
    return { error: String(error) }
  } finally {
    clearTimeout(timeoutId)
  }
}

/** 방법 2: PostView.naver iframe 소스 직접 접근 */
async function fetchViaPostView(blogId: string, logNo: string): Promise<{ thumbnail?: string; error?: string }> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(
      `https://blog.naver.com/PostView.naver?blogId=${blogId}&logNo=${logNo}`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': MOBILE_UA,
          'Referer': 'https://blog.naver.com/',
          'Accept-Language': 'ko-KR,ko;q=0.9',
        },
      }
    )

    const html = await response.text()
    const thumbnail = extractOgImage(html)

    // PostView에 og:image가 없으면 본문 첫 이미지 추출
    if (!thumbnail) {
      const imgMatch = html.match(/<img[^>]+src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|gif|webp)[^"']*)["']/i)
      if (imgMatch?.[1]) return { thumbnail: imgMatch[1] }
    }

    if (thumbnail) return { thumbnail }
    return { error: 'PostView에서 이미지를 찾을 수 없습니다' }
  } catch (error) {
    return { error: String(error) }
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function crawlNaverBlog(blogUrl: string): Promise<NaverBlogCrawlResult> {
  const parsed = parseBlogUrl(blogUrl)

  if (!parsed) {
    return { platform: 'blog', error: '유효한 네이버 블로그 URL이 아닙니다' }
  }

  // 방법 1: 모바일 URL
  const mobileResult = await fetchViaMobile(parsed.blogId, parsed.logNo)
  if (mobileResult.thumbnail) {
    return { platform: 'blog', thumbnail: mobileResult.thumbnail }
  }

  // 방법 2: PostView iframe 소스
  const postViewResult = await fetchViaPostView(parsed.blogId, parsed.logNo)
  if (postViewResult.thumbnail) {
    return { platform: 'blog', thumbnail: postViewResult.thumbnail }
  }

  return { platform: 'blog', error: '네이버 블로그 이미지 추출 실패' }
}
