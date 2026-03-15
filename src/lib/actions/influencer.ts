'use server'

import { createClient } from '@/lib/supabase/server'
import { Influencer, InfluencerInsert, InfluencerUpdate, ActionResult, TabCategory } from '@/lib/types/database'
import { revalidatePath } from 'next/cache'

export interface InfluencerFilters {
  tab_category?: TabCategory
  classification?: string
  collaboration_type?: string
  category?: string
  gender?: string
  must_do?: boolean
  search?: string
}

export async function getInfluencers(filters?: InfluencerFilters): Promise<ActionResult<Influencer[]>> {
  try {
    const supabase = await createClient()
    let query = supabase.from('influencers').select('*').order('no', { ascending: true })

    if (filters?.tab_category) {
      query = query.eq('tab_category', filters.tab_category)
    }
    if (filters?.classification) {
      query = query.eq('classification', filters.classification)
    }
    if (filters?.collaboration_type) {
      query = query.eq('collaboration_type', filters.collaboration_type)
    }
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.gender) {
      query = query.eq('gender', filters.gender)
    }
    if (filters?.must_do !== undefined) {
      query = query.eq('must_do', filters.must_do)
    }
    if (filters?.search) {
      query = query.or(
        `nickname.ilike.%${filters.search}%,real_name.ilike.%${filters.search}%,notes.ilike.%${filters.search}%,selection_reason.ilike.%${filters.search}%`
      )
    }

    const { data, error } = await query
    if (error) throw error
    return { success: true, data: data ?? [] }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function getTabCounts(): Promise<ActionResult<Record<string, number>>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('influencers').select('tab_category')
    if (error) throw error
    const counts: Record<string, number> = { all: data.length }
    for (const row of data) {
      counts[row.tab_category] = (counts[row.tab_category] || 0) + 1
    }
    return { success: true, data: counts }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function getInfluencer(id: string): Promise<ActionResult<Influencer>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('influencers')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function createInfluencer(data: Partial<InfluencerInsert>): Promise<ActionResult<Influencer>> {
  try {
    const supabase = await createClient()
    const { data: created, error } = await supabase
      .from('influencers')
      .insert([{ tab_category: 'listup' as TabCategory, must_do: false, ...data }])
      .select()
      .single()
    if (error) throw error
    revalidatePath('/influencers')
    return { success: true, data: created }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function updateInfluencer(id: string, data: InfluencerUpdate): Promise<ActionResult<Influencer>> {
  try {
    const supabase = await createClient()
    const { data: updated, error } = await supabase
      .from('influencers')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    revalidatePath('/influencers')
    return { success: true, data: updated }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function deleteInfluencer(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('influencers').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/influencers')
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function updateInfluencerField(
  id: string,
  field: keyof InfluencerUpdate,
  value: unknown
): Promise<ActionResult<Influencer>> {
  try {
    const supabase = await createClient()
    const { data: updated, error } = await supabase
      .from('influencers')
      .update({ [field]: value })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    // revalidatePath 제거 — 인라인 편집은 로컬 state로 즉시 반영되므로
    // 페이지 전체 리렌더를 유발하면 깜빡거림 발생
    return { success: true, data: updated }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

// URL이 있지만 이미지가 없는 모든 인플루언서를 일괄 크롤링
export async function crawlAllMissingImages(): Promise<ActionResult<{ total: number; success: number; failed: number }>> {
  try {
    const supabase = await createClient()
    const { data: rows, error } = await supabase
      .from('influencers')
      .select('id, url')
      .not('url', 'is', null)
      .is('profile_image_url', null)

    if (error) throw error
    if (!rows || rows.length === 0) return { success: true, data: { total: 0, success: 0, failed: 0 } }

    let successCount = 0
    let failedCount = 0

    // 순차 실행 + 딜레이 (API rate limit 방지)
    for (const row of rows) {
      if (!row.url) continue
      const result = await crawlAndUpdateInfluencer(row.id, row.url)
      if (result.success) successCount++
      else failedCount++
      // Instagram/TikTok API rate limit 방지를 위해 3초 대기
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }

    revalidatePath('/influencers')
    return { success: true, data: { total: rows.length, success: successCount, failed: failedCount } }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

// URL 입력 시 프로필/영상 정보 크롤링 후 DB 업데이트
export async function crawlAndUpdateInfluencer(
  id: string,
  url: string
): Promise<ActionResult<Influencer>> {
  const { isInstagramUrl, crawlInstagramProfile } = await import('@/lib/crawlers/instagram')
  const { isYouTubeUrl, crawlYouTubeChannel } = await import('@/lib/crawlers/youtube')
  const { isTikTokUrl, crawlTikTokProfile } = await import('@/lib/crawlers/tiktok')

  try {
    const supabase = await createClient()
    const updateData: Record<string, unknown> = { url }

    if (isInstagramUrl(url)) {
      updateData.classification = 'instagram'
      const result = await crawlInstagramProfile(url)
      if (result.profileImage) updateData.profile_image_url = result.profileImage

    } else if (isYouTubeUrl(url)) {
      updateData.classification = 'youtube'
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
      updateData.classification = 'tiktok'
      const result = await crawlTikTokProfile(url)
      if (result.profileImage) updateData.profile_image_url = result.profileImage

    } else if (url.includes('blog.naver.com')) {
      updateData.classification = 'blog'
      const { crawlNaverBlog } = await import('@/lib/crawlers/naver-blog')
      const result = await crawlNaverBlog(url)
      if (result.thumbnail) updateData.profile_image_url = result.thumbnail
    }

    const { data: updated, error } = await supabase
      .from('influencers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    revalidatePath('/influencers')
    return { success: true, data: updated }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
