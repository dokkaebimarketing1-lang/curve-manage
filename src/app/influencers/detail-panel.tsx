'use client'

import { Influencer } from '@/lib/types/database'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ExternalLink } from 'lucide-react'

interface DetailPanelProps {
  influencer: Influencer | null
  open: boolean
  onClose: () => void
}

const fieldLabels: { key: keyof Influencer; label: string }[] = [
  { key: 'nickname', label: '닉네임' },
  { key: 'url', label: 'URL' },
  { key: 'classification', label: '분류' },
  { key: 'collaboration_type', label: '협업형태' },
  { key: 'category', label: '카테고리' },
  { key: 'follower_count', label: '팔로워수' },
  { key: 'real_name', label: '성함' },
  { key: 'gender', label: '성별' },
  { key: 'contact', label: '연락처' },
  { key: 'email', label: '메일' },
  { key: 'rate', label: '단가' },
  { key: 'must_do', label: '무조건' },
  { key: 'tab_category', label: '탭 카테고리' },
  { key: 'selection_reason', label: '선정이유' },
  { key: 'notes', label: '비고' },
]

export function DetailPanel({ influencer, open, onClose }: DetailPanelProps) {
  if (!influencer) return null

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[400px] sm:w-[480px] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-lg">{influencer.nickname || '(이름 없음)'}</SheetTitle>
        </SheetHeader>

        {/* 이미지 섹션 */}
        <div className="flex gap-3 mb-6">
          {influencer.profile_image_url && (
            <div className="flex flex-col items-center gap-1">
              <img src={influencer.profile_image_url} alt="프로필" referrerPolicy="no-referrer" className="w-16 h-16 rounded-lg object-cover border" />
              <span className="text-[10px] text-zinc-400">프로필</span>
            </div>
          )}
          {influencer.high_view_video_thumbnail && (
            <div className="flex flex-col items-center gap-1">
              <img src={influencer.high_view_video_thumbnail} alt="인기영상" referrerPolicy="no-referrer" className="w-20 h-16 rounded-lg object-cover border" />
              <span className="text-[10px] text-zinc-400">인기 영상</span>
            </div>
          )}
          {influencer.low_view_video_thumbnail && (
            <div className="flex flex-col items-center gap-1">
              <img src={influencer.low_view_video_thumbnail} alt="비인기영상" referrerPolicy="no-referrer" className="w-20 h-16 rounded-lg object-cover border" />
              <span className="text-[10px] text-zinc-400">비인기 영상</span>
            </div>
          )}
        </div>

        {/* 필드 목록 */}
        <div className="space-y-3">
          {fieldLabels.map(({ key, label }) => {
            const value = influencer[key]
            const display = value === null || value === undefined || value === ''
              ? '-'
              : typeof value === 'boolean'
              ? (value ? '✓' : '-')
              : String(value)

            const isUrl = key === 'url' && typeof value === 'string' && value.startsWith('http')
            const isLongText = key === 'selection_reason' || key === 'notes'

            return (
              <div key={key} className="flex flex-col gap-0.5">
                <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
                {isUrl ? (
                  <a href={value as string} target="_blank" rel="noopener noreferrer" className="text-[13px] text-blue-600 hover:underline flex items-center gap-1 break-all">
                    {value as string}
                    <ExternalLink size={12} />
                  </a>
                ) : isLongText ? (
                  <p className="text-[13px] text-foreground whitespace-pre-wrap leading-relaxed">{display}</p>
                ) : (
                  <span className="text-[13px] text-foreground">{display}</span>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-4 border-t text-[11px] text-zinc-400">
          생성: {new Date(influencer.created_at).toLocaleDateString('ko-KR')} · 수정: {new Date(influencer.updated_at).toLocaleDateString('ko-KR')}
        </div>
      </SheetContent>
    </Sheet>
  )
}
