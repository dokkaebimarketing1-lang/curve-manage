'use server'

import { createClient } from '@/lib/supabase/server'
import { AdCard, AdCardInsert, AdCardUpdate, Folder, ActionResult } from '@/lib/types/database'
import { revalidatePath } from 'next/cache'
import { deleteImage } from '@/lib/storage/image-service'

// ──────────────────────────────────────────
// Folders
// ──────────────────────────────────────────

export async function getFolders(): Promise<ActionResult<Folder[]>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('parent_id', { ascending: true })
    if (error) throw error
    return { success: true, data: data ?? [] }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function createFolder(name: string, parentId?: string): Promise<ActionResult<Folder>> {
  try {
    const supabase = await createClient()
    const { data: created, error } = await supabase
      .from('folders')
      .insert([{ name, parent_id: parentId ?? null, sort_order: 0 }])
      .select()
      .single()
    if (error) throw error
    revalidatePath('/ads')
    return { success: true, data: created }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function updateFolder(id: string, name: string): Promise<ActionResult<Folder>> {
  try {
    const supabase = await createClient()
    const { data: updated, error } = await supabase
      .from('folders')
      .update({ name })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    revalidatePath('/ads')
    return { success: true, data: updated }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function deleteFolder(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    // Cascade deletes children (via DB FK)
    // Cards in this folder → folder_id set to NULL (via ON DELETE SET NULL)
    const { error } = await supabase.from('folders').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/ads')
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

// ──────────────────────────────────────────
// Ad Cards
// ──────────────────────────────────────────

export async function getAdCards(folderId?: string | null): Promise<ActionResult<AdCard[]>> {
  try {
    const supabase = await createClient()
    let query = supabase.from('ad_cards').select('*').order('created_at', { ascending: false })

    if (folderId === null) {
      // Special: get unfoldered cards (folder_id IS NULL)
      query = query.is('folder_id', null)
    } else if (folderId !== undefined) {
      // Filter by specific folder
      query = query.eq('folder_id', folderId)
    }
    // If folderId is undefined: get ALL cards (no filter)

    const { data, error } = await query
    if (error) throw error
    return { success: true, data: data ?? [] }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function createAdCard(data: Partial<AdCardInsert>): Promise<ActionResult<AdCard>> {
  try {
    const supabase = await createClient()
    const { data: created, error } = await supabase
      .from('ad_cards')
      .insert([{ tags: [], ...data }])
      .select()
      .single()
    if (error) throw error
    revalidatePath('/ads')
    return { success: true, data: created }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function updateAdCard(id: string, data: AdCardUpdate): Promise<ActionResult<AdCard>> {
  try {
    const supabase = await createClient()
    const { data: updated, error } = await supabase
      .from('ad_cards')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    revalidatePath('/ads')
    return { success: true, data: updated }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Extract Supabase Storage path from a public URL.
 * Returns the path portion after /object/public/{bucket}/ or null if not a storage URL.
 */
function extractStoragePath(url: string): string | null {
  const match = url.match(/\/storage\/v1\/object\/public\/images\/(.+)$/)
  return match ? match[1] : null
}

export async function deleteAdCard(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    // Fetch card to check for storage image
    const { data: card, error: fetchError } = await supabase
      .from('ad_cards')
      .select('thumbnail_url')
      .eq('id', id)
      .single()
    if (fetchError) throw fetchError

    // Delete the image from Storage if it points to Supabase Storage
    if (card?.thumbnail_url) {
      const storagePath = extractStoragePath(card.thumbnail_url)
      if (storagePath) {
        await deleteImage(storagePath)
      }
    }

    const { error } = await supabase.from('ad_cards').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/ads')
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function moveAdCard(cardId: string, targetFolderId: string | null): Promise<ActionResult<AdCard>> {
  try {
    const supabase = await createClient()
    const { data: updated, error } = await supabase
      .from('ad_cards')
      .update({ folder_id: targetFolderId })
      .eq('id', cardId)
      .select()
      .single()
    if (error) throw error
    revalidatePath('/ads')
    return { success: true, data: updated }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
