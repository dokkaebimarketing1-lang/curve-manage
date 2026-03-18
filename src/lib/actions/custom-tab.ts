'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { ActionResult, CustomTab } from '@/lib/types/database'

export async function getCustomTabs(): Promise<ActionResult<CustomTab[]>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('custom_tabs').select('*').order('sort_order', { ascending: true })
    if (error) throw error
    return { success: true, data: data ?? [] }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function createCustomTab(value: string, label: string): Promise<ActionResult<CustomTab>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('custom_tabs')
      .insert([{ value, label }])
      .select()
      .single()
    if (error) throw error
    revalidatePath('/influencers')
    return { success: true, data }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function deleteCustomTab(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('custom_tabs').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/influencers')
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
