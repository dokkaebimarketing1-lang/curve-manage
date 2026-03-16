'use client'

import { useState, useRef, useEffect } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Influencer, InfluencerUpdate } from '@/lib/types/database'
import { ImageCell } from '@/components/ui/image-cell'
import { ExternalLink, Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { crawlAndUpdateInfluencer, deleteInfluencer, updateInfluencerField } from '@/lib/actions/influencer'
import { uploadInfluencerImage } from '@/lib/actions/upload'
import { 
  CLASSIFICATION_OPTIONS, 
  COLLABORATION_TYPES, 
  CATEGORIES, 
  GENDER_OPTIONS,
  CLASSIFICATION_COLORS,
  COLLABORATION_COLORS,
  CATEGORY_COLORS,
  GENDER_COLORS
} from '@/lib/design/constants'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type InfluencerField = keyof InfluencerUpdate

// 공통 저장 래퍼 — 에러 시 toast
async function saveField(id: string, field: InfluencerField, value: unknown) {
  const result = await updateInfluencerField(id, field, value)
  if (!result.success) toast.error('저장 실패')
}
type ImageField = 'profile_image_url' | 'high_view_video_thumbnail' | 'low_view_video_thumbnail'

function UploadableImageCell({ id, field, src, alt, width, height }: { id: string; field: ImageField; src: string | null; alt: string; width: number; height: number }) {
  const router = useRouter()

  const handleUpload = async (base64: string, fileName: string) => {
    const result = await uploadInfluencerImage(id, field, base64, fileName)
    if (result.success) toast.success('업로드 완료')
    else toast.error('업로드 실패')
    router.refresh()
  }

  const isAutoFilled = src?.startsWith('http')

  return (
    <div className="relative inline-block">
      <ImageCell src={src} alt={alt} width={width} height={height} onUpload={handleUpload} />
      {isAutoFilled && (
        <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-400 border border-white shadow-sm" title="자동 크롤링됨" />
      )}
    </div>
  )
}

function EditableTextCell({
  id,
  field,
  value,
  placeholder,
  className,
}: {
  id: string
  field: InfluencerField
  value: string | null
  placeholder?: string
  className?: string
}) {
  const [text, setText] = useState(value || '')
  const [saved, setSaved] = useState(value || '')

  const handleSave = async () => {
    const trimmed = text.trim()
    if (trimmed === saved) return
    setSaved(trimmed)
    await saveField(id, field, trimmed || null)
  }

  return (
    <input
      type="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={handleSave}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      placeholder={placeholder || '-'}
      className={`w-full bg-transparent text-sm outline-none border-b border-transparent focus:border-zinc-300 transition-colors py-0.5 placeholder:text-zinc-300 ${className || ''}`}
    />
  )
}

function EditableNumberCell({
  id,
  field,
  value,
  placeholder,
}: {
  id: string
  field: InfluencerField
  value: number | null
  placeholder?: string
}) {
  const [text, setText] = useState(value?.toString() || '')
  const [saved, setSaved] = useState(value?.toString() || '')

  const handleSave = async () => {
    const trimmed = text.trim()
    if (trimmed === saved) return
    setSaved(trimmed)

    if (!trimmed) {
      await saveField(id, field, null)
      return
    }

    const parsed = Number(trimmed)
    if (Number.isNaN(parsed)) {
      setText(saved)
      return
    }

    await saveField(id, field, parsed)
  }

  return (
    <input
      type="number"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={handleSave}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      placeholder={placeholder || '-'}
      className="w-full bg-transparent text-sm text-right outline-none border-b border-transparent focus:border-zinc-300 transition-colors py-0.5 placeholder:text-zinc-300"
    />
  )
}

function ColorBadgeSelectCell({
  id,
  field,
  value,
  options,
  colorMap,
}: {
  id: string
  field: InfluencerField
  value: string | null
  options: readonly { value: string; label: string }[]
  colorMap: Record<string, { bg: string; text: string }>
}) {
  const [selected, setSelected] = useState(value || '')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleSelect = async (val: string) => {
    setSelected(val)
    setOpen(false)
    await saveField(id, field, val || null)
  }

  const colors = colorMap[selected] || { bg: 'bg-zinc-100', text: 'text-zinc-400' }
  const label = options.find(o => o.value === selected)?.label || '-'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all ${selected ? colors.bg + ' ' + colors.text : 'bg-zinc-50 text-zinc-300 border border-dashed border-zinc-200'} hover:opacity-80 cursor-pointer`}
      >
        {selected ? label : '선택'}
        <svg aria-hidden="true" className="h-3 w-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 p-1.5 bg-white rounded-lg shadow-lg border border-zinc-200 min-w-[140px] animate-in fade-in-0 zoom-in-95 duration-100">
          <button
            type="button"
            onClick={() => handleSelect('')}
            className="w-full text-left px-2.5 py-1 text-xs text-zinc-400 hover:bg-zinc-50 rounded"
          >
            선택 해제
          </button>
          {options.map((option) => {
            const c = colorMap[option.value] || { bg: 'bg-zinc-100', text: 'text-zinc-600' }
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left px-2.5 py-1.5 text-xs font-medium rounded my-0.5 transition-all ${c.bg} ${c.text} ${selected === option.value ? 'ring-2 ring-offset-1 ring-zinc-300' : 'hover:opacity-80'}`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function EditableSelectCell({
  id,
  field,
  value,
  options,
}: {
  id: string
  field: InfluencerField
  value: string | null
  options: readonly { value: string; label: string }[]
}) {
  const [selected, setSelected] = useState(value || '')

  const handleChange = async (nextValue: string) => {
    setSelected(nextValue)
    await saveField(id, field, nextValue || null)
  }

  return (
    <select
      value={selected}
      onChange={(e) => void handleChange(e.target.value)}
      className={`w-full bg-transparent text-sm outline-none border border-transparent focus:border-zinc-300 rounded px-1 py-0.5 transition-colors cursor-pointer ${!selected ? 'text-zinc-300' : ''}`}
    >
      <option value="">-</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

function EditableMustDoCell({ id, value }: { id: string; value: boolean }) {
  const [mustDo, setMustDo] = useState(value)

  const toggle = async () => {
    const next = !mustDo
    setMustDo(next)
    await saveField(id, 'must_do', next)
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      className="mx-auto flex h-6 w-6 items-center justify-center rounded border border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 transition-colors"
      aria-label="무조건 토글"
    >
      {mustDo ? <Check className="text-green-500" size={14} /> : null}
    </button>
  )
}

function ActionsCell({ id }: { id: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm('삭제하시겠습니까?')) return

    setDeleting(true)
    try {
      const result = await deleteInfluencer(id)
      if (result.success) toast.success('삭제 완료')
      else toast.error('삭제 실패')
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
      onClick={() => void handleDelete()}
      disabled={deleting}
    >
      <Trash2 size={16} />
    </Button>
  )
}

function EditableUrlCell({ id, value }: { id: string; value: string | null }) {
  const [url, setUrl] = useState(value || '')
  const [saved, setSaved] = useState(value || '')
  const [crawling, setCrawling] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    const trimmed = url.trim()
    if (trimmed === saved) return
    setSaved(trimmed)
    if (!trimmed) return

    setCrawling(true)
    try {
      const result = await crawlAndUpdateInfluencer(id, trimmed)
      if (result.success) toast.success('크롤링 완료')
      else toast.error('크롤링 실패 — 이미지를 수동 업로드해주세요')
      router.refresh()
    } finally {
      setCrawling(false)
    }
  }

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        placeholder="URL 입력"
        className="flex-1 min-w-0 bg-transparent text-sm truncate outline-none border-b border-transparent focus:border-zinc-300 transition-colors py-0.5 placeholder:text-zinc-300"
        disabled={crawling}
      />
      {crawling ? (
        <Loader2 size={14} className="shrink-0 text-zinc-400 animate-spin" />
      ) : saved ? (
        <a href={saved} target="_blank" rel="noopener noreferrer" className="shrink-0 text-zinc-400 hover:text-blue-500 transition-colors">
          <ExternalLink size={14} />
        </a>
      ) : null}
    </div>
  )
}

export const columns: ColumnDef<Influencer>[] = [
  {
    accessorKey: 'no',
    header: 'NO',
    size: 40,
  },
  {
    accessorKey: 'nickname',
    header: '닉네임',
    size: 90,
    cell: ({ row }) => {
      return (
        <EditableTextCell
          id={row.original.id}
          field="nickname"
          value={row.getValue('nickname')}
          placeholder="닉네임"
          className="font-medium"
        />
      )
    },
  },
  {
    accessorKey: 'profile_image_url',
    header: '프로필',
    size: 40,
    cell: ({ row }) => {
      return (
        <UploadableImageCell
          id={row.original.id}
          field="profile_image_url"
          src={row.getValue('profile_image_url')}
          alt="프로필"
          width={28}
          height={28}
        />
      )
    },
  },
  {
    accessorKey: 'high_view_video_thumbnail',
    header: '조회수 높은 영상',
    size: 52,
    cell: ({ row }) => {
      return (
        <UploadableImageCell
          id={row.original.id}
          field="high_view_video_thumbnail"
          src={row.getValue('high_view_video_thumbnail')}
          alt="인기 영상"
          width={40}
          height={28}
        />
      )
    },
  },
  {
    accessorKey: 'low_view_video_thumbnail',
    header: '조회수 낮은 영상',
    size: 52,
    cell: ({ row }) => {
      return (
        <UploadableImageCell
          id={row.original.id}
          field="low_view_video_thumbnail"
          src={row.getValue('low_view_video_thumbnail')}
          alt="비인기 영상"
          width={40}
          height={28}
        />
      )
    },
  },
  {
    accessorKey: 'url',
    header: 'URL',
    size: 180,
    cell: ({ row }) => {
      return <EditableUrlCell id={row.original.id} value={row.getValue('url')} />
    },
  },
  {
    accessorKey: 'classification',
    header: '분류',
    size: 70,
    cell: ({ row }) => {
      return (
        <ColorBadgeSelectCell
          id={row.original.id}
          field="classification"
          value={row.getValue('classification')}
          options={CLASSIFICATION_OPTIONS}
          colorMap={CLASSIFICATION_COLORS}
        />
      )
    },
  },
  {
    accessorKey: 'collaboration_type',
    header: '협업 형태',
    size: 70,
    cell: ({ row }) => {
      return (
        <ColorBadgeSelectCell
          id={row.original.id}
          field="collaboration_type"
          value={row.getValue('collaboration_type')}
          options={COLLABORATION_TYPES}
          colorMap={COLLABORATION_COLORS}
        />
      )
    },
  },
  {
    accessorKey: 'category',
    header: '카테고리',
    size: 80,
    cell: ({ row }) => {
      return (
        <ColorBadgeSelectCell
          id={row.original.id}
          field="category"
          value={row.getValue('category')}
          options={CATEGORIES}
          colorMap={CATEGORY_COLORS}
        />
      )
    },
  },
  {
    accessorKey: 'follower_count',
    header: '팔로워/구독자수',
    size: 70,
    cell: ({ row }) => {
      const isAutoFilled = row.original.url && row.getValue('follower_count') !== null
      return (
        <div className={`relative ${isAutoFilled ? 'pl-1.5 border-l-2 border-green-300' : ''}`} title={isAutoFilled ? '자동 크롤링됨' : undefined}>
          <EditableNumberCell
            id={row.original.id}
            field="follower_count"
            value={row.getValue('follower_count')}
          />
        </div>
      )
    },
  },
  {
    accessorKey: 'real_name',
    header: '성함',
    size: 60,
    cell: ({ row }) => {
      return (
        <EditableTextCell
          id={row.original.id}
          field="real_name"
          value={row.getValue('real_name')}
          placeholder="성함"
        />
      )
    },
  },
  {
    accessorKey: 'gender',
    header: '성별',
    size: 50,
    cell: ({ row }) => {
      return (
        <ColorBadgeSelectCell
          id={row.original.id}
          field="gender"
          value={row.getValue('gender')}
          options={GENDER_OPTIONS}
          colorMap={GENDER_COLORS}
        />
      )
    },
  },
  {
    accessorKey: 'contact',
    header: '연락처',
    size: 100,
    cell: ({ row }) => {
      return (
        <EditableTextCell
          id={row.original.id}
          field="contact"
          value={row.getValue('contact')}
          placeholder="연락처"
        />
      )
    },
  },
  {
    accessorKey: 'must_do',
    header: '무조건',
    size: 45,
    cell: ({ row }) => {
      return <EditableMustDoCell id={row.original.id} value={row.getValue('must_do')} />
    },
  },
  {
    accessorKey: 'selection_reason',
    header: '선정 이유 (코멘트)',
    size: 120,
    cell: ({ row }) => {
      return (
        <EditableTextCell
          id={row.original.id}
          field="selection_reason"
          value={row.getValue('selection_reason')}
          placeholder="선정이유"
          className="min-w-[200px]"
        />
      )
    },
  },
  {
    accessorKey: 'notes',
    header: '비고',
    size: 120,
    cell: ({ row }) => {
      return (
        <EditableTextCell
          id={row.original.id}
          field="notes"
          value={row.getValue('notes')}
          placeholder="비고"
          className="min-w-[200px]"
        />
      )
    },
  },
  {
    accessorKey: 'email',
    header: '메일',
    size: 120,
    cell: ({ row }) => {
      return (
        <EditableTextCell
          id={row.original.id}
          field="email"
          value={row.getValue('email')}
          placeholder="메일"
        />
      )
    },
  },
  {
    accessorKey: 'rate',
    header: '단가',
    size: 80,
    cell: ({ row }) => {
      const rate = row.getValue('rate') as number | null
      return (
        <div className="space-y-0.5">
          <EditableNumberCell
            id={row.original.id}
            field="rate"
            value={rate}
            placeholder="0"
          />
          <div className="text-[11px] text-right text-zinc-400">{rate === null ? '-' : `₩ ${new Intl.NumberFormat('ko-KR').format(rate)}`}</div>
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: '관리',
    size: 45,
    cell: ({ row }) => {
      return <ActionsCell id={row.original.id} />
    },
  },
]
