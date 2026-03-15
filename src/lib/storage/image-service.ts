'use server'

import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET_NAME = 'images'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const DOWNLOAD_TIMEOUT = 8000 // 8 seconds

export async function uploadImage(
  buffer: Buffer,
  path: string,
  contentType: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, buffer, {
        contentType,
        upsert: true,
      })
    if (error) throw error

    const url = getPublicUrl(path)
    return { success: true, url }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function uploadImageFromUrl(
  sourceUrl: string,
  storagePath: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT)

    let response: Response
    try {
      response = await fetch(sourceUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ImageCrawler/1.0)',
        },
      })
    } finally {
      clearTimeout(timeoutId)
    }

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }

    const contentType = response.headers.get('content-type') ?? 'image/jpeg'
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    if (buffer.length > MAX_FILE_SIZE) {
      throw new Error(`Image too large: ${buffer.length} bytes (max ${MAX_FILE_SIZE})`)
    }

    return uploadImage(buffer, storagePath, contentType)
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function deleteImage(
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path])
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export function getPublicUrl(path: string): string {
  const supabase = createAdminClient()
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path)
  return data.publicUrl
}
