import { describe, expect, it } from 'vitest'
import { parseInfluencerCSV } from '@/lib/csv/parser'

describe('parseInfluencerCSV', () => {
  it('parses Korean text, quoted commas, and empty values', () => {
    const csv = [
      'NO,닉네임,URL,선정 이유,연락처,팔로워/구독자수,무조건,단가',
      '1,홍길동,https://instagram.com/hong,"뷰티, 먹방",,10만,예,"150,000"',
      '2,김영희,https://youtube.com/@younghee,,,"1,234",false,',
    ].join('\n')

    const result = parseInfluencerCSV(csv)

    expect(result.total).toBe(2)
    expect(result.errors).toEqual([])
    expect(result.valid).toHaveLength(2)

    expect(result.valid[0]).toMatchObject({
      nickname: '홍길동',
      url: 'https://instagram.com/hong',
      selection_reason: '뷰티, 먹방',
      contact: null,
      follower_count: 100000,
      must_do: true,
      rate: 150000,
      tab_category: 'listup',
    })

    expect(result.valid[1]).toMatchObject({
      nickname: '김영희',
      url: 'https://youtube.com/@younghee',
      selection_reason: null,
      contact: null,
      follower_count: 1234,
      must_do: false,
      rate: null,
      tab_category: 'listup',
    })
  })

  it('records an error when both nickname and URL are empty', () => {
    const csv = ['NO,닉네임,URL,분류', '1,,,instagram'].join('\n')

    const result = parseInfluencerCSV(csv)

    expect(result.total).toBe(1)
    expect(result.valid).toHaveLength(0)
    expect(result.errors).toEqual([
      { row: 2, field: '닉네임/URL', message: '닉네임과 URL이 모두 비어있습니다' },
    ])
  })
})
