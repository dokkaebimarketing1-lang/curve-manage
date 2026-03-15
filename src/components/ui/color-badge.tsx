import { cn } from '@/lib/utils'

interface ColorBadgeProps {
  value: string | null | undefined
  className?: string
}

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  ppl: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  PPL: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  group_buy: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  공구: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  sponsorship: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  협찬: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  ad: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  광고: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  seeding: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  씨딩: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  instagram: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  youtube: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  tiktok: { bg: 'bg-zinc-100', text: 'text-zinc-800', border: 'border-zinc-200' },
}

export function ColorBadge({ value, className }: ColorBadgeProps) {
  if (!value) return null
  
  const colors = colorMap[value] ?? { bg: 'bg-zinc-100', text: 'text-zinc-700', border: 'border-zinc-200' }
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide border',
        colors.bg,
        colors.text,
        colors.border,
        className
      )}
    >
      {value}
    </span>
  )
}
