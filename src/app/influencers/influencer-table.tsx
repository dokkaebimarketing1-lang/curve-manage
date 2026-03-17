'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
  RowSelectionState,
  VisibilityState,
} from '@tanstack/react-table'
import { columns as allColumns } from './columns'
import { Influencer } from '@/lib/types/database'
import { createInfluencer, deleteInfluencer, updateInfluencerField } from '@/lib/actions/influencer'
import { TAB_PRESETS } from '@/lib/filters/influencer-filters'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Users, Search, Plus, Download, Columns3, Trash2, FolderInput, ArrowUpDown, ArrowUp, ArrowDown, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DetailPanel } from './detail-panel'

interface InfluencerTableProps {
  initialData: Influencer[]
  tabCounts?: Record<string, number>
}

const CUSTOM_TABS_STORAGE_KEY = 'influencer-custom-tabs'
const BASE_TABS = TAB_PRESETS.map((tab) => ({ value: tab.value, label: tab.label }))

function toTabValue(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_\-가-힣]/g, '')
}

// CSV 내보내기
function exportToCsv(rows: Influencer[]) {
  const headers = ['NO', '닉네임', 'URL', '분류', '협업형태', '카테고리', '팔로워수', '성함', '성별', '연락처', '무조건', '선정이유', '비고', '메일', '단가']
  const keys: (keyof Influencer)[] = ['no', 'nickname', 'url', 'classification', 'collaboration_type', 'category', 'follower_count', 'real_name', 'gender', 'contact', 'must_do', 'selection_reason', 'notes', 'email', 'rate']

  const csvRows = [
    headers.join(','),
    ...rows.map(row => keys.map(k => {
      const v = row[k]
      const str = v === null || v === undefined ? '' : String(v)
      return `"${str.replace(/"/g, '""')}"`
    }).join(','))
  ]
  const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `influencers_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function InfluencerTable({ initialData, tabCounts = {} }: InfluencerTableProps) {
  const data = initialData
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchText, setSearchText] = useState(searchParams.get('search') ?? '')
  const [creating, setCreating] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [showColumnMenu, setShowColumnMenu] = useState(false)
  const [bulkAction, setBulkAction] = useState(false)
  const [detailRow, setDetailRow] = useState<Influencer | null>(null)
  const [customTabs, setCustomTabs] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_TABS_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Array<{ value: string; label: string }>
      if (!Array.isArray(parsed)) return
      const safeTabs = parsed.filter((t) => t && typeof t.value === 'string' && typeof t.label === 'string' && t.value && t.label)
      setCustomTabs(safeTabs)
    } catch {
      // ignore invalid localStorage payload
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(CUSTOM_TABS_STORAGE_KEY, JSON.stringify(customTabs))
  }, [customTabs])

  const tabs = useMemo(() => {
    const existing = new Set(BASE_TABS.map((t) => t.value))
    const extra = customTabs.filter((t) => !existing.has(t.value))
    return [...BASE_TABS, ...extra]
  }, [customTabs])
  const customTabValues = useMemo(() => new Set(customTabs.map((tab) => tab.value)), [customTabs])

  useEffect(() => {
    setSearchText(searchParams.get('search') ?? '')
  }, [searchParams])

  const updateQuery = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      mutate(params)
      const query = params.toString()
      router.push(query ? `${pathname}?${query}` : pathname)
    },
    [pathname, router, searchParams]
  )

  const handleTabChange = useCallback(
    (tab: string) => {
      updateQuery((params) => {
        if (tab === 'all') params.delete('tab')
        else params.set('tab', tab)
      })
    },
    [updateQuery]
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const currentSearch = searchParams.get('search') ?? ''
      const nextSearch = searchText.trim()
      if (currentSearch === nextSearch) return
      updateQuery((params) => {
        if (nextSearch) params.set('search', nextSearch)
        else params.delete('search')
      })
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchParams, searchText, updateQuery])

  const handleCreate = async () => {
    setCreating(true)
    try {
      await createInfluencer({})
      toast.success('추가 완료')
      router.refresh()
    } finally {
      setCreating(false)
    }
  }

  // 벌크 삭제
  const handleBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection).map(idx => data[Number(idx)]?.id).filter(Boolean)
    if (selectedIds.length === 0) return
    if (!window.confirm(`${selectedIds.length}건을 삭제하시겠습니까?`)) return
    setBulkAction(true)
    try {
      for (const id of selectedIds) {
        await deleteInfluencer(id)
      }
      setRowSelection({})
      toast.success(`${selectedIds.length}건 삭제 완료`)
      router.refresh()
    } finally {
      setBulkAction(false)
    }
  }

  // 벌크 탭 이동
  const handleBulkMoveTab = async (tab: string) => {
    const selectedIds = Object.keys(rowSelection).map(idx => data[Number(idx)]?.id).filter(Boolean)
    if (selectedIds.length === 0) return
    setBulkAction(true)
    try {
      for (const id of selectedIds) {
        await updateInfluencerField(id, 'tab_category', tab)
      }
      setRowSelection({})
      toast.success('탭 이동 완료')
      router.refresh()
    } finally {
      setBulkAction(false)
    }
  }

  const selectedCount = Object.keys(rowSelection).length
  const activeTab = searchParams.get('tab') ?? 'all'

  const addCustomTab = useCallback(() => {
    const labelInput = window.prompt('추가할 탭 이름을 입력하세요')
    if (!labelInput) return

    const label = labelInput.trim()
    if (!label) return

    const existingValues = new Set(tabs.map((t) => t.value))
    const base = toTabValue(label) || `tab_${Date.now()}`
    let value = base
    let i = 2
    while (existingValues.has(value)) {
      value = `${base}_${i}`
      i += 1
    }

    const next = { value, label }
    setCustomTabs((prev) => [...prev, next])
    handleTabChange(value)
  }, [handleTabChange, tabs])

  const removeCustomTab = useCallback((value: string) => {
    setCustomTabs((prev) => prev.filter((tab) => tab.value !== value))
    if (activeTab === value) {
      handleTabChange('all')
    }
  }, [activeTab, handleTabChange])

  // 체크박스 컬럼을 맨 앞에 추가
  const columnsWithSelect = useMemo(() => [
    {
      id: 'select',
      size: 28,
      enableResizing: false,
      enableSorting: false,
      header: ({ table: t }: { table: ReturnType<typeof useReactTable<Influencer>> }) => (
        <input type="checkbox" checked={t.getIsAllRowsSelected()} onChange={t.getToggleAllRowsSelectedHandler()} className="h-3 w-3 accent-zinc-700 cursor-pointer" />
      ),
      cell: ({ row }: { row: { getIsSelected: () => boolean; getToggleSelectedHandler: () => (e: unknown) => void } }) => (
        <input type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} className="h-3 w-3 accent-zinc-700 cursor-pointer" />
      ),
    },
    ...allColumns,
  ], [])

  const table = useReactTable({
    data,
    columns: columnsWithSelect,
    state: { sorting, rowSelection, columnVisibility },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: 'onChange',
    enableColumnResizing: true,
    enableRowSelection: true,
  })

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm h-[calc(100vh-6rem)]">
      {/* 필터 바 — 고정 */}
      <div className="shrink-0 border-b border-border bg-secondary/20 px-3 py-2">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.value
              const isCustom = customTabValues.has(tab.value)
              return (
                <div key={tab.value} className="inline-flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => handleTabChange(tab.value)}
                    className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors border ${isActive ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:text-zinc-900'}`}
                  >
                    {tab.label}
                    {tabCounts[tab.value] !== undefined && (
                      <span className={`ml-1 text-[10px] ${isActive ? 'text-primary-foreground/70' : 'text-zinc-400'}`}>
                        {tabCounts[tab.value]}
                      </span>
                    )}
                  </button>
                  {isCustom && (
                    <button
                      type="button"
                      onClick={() => removeCustomTab(tab.value)}
                      className="rounded border border-zinc-200 bg-background p-0.5 text-zinc-400 hover:text-red-500 hover:border-red-200"
                      title="사용자 탭 삭제"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              )
            })}
            <button
              type="button"
              onClick={addCustomTab}
              className="rounded border border-dashed border-zinc-300 bg-background px-2 py-0.5 text-[11px] font-medium text-zinc-500 hover:border-zinc-400 hover:text-zinc-700"
              title="탭 추가"
            >
              + 탭 추가
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="검색..."
                className="h-7 w-40 rounded border border-zinc-200 bg-background pl-6 pr-2 text-[12px] outline-none transition-colors focus:border-zinc-400"
              />
            </div>
            {/* 컬럼 숨기기 */}
            <div className="relative">
              <Button type="button" variant="outline" size="sm" className="h-7 px-1.5" onClick={() => setShowColumnMenu(!showColumnMenu)} title="컬럼 표시/숨기기">
                <Columns3 className="h-3.5 w-3.5" />
              </Button>
              {showColumnMenu && (
                <div className="absolute right-0 top-8 z-50 w-44 rounded-md border border-zinc-200 bg-white shadow-lg py-1 max-h-64 overflow-auto">
                  {table.getAllLeafColumns().filter(c => c.id !== 'select').map(col => (
                    <label key={col.id} className="flex items-center gap-2 px-3 py-1 text-[11px] hover:bg-zinc-50 cursor-pointer">
                      <input type="checkbox" checked={col.getIsVisible()} onChange={col.getToggleVisibilityHandler()} className="h-3 w-3 accent-zinc-700" />
                      {typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id}
                    </label>
                  ))}
                </div>
              )}
            </div>
            {/* CSV 내보내기 */}
            <Button type="button" variant="outline" size="sm" className="h-7 px-1.5" onClick={() => exportToCsv(data)} title="CSV 내보내기">
              <Download className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" size="sm" className="h-7 px-2 text-[12px]" onClick={() => void handleCreate()} disabled={creating}>
              <Plus className="mr-0.5 h-3 w-3" />
              추가
            </Button>
          </div>
        </div>
      </div>

      {/* 벌크 액션 바 — 고정 */}
      {selectedCount > 0 && (
        <div className="shrink-0 border-b border-border bg-blue-50 px-3 py-1.5 flex items-center gap-2 text-[12px]">
          <span className="font-medium text-blue-700">{selectedCount}건 선택</span>
          <Button type="button" variant="outline" size="sm" className="h-6 px-2 text-[11px] text-red-600 border-red-200 hover:bg-red-50" onClick={() => void handleBulkDelete()} disabled={bulkAction}>
            <Trash2 className="mr-0.5 h-3 w-3" />삭제
          </Button>
          <div className="flex items-center gap-1">
            <FolderInput className="h-3 w-3 text-blue-600" />
            <select className="h-6 text-[11px] border border-zinc-200 rounded px-1 bg-white" onChange={(e) => { if (e.target.value) void handleBulkMoveTab(e.target.value); e.target.value = '' }} disabled={bulkAction}>
              <option value="">탭 이동...</option>
              {tabs.filter((t) => t.value !== 'all').map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <button type="button" className="ml-auto text-[11px] text-zinc-500 hover:text-zinc-700" onClick={() => setRowSelection({})}>선택 해제</button>
        </div>
      )}

      {/* 테이블 — 스크롤 영역 (가로+세로) */}
      <div className="flex-1 overflow-auto min-h-0">
        <Table className="min-w-max" style={{ width: table.getCenterTotalSize() }}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-border hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  const stickyLeft: Record<string, number> = { select: 0, no: 28, nickname: 68, profile_image_url: 158 }
                  const isStickyX = header.column.id in stickyLeft
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width: header.getSize(),
                        position: 'sticky',
                        top: 0,
                        zIndex: isStickyX ? 30 : 10,
                        background: 'var(--color-card)',
                        boxShadow: '0 1px 0 0 var(--color-border)',
                        ...(isStickyX ? { left: stickyLeft[header.column.id] } : {}),
                      }}
                      className="whitespace-nowrap text-zinc-500 text-xs uppercase tracking-wider font-semibold h-7 px-2 select-none"
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className={`flex items-center gap-0.5 ${canSort ? 'cursor-pointer hover:text-foreground' : ''}`}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          sorted === 'asc' ? <ArrowUp className="h-2.5 w-2.5" />
                          : sorted === 'desc' ? <ArrowDown className="h-2.5 w-2.5" />
                          : <ArrowUpDown className="h-2.5 w-2.5 opacity-30" />
                        )}
                      </div>
                      {header.column.getCanResize() && (
                        <div
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={`transition-colors border-b border-border/50 last:border-0 cursor-default ${row.getIsSelected() ? 'bg-blue-50/50' : 'hover:bg-zinc-50/50'}`}
                  onDoubleClick={() => setDetailRow(row.original)}
                >
                  {row.getVisibleCells().map((cell) => {
                    const stickyLeft: Record<string, number> = { select: 0, no: 28, nickname: 68, profile_image_url: 158 }
                    const isSticky = cell.column.id in stickyLeft
                    return (
                    <TableCell
                      key={cell.id}
                      style={{
                        width: cell.column.getSize(),
                        ...(isSticky ? { position: 'sticky', left: stickyLeft[cell.column.id], zIndex: 5, background: 'var(--color-card)' } : {}),
                      }}
                      className="py-1 px-2 text-[12px] text-foreground"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columnsWithSelect.length} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
                    <Users className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">등록된 인플루언서가 없습니다</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 하단 건수 — 고정 */}
      <div className="shrink-0 border-t border-border px-3 py-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>총 {data.length}건{selectedCount > 0 && ` · ${selectedCount}건 선택`}</span>
        <span>더블클릭으로 상세보기 · {table.getVisibleLeafColumns().length}개 컬럼</span>
      </div>

      {/* 상세보기 패널 */}
      <DetailPanel influencer={detailRow} open={!!detailRow} onClose={() => setDetailRow(null)} />
    </div>
  )
}
