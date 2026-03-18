import { describe, expect, it } from 'vitest'
import { searchParamsToFilters } from '@/lib/filters/url-state'

describe('searchParamsToFilters', () => {
  it('returns empty filters for empty params', () => {
    expect(searchParamsToFilters({})).toEqual({})
  })

  it('maps a single filter', () => {
    expect(searchParamsToFilters({ classification: 'instagram' })).toEqual({
      classification: 'instagram',
    })
  })

  it('maps multiple filters including boolean and array values', () => {
    expect(
      searchParamsToFilters({
        classification: 'youtube',
        collab: 'ppl',
        category: 'beauty',
        gender: 'female',
        must_do: 'true',
        search: ['홍길동', 'ignored'],
      })
    ).toEqual({
      classification: 'youtube',
      collaboration_type: 'ppl',
      category: 'beauty',
      gender: 'female',
      must_do: true,
      search: '홍길동',
    })
  })

  it('maps tab filter when tab is non-empty and trimmed', () => {
    expect(searchParamsToFilters({ tab: ' listup ' })).toEqual({
      tab_category: ' listup ',
    })

    expect(searchParamsToFilters({ tab: '   ' })).toEqual({})
  })
})
