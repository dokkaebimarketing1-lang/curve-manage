'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { ExternalLink, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { deleteAdReference, updateAdReferenceField } from '@/lib/actions/ad-reference'
import { AdReference, AdReferenceUpdate } from '@/lib/types/database'

type AdReferenceField = keyof AdReferenceUpdate

async function saveField(id: string, field: AdReferenceField, value: unknown) {
  const result = await updateAdReferenceField(id, field, value)
  if (!result.success) toast.error('저장 실패')
}

function EditableTextCell({
  id,
  field,
  value,
  placeholder,
  className,
}: {
  id: string
  field: AdReferenceField
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

function EditableDateCell({
  id,
  field,
  value,
}: {
  id: string
  field: AdReferenceField
  value: string | null
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
      type="date"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={handleSave}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      className="w-full bg-transparent text-sm outline-none border-b border-transparent focus:border-zinc-300 transition-colors py-0.5"
    />
  )
}

function EditableUrlDisplayCell({
  id,
  field,
  value,
}: {
  id: string
  field: AdReferenceField
  value: string | null
}) {
  const [url, setUrl] = useState(value || '')
  const [saved, setSaved] = useState(value || '')

  const handleSave = async () => {
    const trimmed = url.trim()
    if (trimmed === saved) return
    setSaved(trimmed)
    await saveField(id, field, trimmed || null)
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
      />
      {saved ? (
        <a href={saved} target="_blank" rel="noopener noreferrer" className="shrink-0 text-zinc-400 hover:text-blue-500 transition-colors">
          <ExternalLink size={14} />
        </a>
      ) : null}
    </div>
  )
}

function ThumbnailCell({ value }: { value: string | null }) {
  if (!value) {
    return <div className="h-[28px] w-[40px] rounded-sm bg-zinc-100" />
  }

  return (
    <img
      src={value}
      width={40}
      height={28}
      alt="썸네일"
      referrerPolicy="no-referrer"
      className="h-[28px] w-[40px] rounded-sm object-cover"
    />
  )
}

function ActionsCell({ id }: { id: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm('삭제하시겠습니까?')) return

    setDeleting(true)
    try {
      const result = await deleteAdReference(id)
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

export const columns: ColumnDef<AdReference>[] = [
  {
    accessorKey: 'no',
    header: 'NO',
    size: 40,
  },
  {
    accessorKey: 'created_date',
    header: '작성일',
    size: 90,
    cell: ({ row }) => {
      return (
        <EditableDateCell
          id={row.original.id}
          field="created_date"
          value={row.getValue('created_date')}
        />
      )
    },
  },
  {
    accessorKey: 'format',
    header: '형태',
    size: 70,
    cell: ({ row }) => {
      return (
        <EditableTextCell
          id={row.original.id}
          field="format"
          value={row.getValue('format')}
          placeholder="형태"
        />
      )
    },
  },
  {
    accessorKey: 'reference_brand',
    header: '참고 브랜드',
    size: 100,
    cell: ({ row }) => {
      return (
        <EditableTextCell
          id={row.original.id}
          field="reference_brand"
          value={row.getValue('reference_brand')}
          placeholder="참고 브랜드"
        />
      )
    },
  },
  {
    accessorKey: 'thumbnail_url',
    header: '썸네일',
    size: 60,
    cell: ({ row }) => {
      return <ThumbnailCell value={row.getValue('thumbnail_url')} />
    },
  },
  {
    accessorKey: 'ad_id',
    header: '광고ID',
    size: 130,
    cell: ({ row }) => {
      return (
        <EditableTextCell
          id={row.original.id}
          field="ad_id"
          value={row.getValue('ad_id')}
          placeholder="광고ID"
        />
      )
    },
  },
  {
    accessorKey: 'page_name',
    header: '페이지명',
    size: 90,
    cell: ({ row }) => {
      return (
        <EditableTextCell
          id={row.original.id}
          field="page_name"
          value={row.getValue('page_name')}
          placeholder="페이지명"
        />
      )
    },
  },
  {
    accessorKey: 'ad_type',
    header: '유형',
    size: 70,
    cell: ({ row }) => {
      return (
        <EditableTextCell
          id={row.original.id}
          field="ad_type"
          value={row.getValue('ad_type')}
          placeholder="유형"
        />
      )
    },
  },
  {
    accessorKey: 'content',
    header: '내용',
    size: 150,
    cell: ({ row }) => {
      return (
        <EditableTextCell
          id={row.original.id}
          field="content"
          value={row.getValue('content')}
          placeholder="내용"
        />
      )
    },
  },
  {
    accessorKey: 'ad_url',
    header: '광고 url',
    size: 180,
    cell: ({ row }) => {
      return (
        <EditableUrlDisplayCell
          id={row.original.id}
          field="ad_url"
          value={row.getValue('ad_url')}
        />
      )
    },
  },
  {
    accessorKey: 'video_url',
    header: '영상 url',
    size: 180,
    cell: ({ row }) => {
      return (
        <EditableUrlDisplayCell
          id={row.original.id}
          field="video_url"
          value={row.getValue('video_url')}
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
        />
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
