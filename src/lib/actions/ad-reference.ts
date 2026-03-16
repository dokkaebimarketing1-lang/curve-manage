'use server'

import { revalidatePath } from 'next/cache'

import { createAdminClient } from '@/lib/supabase/admin'
import { ActionResult, AdReference, AdReferenceInsert, AdReferenceUpdate } from '@/lib/types/database'

export async function getAdReferences(): Promise<ActionResult<AdReference[]>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('ad_references')
      .select('*')
      .order('no', { ascending: true })

    if (error) throw error
    return { success: true, data: data ?? [] }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function createAdReference(data: Partial<AdReferenceInsert> = {}): Promise<ActionResult<AdReference>> {
  try {
    const supabase = createAdminClient()
    const { data: created, error } = await supabase
      .from('ad_references')
      .insert([data])
      .select()
      .single()

    if (error) throw error
    revalidatePath('/ad-references')
    return { success: true, data: created }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function updateAdReferenceField(
  id: string,
  field: keyof AdReferenceUpdate,
  value: unknown
): Promise<ActionResult<AdReference>> {
  try {
    const supabase = createAdminClient()
    const { data: updated, error } = await supabase
      .from('ad_references')
      .update({ [field]: value })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { success: true, data: updated }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function deleteAdReference(id: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('ad_references').delete().eq('id', id)

    if (error) throw error
    revalidatePath('/ad-references')
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
