'use server'

import { createClient } from '@/lib/supabase/server'
import { ActionResult, TabCategory } from '@/lib/types/database'
import { revalidatePath } from 'next/cache'

export async function bulkCreateInfluencers(
  rows: Record<string, unknown>[],
  tabCategory: TabCategory
): Promise<ActionResult<{ created: number; errors: number }>> {
  if (rows.length === 0) {
    return { success: true, data: { created: 0, errors: 0 } }
  }

  try {
    const supabase = await createClient()
    const payload = rows.map((row) => ({
      ...row,
      tab_category: tabCategory,
      must_do: typeof row.must_do === 'boolean' ? row.must_do : false,
    }))

    const { error } = await supabase.from('influencers').insert(payload)

    if (!error) {
      revalidatePath('/influencers')
      revalidatePath('/import')
      return { success: true, data: { created: payload.length, errors: 0 } }
    }

    let created = 0
    let errors = 0

    for (const row of payload) {
      const { error: rowError } = await supabase.from('influencers').insert(row)
      if (rowError) {
        errors += 1
      } else {
        created += 1
      }
    }

    revalidatePath('/influencers')
    revalidatePath('/import')

    return {
      success: true,
      data: { created, errors },
      error: errors > 0 ? error.message : undefined,
    }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
