// ============================================================
// 광고/인플루언서 웹 관리 도구 — 데이터베이스 타입 정의
// ============================================================

// DB 컬럼이 TEXT 이므로 사용자 정의 탭도 허용
export type TabCategory = string

// ──────────────────────────────────────────
// Influencer
// ──────────────────────────────────────────
export interface Influencer {
  id: string
  no: number
  nickname: string | null
  profile_image_url: string | null
  high_view_video_url: string | null
  high_view_video_thumbnail: string | null
  low_view_video_url: string | null
  low_view_video_thumbnail: string | null
  url: string | null
  classification: string | null
  collaboration_type: string | null
  category: string | null
  follower_count: number | null
  real_name: string | null
  gender: string | null
  contact: string | null
  must_do: boolean
  selection_reason: string | null
  notes: string | null
  email: string | null
  rate: number | null
  tab_category: TabCategory
  created_at: string
  updated_at: string
}

export type InfluencerInsert = Omit<Influencer, 'id' | 'no' | 'created_at' | 'updated_at'>

export type InfluencerUpdate = Partial<InfluencerInsert>

// ──────────────────────────────────────────
// CustomTab
// ──────────────────────────────────────────
export interface CustomTab {
  id: string
  value: string
  label: string
  sort_order: number
  created_at: string
}

// ──────────────────────────────────────────
// Folder
// ──────────────────────────────────────────
export interface Folder {
  id: string
  name: string
  parent_id: string | null
  sort_order: number
  created_at: string
}

export type FolderInsert = Omit<Folder, 'id' | 'created_at'>
export type FolderUpdate = Partial<FolderInsert>

// ──────────────────────────────────────────
// AdCard
// ──────────────────────────────────────────
export interface AdCard {
  id: string
  folder_id: string | null
  url: string | null
  thumbnail_url: string | null
  title: string | null
  one_line_review: string | null
  reference_brand: string | null
  source_handle: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export type AdCardInsert = Omit<AdCard, 'id' | 'created_at' | 'updated_at'>
export type AdCardUpdate = Partial<AdCardInsert>

// ──────────────────────────────────────────
// AdReference
// ──────────────────────────────────────────
export interface AdReference {
  id: string
  no: number
  created_date: string | null
  format: string | null
  reference_brand: string | null
  thumbnail_url: string | null
  ad_id: string | null
  page_name: string | null
  ad_type: string | null
  content: string | null
  ad_url: string | null
  video_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type AdReferenceInsert = Omit<AdReference, 'id' | 'no' | 'created_at' | 'updated_at'>

export type AdReferenceUpdate = Partial<AdReferenceInsert>

// ──────────────────────────────────────────
// Action Result Wrapper
// ──────────────────────────────────────────
export interface ActionResult<T = undefined> {
  success: boolean
  data?: T
  error?: string
}
