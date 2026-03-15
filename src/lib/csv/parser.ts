import Papa from 'papaparse'
import { InfluencerInsert } from '@/lib/types/database'

// 한국어 헤더 → 영어 필드명 매핑
const HEADER_MAP: Record<string, keyof InfluencerInsert | null> = {
  'NO': null, // 시리얼, 무시
  '닉네임': 'nickname',
  '프로필': 'profile_image_url',
  '조회수 높은 영상': 'high_view_video_url',
  '조회수 낮은 영상': 'low_view_video_url',
  'URL': 'url',
  '분류': 'classification',
  '협업 형태': 'collaboration_type',
  '카테고리': 'category',
  '팔로워/구독자수': 'follower_count',
  '팔로워': 'follower_count',
  '구독자수': 'follower_count',
  '성함': 'real_name',
  '성별': 'gender',
  '연락처': 'contact',
  '무조건': 'must_do',
  '선정 이유': 'selection_reason',
  '비고': 'notes',
  '메일': 'email',
  '단가': 'rate',
}

function normalizeFollowerCount(value: string): number | null {
  if (!value || value.trim() === '') return null
  const v = value.trim()
  // "10만" → 100000
  if (v.endsWith('만')) {
    return Math.round(parseFloat(v) * 10000)
  }
  // "100K" or "100k"
  if (v.toLowerCase().endsWith('k')) {
    return Math.round(parseFloat(v) * 1000)
  }
  // "1M"
  if (v.toLowerCase().endsWith('m')) {
    return Math.round(parseFloat(v) * 1000000)
  }
  // Remove commas and parse
  const num = parseFloat(v.replace(/,/g, ''))
  return isNaN(num) ? null : Math.round(num)
}

function normalizeMustDo(value: string): boolean {
  if (!value) return false
  const v = value.trim().toLowerCase()
  return ['o', 'ㅇ', '예', 'yes', 'true', '1', 'y'].includes(v)
}

export interface ParseResult {
  valid: Partial<InfluencerInsert>[]
  errors: { row: number; field: string; message: string }[]
  total: number
}

export function parseInfluencerCSV(csvText: string): ParseResult {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  })

  const valid: Partial<InfluencerInsert>[] = []
  const errors: { row: number; field: string; message: string }[] = []

  for (let i = 0; i < result.data.length; i++) {
    const row = result.data[i]
    const rowNum = i + 2 // 1-indexed + header row
    const mapped: Partial<InfluencerInsert> = {
      tab_category: 'listup',
      must_do: false,
    }

    for (const [header, value] of Object.entries(row)) {
      const field = HEADER_MAP[header]
      if (field === null) continue // Skip (e.g. NO)
      if (!field) {
        // Unknown header — skip silently
        continue
      }

      if (field === 'follower_count') {
        mapped.follower_count = normalizeFollowerCount(String(value))
      } else if (field === 'must_do') {
        mapped.must_do = normalizeMustDo(String(value))
      } else if (field === 'rate') {
        const num = parseInt(String(value).replace(/,/g, ''))
        mapped.rate = isNaN(num) ? null : num
      } else {
        ;(mapped as Record<string, unknown>)[field] = value?.trim() || null
      }
    }

    if (!mapped.nickname && !mapped.url) {
      errors.push({ row: rowNum, field: '닉네임/URL', message: '닉네임과 URL이 모두 비어있습니다' })
    } else {
      valid.push(mapped)
    }
  }

  return { valid, errors, total: result.data.length }
}
