export const CLASSIFICATION_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'blog', label: '블로그' },
  { value: 'etc', label: '기타' },
] as const

// Color maps for badge display
export const CLASSIFICATION_COLORS: Record<string, { bg: string; text: string }> = {
  instagram: { bg: 'bg-gradient-to-r from-purple-500 to-pink-500', text: 'text-white' },
  youtube: { bg: 'bg-red-500', text: 'text-white' },
  tiktok: { bg: 'bg-zinc-900', text: 'text-white' },
  blog: { bg: 'bg-green-500', text: 'text-white' },
  etc: { bg: 'bg-zinc-200', text: 'text-zinc-700' },
}

export const COLLABORATION_TYPES = [
  { value: 'ppl', label: 'PPL' },
  { value: 'group_buy', label: '공구' },
  { value: 'sponsorship', label: '협찬' },
  { value: 'ad', label: '광고' },
  { value: 'seeding', label: '씨딩' },
  { value: 'etc', label: '기타' },
] as const

export const COLLABORATION_COLORS: Record<string, { bg: string; text: string }> = {
  ppl: { bg: 'bg-blue-100', text: 'text-blue-700' },
  group_buy: { bg: 'bg-orange-100', text: 'text-orange-700' },
  sponsorship: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  ad: { bg: 'bg-purple-100', text: 'text-purple-700' },
  seeding: { bg: 'bg-amber-100', text: 'text-amber-700' },
  etc: { bg: 'bg-zinc-100', text: 'text-zinc-600' },
}

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

export const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  beauty: { bg: 'bg-pink-100', text: 'text-pink-700' },
  fashion: { bg: 'bg-violet-100', text: 'text-violet-700' },
  food: { bg: 'bg-orange-100', text: 'text-orange-700' },
  lifestyle: { bg: 'bg-sky-100', text: 'text-sky-700' },
  fitness: { bg: 'bg-lime-100', text: 'text-lime-700' },
  parenting: { bg: 'bg-rose-100', text: 'text-rose-700' },
  travel: { bg: 'bg-teal-100', text: 'text-teal-700' },
  etc: { bg: 'bg-zinc-100', text: 'text-zinc-600' },
}

export const GENDER_OPTIONS = [
  { value: 'female', label: '여성' },
  { value: 'male', label: '남성' },
  { value: 'etc', label: '기타' },
] as const

export const GENDER_COLORS: Record<string, { bg: string; text: string }> = {
  female: { bg: 'bg-pink-100', text: 'text-pink-700' },
  male: { bg: 'bg-blue-100', text: 'text-blue-700' },
  etc: { bg: 'bg-zinc-100', text: 'text-zinc-600' },
}

export const TAB_CATEGORIES: { value: string; label: string }[] = [
  { value: 'reference', label: '참고' },
  { value: 'listup', label: '리스트업' },
  { value: 'mcn', label: 'MCN회사' },
  { value: 'must', label: '무조건' },
  { value: 'past', label: '과거' },
  { value: 'group_buy_brand', label: '공구 하는 브랜드' },
  { value: 'ad', label: '광고' },
]
