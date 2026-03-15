import { TabCategory } from '@/lib/types/database'

export interface InfluencerFilters {
  tab_category?: TabCategory
  classification?: string
  collaboration_type?: string
  category?: string
  gender?: string
  must_do?: boolean
  search?: string
}

export const TAB_PRESETS: { value: TabCategory | 'all'; label: string; filters: InfluencerFilters }[] = [
  { value: 'all', label: '전체', filters: {} },
  { value: 'reference', label: '참고', filters: { tab_category: 'reference' } },
  { value: 'listup', label: '리스트업', filters: { tab_category: 'listup' } },
  { value: 'mcn', label: 'MCN회사', filters: { tab_category: 'mcn' } },
  { value: 'must', label: '무조건', filters: { tab_category: 'must' } },
  { value: 'past', label: '과거', filters: { tab_category: 'past' } },
  { value: 'group_buy_brand', label: '공구 하는 브랜드', filters: { tab_category: 'group_buy_brand' } },
  { value: 'ad', label: '광고', filters: { tab_category: 'ad' } },
]
