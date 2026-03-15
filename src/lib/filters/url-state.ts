import { InfluencerFilters } from './influencer-filters'
import { TabCategory } from '@/lib/types/database'

const VALID_TAB_CATEGORIES = new Set<string>([
  'reference', 'listup', 'mcn', 'must', 'past', 'group_buy_brand', 'ad'
])

export function filtersToSearchParams(filters: InfluencerFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.tab_category) params.set('tab', filters.tab_category)
  if (filters.classification) params.set('classification', filters.classification)
  if (filters.collaboration_type) params.set('collab', filters.collaboration_type)
  if (filters.category) params.set('category', filters.category)
  if (filters.gender) params.set('gender', filters.gender)
  if (filters.must_do !== undefined) params.set('must_do', String(filters.must_do))
  if (filters.search) params.set('search', filters.search)
  return params
}

export function searchParamsToFilters(
  searchParams: Record<string, string | string[] | undefined>
): InfluencerFilters {
  const getValue = (key: string) => {
    const val = searchParams[key]
    return Array.isArray(val) ? val[0] : val
  }

  const filters: InfluencerFilters = {}

  const tab = getValue('tab')
  if (tab && VALID_TAB_CATEGORIES.has(tab)) {
    filters.tab_category = tab as TabCategory
  }

  const classification = getValue('classification')
  if (classification) filters.classification = classification

  const collab = getValue('collab')
  if (collab) filters.collaboration_type = collab

  const category = getValue('category')
  if (category) filters.category = category

  const gender = getValue('gender')
  if (gender) filters.gender = gender

  const must_do = getValue('must_do')
  if (must_do === 'true') filters.must_do = true
  else if (must_do === 'false') filters.must_do = false

  const search = getValue('search')
  if (search) filters.search = search

  return filters
}
