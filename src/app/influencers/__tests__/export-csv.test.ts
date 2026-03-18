import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { Influencer } from '@/lib/types/database'

const csvHeaders = ['NO', '닉네임', 'URL', '분류', '협업형태', '카테고리', '팔로워수', '성함', '성별', '연락처', '무조건', '선정이유', '비고', '메일', '단가']
const csvKeys: (keyof Influencer)[] = ['no', 'nickname', 'url', 'classification', 'collaboration_type', 'category', 'follower_count', 'real_name', 'gender', 'contact', 'must_do', 'selection_reason', 'notes', 'email', 'rate']

function formatCsvRow(row: Influencer): string {
  return csvKeys
    .map((key) => {
      const value = row[key]
      const str = value === null || value === undefined ? '' : String(value)
      return `"${str.replace(/"/g, '""')}"`
    })
    .join(',')
}

describe('influencer CSV export formatting', () => {
  it('keeps header and key lengths aligned', () => {
    expect(csvHeaders).toHaveLength(csvKeys.length)
  })

  it('formats a row with comma, quote, and empty values correctly', () => {
    const row: Influencer = {
      id: 'id-1',
      no: 7,
      nickname: '홍길동',
      profile_image_url: null,
      high_view_video_url: null,
      high_view_video_thumbnail: null,
      low_view_video_url: null,
      low_view_video_thumbnail: null,
      url: 'https://example.com/channel?x=1,y=2',
      classification: 'instagram',
      collaboration_type: 'ppl',
      category: 'beauty',
      follower_count: 1234,
      real_name: '길동 "Gildong"',
      gender: 'male',
      contact: null,
      must_do: true,
      selection_reason: '뷰티, 먹방',
      notes: null,
      email: 'user@example.com',
      rate: null,
      tab_category: 'listup',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    }

    expect(formatCsvRow(row)).toBe(
      '"7","홍길동","https://example.com/channel?x=1,y=2","instagram","ppl","beauty","1234","길동 ""Gildong""","male","","true","뷰티, 먹방","","user@example.com",""'
    )
  })

  it('keeps source export logic using double-quote escaping', () => {
    const sourcePath = path.resolve(process.cwd(), 'src/app/influencers/influencer-table.tsx')
    const source = readFileSync(sourcePath, 'utf-8')

    expect(source).toContain("str.replace(/\"/g, '\"\"')")
    expect(source).toContain("headers.join(',')")
    expect(source).toContain("rows.map(row => keys.map(k =>")
  })
})
