import { describe, expect, it } from 'vitest'
import {
  CATEGORIES,
  CATEGORY_COLORS,
  CLASSIFICATION_COLORS,
  CLASSIFICATION_OPTIONS,
  COLLABORATION_COLORS,
  COLLABORATION_TYPES,
  GENDER_COLORS,
  GENDER_OPTIONS,
  TAB_CATEGORIES,
} from '@/lib/design/constants'

function hasUniqueValues(options: ReadonlyArray<{ value: string }>): boolean {
  const values = options.map((option) => option.value)
  return new Set(values).size === values.length
}

describe('design constants', () => {
  it('keeps all option arrays value-unique', () => {
    expect(hasUniqueValues(CLASSIFICATION_OPTIONS)).toBe(true)
    expect(hasUniqueValues(COLLABORATION_TYPES)).toBe(true)
    expect(hasUniqueValues(CATEGORIES)).toBe(true)
    expect(hasUniqueValues(GENDER_OPTIONS)).toBe(true)
    expect(hasUniqueValues(TAB_CATEGORIES)).toBe(true)
  })

  it('provides color map coverage for all classification options', () => {
    for (const option of CLASSIFICATION_OPTIONS) {
      expect(CLASSIFICATION_COLORS[option.value]).toBeDefined()
    }
  })

  it('provides color map coverage for all collaboration options', () => {
    for (const option of COLLABORATION_TYPES) {
      expect(COLLABORATION_COLORS[option.value]).toBeDefined()
    }
  })

  it('provides color map coverage for all category and gender options', () => {
    for (const option of CATEGORIES) {
      expect(CATEGORY_COLORS[option.value]).toBeDefined()
    }

    for (const option of GENDER_OPTIONS) {
      expect(GENDER_COLORS[option.value]).toBeDefined()
    }
  })
})
