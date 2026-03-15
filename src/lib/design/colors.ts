export const TAG_COLORS = {
  선호: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  검토중: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  PPL확정: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  진행중: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  완료: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  거절: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  협찬: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  공구: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
  광고: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  기타: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
} as const

export type TagColorKey = keyof typeof TAG_COLORS
