// ============================================================
// 광고/인플루언서 웹 관리 도구 — 데이터베이스 타입 정의
// ============================================================

export type TabCategory =
  | 'reference'        // 참고
  | 'listup'           // 리스트업 (기본값)
  | 'mcn'              // MCN회사
  | 'must'             // 무조건
  | 'past'             // 과거
  | 'group_buy_brand'  // 공구 하는 브랜드
  | 'ad'               // 광고

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

export interface InfluencerInsert
  extends Omit<Influencer, 'id' | 'no' | 'created_at' | 'updated_at'> {}

export interface InfluencerUpdate extends Partial<InfluencerInsert> {}

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

export interface FolderInsert extends Omit<Folder, 'id' | 'created_at'> {}
export interface FolderUpdate extends Partial<FolderInsert> {}

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

export interface AdCardInsert extends Omit<AdCard, 'id' | 'created_at' | 'updated_at'> {}
export interface AdCardUpdate extends Partial<AdCardInsert> {}

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

export interface AdReferenceInsert
  extends Omit<AdReference, 'id' | 'no' | 'created_at' | 'updated_at'> {}

export interface AdReferenceUpdate extends Partial<AdReferenceInsert> {}

// ──────────────────────────────────────────
// Action Result Wrapper
// ──────────────────────────────────────────
export interface ActionResult<T = undefined> {
  success: boolean
  data?: T
  error?: string
}
