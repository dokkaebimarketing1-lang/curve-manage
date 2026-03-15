'use server'

import { createClient } from '@/lib/supabase/server'
import { ActionResult } from '@/lib/types/database'
import { revalidatePath } from 'next/cache'

export async function uploadInfluencerImage(
  influencerId: string,
  field: 'profile_image_url' | 'high_view_video_thumbnail' | 'low_view_video_thumbnail',
  base64Data: string,
  fileName: string
): Promise<ActionResult<{ url: string }>> {
  try {
    const supabase = await createClient()

    // base64 → Buffer
    const base64Content = base64Data.replace(/^data:[^;]+;base64,/, '')
    const buffer = Buffer.from(base64Content, 'base64')

    // 파일 확장자 추출
    const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg'
    const storagePath = `influencers/${influencerId}/${field}.${ext}`

    // Supabase Storage에 업로드 (덮어쓰기)
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(storagePath, buffer, {
        contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        upsert: true,
      })

    if (uploadError) throw uploadError

    // Public URL 생성
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(storagePath)

    const publicUrl = urlData.publicUrl

    // influencer 레코드 업데이트
    const { error: updateError } = await supabase
      .from('influencers')
      .update({ [field]: publicUrl })
      .eq('id', influencerId)

    if (updateError) throw updateError

    revalidatePath('/influencers')
    return { success: true, data: { url: publicUrl } }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
