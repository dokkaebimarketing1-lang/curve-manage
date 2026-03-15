export const CLASSIFICATION_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'blog', label: '블로그' },
  { value: 'etc', label: '기타' },
] as const

export const COLLABORATION_TYPES = [
  { value: 'ppl', label: 'PPL' },
  { value: 'group_buy', label: '공구' },
  { value: 'sponsorship', label: '협찬' },
  { value: 'ad', label: '광고' },
  { value: 'seeding', label: '씨딩' },
  { value: 'etc', label: '기타' },
] as const

export const CATEGORIES = [
  { value: 'beauty', label: '뷰티' },
  { value: 'fashion', label: '패션' },
  { value: 'food', label: '음식/요리' },
  { value: 'lifestyle', label: '라이프스타일' },
  { value: 'fitness', label: '운동/헬스' },
  { value: 'parenting', label: '육아' },
  { value: 'travel', label: '여행' },
  { value: 'etc', label: '기타' },
] as const

export const GENDER_OPTIONS = [
  { value: 'female', label: '여성' },
  { value: 'male', label: '남성' },
  { value: 'etc', label: '기타' },
] as const

export const TAB_CATEGORIES: { value: string; label: string }[] = [
  { value: 'reference', label: '참고' },
  { value: 'listup', label: '리스트업' },
  { value: 'mcn', label: 'MCN회사' },
  { value: 'must', label: '무조건' },
  { value: 'past', label: '과거' },
  { value: 'group_buy_brand', label: '공구 하는 브랜드' },
  { value: 'ad', label: '광고' },
]
