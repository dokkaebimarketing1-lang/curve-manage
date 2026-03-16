'use client'

import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, Download, Megaphone, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createAdReference } from '@/lib/actions/ad-reference'
import { AdReference } from '@/lib/types/database'

import { columns } from './columns'

interface AdReferenceTableProps {
  initialData: AdReference[]
}

function exportToCsv(rows: AdReference[]) {
  const headers = ['NO', '작성일', '형태', '참고 브랜드', '썸네일', '광고ID', '페이지명', '유형', '내용', '광고 url', '영상 url', '비고']
  const keys: (keyof AdReference)[] = ['no', 'created_date', 'format', 'reference_brand', 'thumbnail_url', 'ad_id', 'page_name', 'ad_type', 'content', 'ad_url', 'video_url', 'notes']

  const csvRows = [
    headers.join(','),
    ...rows.map(row => keys.map(k => {
      const v = row[k]
      const str = v === null || v === undefined ? '' : String(v)
      return `"${str.replace(/"/g, '""')}"`
    }).join(',')),
  ]

  const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ad_references_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function AdReferenceTable({ initialData }: AdReferenceTableProps) {
  const data = initialData
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([])

  const handleCreate = async () => {
    setCreating(true)
    try {
      const result = await createAdReference()
      if (result.success) toast.success('추가 완료')
      else toast.error('추가 실패')
      router.refresh()
    } finally {
      setCreating(false)
    }
  }

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: 'onChange',
    enableColumnResizing: true,
  })

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-secondary/20 px-3 py-2">
        <div className="flex items-center justify-end gap-1.5">
          <Button type="button" variant="outline" size="sm" className="h-7 px-1.5" onClick={() => exportToCsv(data)} title="CSV 내보내기">
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" size="sm" className="h-7 px-2 text-[12px]" onClick={() => void handleCreate()} disabled={creating}>
            <Plus className="mr-0.5 h-3 w-3" />
            추가
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-max" style={{ width: table.getCenterTotalSize() }}>
          <TableHeader className="bg-secondary/40 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-border hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize(), position: 'relative' }}
                      className="whitespace-nowrap font-medium text-muted-foreground text-[10px] uppercase tracking-wider h-7 px-2 select-none"
                    >
                      {canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="flex items-center gap-0.5 cursor-pointer hover:text-foreground"
                        >
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === 'asc' ? <ArrowUp className="h-2.5 w-2.5" />
                          : sorted === 'desc' ? <ArrowDown className="h-2.5 w-2.5" />
                          : <ArrowUpDown className="h-2.5 w-2.5 opacity-30" />}
                        </button>
                      ) : (
                        <div className="flex items-center gap-0.5">
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                      )}
                      {header.column.getCanResize() && (
                        <button
                          type="button"
                          aria-label="열 너비 조절"
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none hover:bg-zinc-400 ${header.column.getIsResizing() ? 'bg-zinc-500' : ''}`}
                        />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="transition-colors border-b border-border/50 last:border-0 hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} style={{ width: cell.column.getSize() }} className="py-1 px-2 text-[12px] text-foreground">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
                    <Megaphone className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">등록된 광고 레퍼런스가 없습니다</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="border-t border-border px-3 py-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>총 {data.length}건</span>
        <span>{table.getVisibleLeafColumns().length}개 컬럼</span>
      </div>
    </div>
  )
}
