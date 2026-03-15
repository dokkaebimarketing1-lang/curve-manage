'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { ActionResult, AdCard, AdCardInsert, Folder } from '@/lib/types/database'

export async function getAdCards(folderId?: string): Promise<ActionResult<AdCard[]>> {
  try {
    const supabase = await createClient()
    let query = supabase.from('ad_cards').select('*').order('created_at', { ascending: false })

    if (folderId) {
      query = query.eq('folder_id', folderId)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return { success: true, data: data ?? [] }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function createAdCard(data: Partial<AdCardInsert>): Promise<ActionResult<AdCard>> {
  try {
    const supabase = await createClient()
    const payload: Partial<AdCardInsert> = {
      ...data,
      tags: data.tags ?? [],
      folder_id: data.folder_id ?? null,
      url: data.url ?? null,
      thumbnail_url: data.thumbnail_url ?? null,
      title: data.title ?? null,
      one_line_review: data.one_line_review ?? null,
      reference_brand: data.reference_brand ?? null,
      source_handle: data.source_handle ?? null,
    }

    const { data: created, error } = await supabase
      .from('ad_cards')
      .insert([payload])
      .select()
      .single()

    if (error) {
      throw error
    }

    revalidatePath('/ads')
    return { success: true, data: created }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function updateAdCard(id: string, data: Partial<AdCardInsert>): Promise<ActionResult<AdCard>> {
  try {
    const supabase = await createClient()
    const payload: Partial<AdCardInsert> = {
      ...data,
      tags: data.tags,
    }

    const { data: updated, error } = await supabase
      .from('ad_cards')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    revalidatePath('/ads')
    return { success: true, data: updated }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function deleteAdCard(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('ad_cards').delete().eq('id', id)

    if (error) {
      throw error
    }

    revalidatePath('/ads')
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function getFolders(): Promise<ActionResult<Folder[]>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    return { success: true, data: data ?? [] }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function createFolder(name: string): Promise<ActionResult<Folder>> {
  try {
    const supabase = await createClient()
    const trimmedName = name.trim()

    if (!trimmedName) {
      return { success: false, error: '폴더 이름을 입력해주세요.' }
    }

    const { data: created, error } = await supabase
      .from('folders')
      .insert([{ name: trimmedName, parent_id: null, sort_order: 0 }])
      .select()
      .single()

    if (error) {
      throw error
    }

    revalidatePath('/ads')
    return { success: true, data: created }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function deleteFolder(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('folders').delete().eq('id', id)

    if (error) {
      throw error
    }

    revalidatePath('/ads')
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
