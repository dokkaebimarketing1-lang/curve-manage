const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'
const MAX_VIDEO_IDS = 50
const PICK_COUNT = 5

export interface YouTubeVideo {
  videoId: string
  title: string
  thumbnail: string
  viewCount: number
  url: string
}

export interface YouTubeCrawlResult {
  platform: 'youtube'
  channelId?: string
  channelName?: string
  profileImage?: string
  highViewVideos: YouTubeVideo[]
  lowViewVideos: YouTubeVideo[]
  error?: string
}

interface YouTubeApiError {
  error?: {
    message?: string
  }
}

interface YouTubeChannelItem {
  id: string
  snippet?: {
    title?: string
    channelId?: string
    thumbnails?: {
      high?: { url?: string }
      medium?: { url?: string }
      default?: { url?: string }
    }
  }
  contentDetails?: {
    relatedPlaylists?: {
      uploads?: string
    }
  }
}

interface YouTubeVideoItem {
  id?: string
  snippet?: {
    title?: string
    channelId?: string
    thumbnails?: {
      high?: { url?: string }
      medium?: { url?: string }
      default?: { url?: string }
    }
    resourceId?: {
      videoId?: string
    }
  }
  statistics?: {
    viewCount?: string
  }
  contentDetails?: {
    videoId?: string
  }
}

function getApiKey(): string {
  return process.env.YOUTUBE_API_KEY ?? ''
}

function extractBestThumbnail(item: YouTubeVideoItem | YouTubeChannelItem): string {
  const thumbnails = item.snippet?.thumbnails
  return thumbnails?.high?.url ?? thumbnails?.medium?.url ?? thumbnails?.default?.url ?? ''
}

function extractVideoIdFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()

    if (hostname === 'youtu.be') {
      const shortId = parsed.pathname.split('/').filter(Boolean)[0]
      return shortId || null
    }

    if (hostname === 'youtube.com' || hostname === 'www.youtube.com' || hostname === 'm.youtube.com') {
      const watchId = parsed.searchParams.get('v')
      if (watchId) {
        return watchId
      }

      const parts = parsed.pathname.split('/').filter(Boolean)
      if (parts[0] === 'shorts' && parts[1]) {
        return parts[1]
      }
    }

    return null
  } catch {
    return null
  }
}

async function fetchYouTubeApi<T>(
  endpoint: string,
  params: Record<string, string>
): Promise<{ data?: T; error?: string }> {
  try {
    const query = new URLSearchParams(params)
    const response = await fetch(`${YOUTUBE_API_BASE}${endpoint}?${query.toString()}`)
    const payload = (await response.json()) as T & YouTubeApiError

    if (!response.ok || payload.error?.message) {
      return { error: payload.error?.message ?? `YouTube API 요청 실패 (${response.status})` }
    }

    return { data: payload }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'YouTube API 요청 중 오류가 발생했습니다' }
  }
}

function parseChannelHint(url: string): { kind: 'channelId' | 'handle' | 'username' | 'custom'; value: string } | null {
  try {
    const parsed = new URL(url)
    const parts = parsed.pathname.split('/').filter(Boolean)

    if (parts.length === 0) {
      return null
    }

    const first = parts[0]

    if (first.startsWith('@')) {
      return { kind: 'handle', value: first.slice(1) }
    }

    if (first === 'channel' && parts[1]) {
      return { kind: 'channelId', value: parts[1] }
    }

    if (first === 'user' && parts[1]) {
      return { kind: 'username', value: parts[1] }
    }

    if (first === 'c' && parts[1]) {
      return { kind: 'custom', value: parts[1] }
    }

    return null
  } catch {
    return null
  }
}

function asYouTubeVideos(items: YouTubeVideoItem[]): YouTubeVideo[] {
  return items
    .map((item) => {
      const videoId = item.id ?? item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId
      const thumbnail = extractBestThumbnail(item)

      if (!videoId || !thumbnail) {
        return null
      }

      return {
        videoId,
        title: item.snippet?.title ?? '',
        thumbnail,
        viewCount: Number(item.statistics?.viewCount ?? 0),
        url: `https://www.youtube.com/watch?v=${videoId}`,
      }
    })
    .filter((video): video is YouTubeVideo => video !== null)
}

export function isYouTubeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com'].includes(parsed.hostname)
  } catch {
    return false
  }
}

async function resolveChannelId(url: string, apiKey: string): Promise<string | null> {
  const hint = parseChannelHint(url)

  if (hint?.kind === 'channelId') {
    return hint.value
  }

  if (hint?.kind === 'handle') {
    const result = await fetchYouTubeApi<{ items?: YouTubeChannelItem[] }>('/channels', {
      part: 'id',
      forHandle: hint.value,
      key: apiKey,
    })

    return result.data?.items?.[0]?.id ?? null
  }

  if (hint?.kind === 'username') {
    const result = await fetchYouTubeApi<{ items?: YouTubeChannelItem[] }>('/channels', {
      part: 'id',
      forUsername: hint.value,
      key: apiKey,
    })

    return result.data?.items?.[0]?.id ?? null
  }

  if (hint?.kind === 'custom') {
    const customByHandle = await fetchYouTubeApi<{ items?: YouTubeChannelItem[] }>('/channels', {
      part: 'id',
      forHandle: hint.value,
      key: apiKey,
    })

    if (customByHandle.data?.items?.[0]?.id) {
      return customByHandle.data.items[0].id
    }

    const customBySearch = await fetchYouTubeApi<{ items?: Array<{ id?: { channelId?: string } }> }>('/search', {
      part: 'id',
      q: hint.value,
      type: 'channel',
      maxResults: '1',
      key: apiKey,
    })

    return customBySearch.data?.items?.[0]?.id?.channelId ?? null
  }

  const videoId = extractVideoIdFromUrl(url)
  if (videoId) {
    const videoResult = await fetchYouTubeApi<{ items?: YouTubeVideoItem[] }>('/videos', {
      part: 'snippet',
      id: videoId,
      key: apiKey,
    })

    const channelId = videoResult.data?.items?.[0]?.snippet?.channelId
    return typeof channelId === 'string' ? channelId : null
  }

  return null
}

export async function crawlYouTubeChannel(channelUrl: string): Promise<YouTubeCrawlResult> {
  const baseResult: YouTubeCrawlResult = {
    platform: 'youtube',
    highViewVideos: [],
    lowViewVideos: [],
  }

  if (!isYouTubeUrl(channelUrl)) {
    return { ...baseResult, error: '유효한 YouTube URL이 아닙니다' }
  }

  const apiKey = getApiKey()
  if (!apiKey) {
    return {
      ...baseResult,
      error: 'YouTube API 키가 설정되지 않았습니다. YOUTUBE_API_KEY 환경변수를 설정해주세요.',
    }
  }

  const channelId = await resolveChannelId(channelUrl, apiKey)
  if (!channelId) {
    return { ...baseResult, error: '채널을 찾을 수 없습니다' }
  }

  const channelResult = await fetchYouTubeApi<{ items?: YouTubeChannelItem[] }>('/channels', {
    part: 'snippet,contentDetails',
    id: channelId,
    key: apiKey,
  })

  if (channelResult.error) {
    return { ...baseResult, channelId, error: channelResult.error }
  }

  const channel = channelResult.data?.items?.[0]
  if (!channel) {
    return { ...baseResult, channelId, error: '채널을 찾을 수 없습니다' }
  }

  const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads
  if (!uploadsPlaylistId) {
    return { ...baseResult, channelId, channelName: channel.snippet?.title, error: '업로드 영상을 찾을 수 없습니다' }
  }

  const playlistResult = await fetchYouTubeApi<{ items?: YouTubeVideoItem[] }>('/playlistItems', {
    part: 'contentDetails',
    playlistId: uploadsPlaylistId,
    maxResults: String(MAX_VIDEO_IDS),
    key: apiKey,
  })

  if (playlistResult.error) {
    return {
      ...baseResult,
      channelId,
      channelName: channel.snippet?.title,
      profileImage: extractBestThumbnail(channel),
      error: playlistResult.error,
    }
  }

  const videoIds = (playlistResult.data?.items ?? [])
    .map((item) => item.contentDetails?.videoId)
    .filter((id): id is string => Boolean(id))

  if (videoIds.length === 0) {
    return {
      ...baseResult,
      channelId,
      channelName: channel.snippet?.title,
      profileImage: extractBestThumbnail(channel),
    }
  }

  const videosResult = await fetchYouTubeApi<{ items?: YouTubeVideoItem[] }>('/videos', {
    part: 'statistics,snippet',
    id: videoIds.slice(0, MAX_VIDEO_IDS).join(','),
    key: apiKey,
  })

  if (videosResult.error) {
    return {
      ...baseResult,
      channelId,
      channelName: channel.snippet?.title,
      profileImage: extractBestThumbnail(channel),
      error: videosResult.error,
    }
  }

  const videoItems = videosResult.data?.items ?? []
  const sortedByViews = [...videoItems].sort(
    (a, b) => Number(b.statistics?.viewCount ?? 0) - Number(a.statistics?.viewCount ?? 0)
  )

  const highViewVideos = asYouTubeVideos(sortedByViews.slice(0, PICK_COUNT))
  const lowViewVideos = asYouTubeVideos(sortedByViews.slice(-PICK_COUNT).reverse())

  return {
    platform: 'youtube',
    channelId,
    channelName: channel.snippet?.title,
    profileImage: extractBestThumbnail(channel),
    highViewVideos,
    lowViewVideos,
  }
}

export async function crawlYouTubeVideo(
  videoUrl: string
): Promise<{ thumbnail?: string; title?: string; error?: string }> {
  if (!isYouTubeUrl(videoUrl)) {
    return { error: '유효한 YouTube URL이 아닙니다' }
  }

  const apiKey = getApiKey()
  if (!apiKey) {
    return {
      error: 'YouTube API 키가 설정되지 않았습니다. YOUTUBE_API_KEY 환경변수를 설정해주세요.',
    }
  }

  const videoId = extractVideoIdFromUrl(videoUrl)
  if (!videoId) {
    return { error: '영상 ID를 추출할 수 없습니다' }
  }

  const videoResult = await fetchYouTubeApi<{ items?: YouTubeVideoItem[] }>('/videos', {
    part: 'snippet',
    id: videoId,
    key: apiKey,
  })

  if (videoResult.error) {
    return { error: videoResult.error }
  }

  const video = videoResult.data?.items?.[0]
  if (!video) {
    return { error: '영상을 찾을 수 없습니다' }
  }

  return {
    thumbnail: extractBestThumbnail(video),
    title: video.snippet?.title,
  }
}
