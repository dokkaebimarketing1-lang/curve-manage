'use client'

import { useMemo, useRef, useState } from 'react'
import { Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { bulkCreateInfluencers } from '@/lib/actions/import'
import { TabCategory } from '@/lib/types/database'

type DbField =
  | 'nickname'
  | 'url'
  | 'classification'
  | 'collaboration_type'
  | 'category'
  | 'follower_count'
  | 'real_name'
  | 'gender'
  | 'contact'
  | 'must_do'
  | 'selection_reason'
  | 'notes'
  | 'email'
  | 'rate'

type ImportProgress = {
  processed: number
  total: number
  created: number
  errors: number
}

const DB_FIELDS: { value: DbField; label: string }[] = [
  { value: 'nickname', label: 'nickname (닉네임)' },
  { value: 'url', label: 'url (URL)' },
  { value: 'classification', label: 'classification (분류)' },
  { value: 'collaboration_type', label: 'collaboration_type (협업형태)' },
  { value: 'category', label: 'category (카테고리)' },
  { value: 'follower_count', label: 'follower_count (팔로워)' },
  { value: 'real_name', label: 'real_name (성함)' },
  { value: 'gender', label: 'gender (성별)' },
  { value: 'contact', label: 'contact (연락처)' },
  { value: 'must_do', label: 'must_do (무조건)' },
  { value: 'selection_reason', label: 'selection_reason (선정이유)' },
  { value: 'notes', label: 'notes (비고)' },
  { value: 'email', label: 'email (메일)' },
  { value: 'rate', label: 'rate (단가)' },
]

const HEADER_MATCHES: Record<string, DbField> = {
  닉네임: 'nickname',
  nickname: 'nickname',
  name: 'nickname',
  url: 'url',
  링크: 'url',
  분류: 'classification',
  classification: 'classification',
  협업형태: 'collaboration_type',
  collaborationtype: 'collaboration_type',
  category: 'category',
  카테고리: 'category',
  팔로워: 'follower_count',
  팔로워수: 'follower_count',
  follower: 'follower_count',
  followers: 'follower_count',
  followercount: 'follower_count',
  성함: 'real_name',
  이름: 'real_name',
  realname: 'real_name',
  성별: 'gender',
  gender: 'gender',
  연락처: 'contact',
  contact: 'contact',
  phone: 'contact',
  무조건: 'must_do',
  mustdo: 'must_do',
  선정이유: 'selection_reason',
  reason: 'selection_reason',
  selectionreason: 'selection_reason',
  비고: 'notes',
  notes: 'notes',
  메일: 'email',
  이메일: 'email',
  email: 'email',
  단가: 'rate',
  금액: 'rate',
  rate: 'rate',
}

const TAB_CATEGORIES: { value: TabCategory; label: string }[] = [
  { value: 'listup', label: 'listup' },
  { value: 'reference', label: 'reference' },
  { value: 'mcn', label: 'mcn' },
  { value: 'must', label: 'must' },
  { value: 'past', label: 'past' },
  { value: 'group_buy_brand', label: 'group_buy_brand' },
  { value: 'ad', label: 'ad' },
]

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_-]/g, '')
}

function detectField(header: string): DbField | '' {
  const normalized = normalizeHeader(header)
  return HEADER_MATCHES[header.trim()] ?? HEADER_MATCHES[normalized] ?? ''
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('CSV 파일을 읽는 중 오류가 발생했습니다.'))
    reader.readAsText(file)
  })
}

function parseCSV(content: string): string[][] {
  const rows: string[][] = []
  const text = content.replace(/^\uFEFF/, '')

  let current = ''
  let row: string[] = []
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(current)
      current = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      row.push(current)
      current = ''

      if (row.some((cell) => cell.trim() !== '')) {
        rows.push(row)
      }
      row = []

      if (char === '\r' && nextChar === '\n') {
        i += 1
      }
      continue
    }

    current += char
  }

  row.push(current)
  if (row.some((cell) => cell.trim() !== '')) {
    rows.push(row)
  }

  return rows
}

function parseNumber(value: string): number | null {
  const numeric = value.replace(/,/g, '').replace(/[^0-9.-]/g, '')
  if (!numeric) return null
  const parsed = Number(numeric)
  return Number.isFinite(parsed) ? parsed : null
}

function parseMustDo(value: string): boolean {
  const normalized = value.trim().toLowerCase()
  return ['1', 'true', 't', 'yes', 'y', '네', '예', '무조건', 'o'].includes(normalized)
}

function convertValue(field: DbField, value: string): unknown {
  if (field === 'follower_count' || field === 'rate') {
    return parseNumber(value)
  }

  if (field === 'must_do') {
    return parseMustDo(value)
  }

  return value.trim()
}

export function CsvImporter() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])
  const [mapping, setMapping] = useState<Record<number, DbField | ''>>({})
  const [tabCategory, setTabCategory] = useState<TabCategory>('listup')
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState<ImportProgress | null>(null)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  const previewRows = useMemo(() => rows.slice(0, 5), [rows])

  const mappedColumnsCount = useMemo(() => {
    return Object.values(mapping).filter(Boolean).length
  }, [mapping])

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setStatusMessage({ type: 'error', text: 'CSV 파일만 업로드할 수 있습니다.' })
      return
    }

    try {
      const content = await readFileAsText(file)
      const parsed = parseCSV(content)

      if (parsed.length < 2) {
        setStatusMessage({ type: 'error', text: '헤더와 데이터가 포함된 CSV 파일을 업로드해 주세요.' })
        return
      }

      const [headerRow, ...dataRows] = parsed
      const initialMapping: Record<number, DbField | ''> = {}
      const usedFields = new Set<DbField>()

      headerRow.forEach((header, index) => {
        const detected = detectField(header)
        if (detected && !usedFields.has(detected)) {
          initialMapping[index] = detected
          usedFields.add(detected)
        } else {
          initialMapping[index] = ''
        }
      })

      setFileName(file.name)
      setHeaders(headerRow)
      setRows(dataRows)
      setMapping(initialMapping)
      setProgress(null)
      setErrors([])
      setStatusMessage(null)
    } catch (error) {
      setStatusMessage({ type: 'error', text: error instanceof Error ? error.message : '파일을 읽을 수 없습니다.' })
    }
  }

  const onDrop: React.DragEventHandler<HTMLDivElement> = async (event) => {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files[0]
    if (file) {
      await handleFile(file)
    }
  }

  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0]
    if (file) {
      await handleFile(file)
    }
    event.target.value = ''
  }

  const updateMapping = (columnIndex: number, value: string) => {
    const nextValue = value === '__skip__' ? '' : (value as DbField)
    setMapping((prev) => {
      const next: Record<number, DbField | ''> = { ...prev }

      if (nextValue) {
        Object.keys(next).forEach((key) => {
          const index = Number(key)
          if (index !== columnIndex && next[index] === nextValue) {
            next[index] = ''
          }
        })
      }

      next[columnIndex] = nextValue
      return next
    })
  }

  const buildImportRows = (): Record<string, unknown>[] => {
    return rows
      .map((cells) => {
        const payload: Record<string, unknown> = {}

        headers.forEach((_, index) => {
          const field = mapping[index]
          const rawValue = (cells[index] ?? '').trim()

          if (!field || rawValue === '') return
          payload[field] = convertValue(field, rawValue)
        })

        return payload
      })
      .filter((row) => Object.keys(row).length > 0)
  }

  const handleImport = async () => {
    const importRows = buildImportRows()

    if (importRows.length === 0) {
      setStatusMessage({ type: 'error', text: '가져올 데이터가 없습니다. 컬럼 매핑을 확인해 주세요.' })
      return
    }

    setIsImporting(true)
    setStatusMessage(null)
    setErrors([])
    setProgress({ processed: 0, total: importRows.length, created: 0, errors: 0 })

    const chunkSize = 100
    const localErrors: string[] = []
    let processed = 0
    let created = 0
    let failed = 0

    try {
      for (let start = 0; start < importRows.length; start += chunkSize) {
        const chunk = importRows.slice(start, start + chunkSize)
        const result = await bulkCreateInfluencers(chunk, tabCategory)

        processed += chunk.length

        if (!result.success || !result.data) {
          failed += chunk.length
          localErrors.push(result.error ?? `${start + 1}~${start + chunk.length}행 처리에 실패했습니다.`)
        } else {
          created += result.data.created
          failed += result.data.errors
          if (result.data.errors > 0) {
            localErrors.push(`${start + 1}~${start + chunk.length}행 중 ${result.data.errors}건 실패했습니다.`)
          }
        }

        setProgress({
          processed,
          total: importRows.length,
          created,
          errors: failed,
        })
      }

      if (failed > 0) {
        setStatusMessage({
          type: 'error',
          text: `임포트 완료: ${created}건 성공, ${failed}건 실패`,
        })
        setErrors(localErrors)
      } else {
        setStatusMessage({
          type: 'success',
          text: `${created}건을 성공적으로 임포트했습니다.`,
        })
      }
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">CSV 파일 업로드</CardTitle>
          <CardDescription>드래그 앤 드롭 또는 클릭으로 CSV 파일을 업로드하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={onInputChange}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={[
              'cursor-pointer rounded-lg border-2 border-dashed p-10 text-center transition-colors',
              isDragging ? 'border-zinc-500 bg-zinc-100/80 dark:bg-zinc-900/50' : 'border-zinc-300 hover:border-zinc-400',
            ].join(' ')}
          >
            <div className="mx-auto flex max-w-md flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-zinc-500" />
              <p className="font-medium text-zinc-800 dark:text-zinc-100">CSV 파일을 여기에 놓으세요</p>
              <p className="text-sm text-zinc-500">또는 클릭해서 파일 선택</p>
              {fileName ? (
                <div className="mt-2 inline-flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                  <FileSpreadsheet className="h-4 w-4" />
                  {fileName}
                </div>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {headers.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">컬럼 매핑</CardTitle>
            <CardDescription>CSV 컬럼을 DB 필드에 연결해 주세요.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {headers.map((header, index) => (
              <div key={`${header}-${index}`} className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_280px] md:items-center">
                <div className="rounded-md border px-3 py-2 text-sm">
                  <span className="text-zinc-500">CSV 컬럼:</span> {header || `컬럼 ${index + 1}`}
                </div>
                <Select
                  value={mapping[index] || '__skip__'}
                  onValueChange={(value) => updateMapping(index, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="DB 필드를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__skip__">가져오지 않음</SelectItem>
                    {DB_FIELDS.map((field) => (
                      <SelectItem key={field.value} value={field.value}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {previewRows.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">미리보기</CardTitle>
            <CardDescription>처음 5개 행을 확인하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((header, index) => (
                    <TableHead key={`${header}-${index}`}>{header || `컬럼 ${index + 1}`}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewRows.map((row, rowIndex) => (
                  <TableRow key={`preview-${rowIndex}`}>
                    {headers.map((_, colIndex) => (
                      <TableCell key={`preview-${rowIndex}-${colIndex}`} className="max-w-[220px] truncate">
                        {row[colIndex] || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">임포트 실행</CardTitle>
          <CardDescription>탭 카테고리를 선택하고 임포트를 실행하세요.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-2 md:max-w-xs">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">탭 카테고리</label>
            <Select value={tabCategory} onValueChange={(value) => setTabCategory(value as TabCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TAB_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {progress ? (
            <div className="rounded-md border bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900/40">
              진행률: {progress.processed}/{progress.total} | 성공: {progress.created} | 실패: {progress.errors}
            </div>
          ) : null}

          {statusMessage ? (
            <div
              className={[
                'flex items-center gap-2 rounded-md border px-3 py-2 text-sm',
                statusMessage.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300'
                  : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300',
              ].join(' ')}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              {statusMessage.text}
            </div>
          ) : null}

          {errors.length > 0 ? (
            <div className="rounded-md border border-red-200 bg-red-50/70 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
              <p className="mb-2 font-medium">오류 내역</p>
              <ul className="list-disc space-y-1 pl-5">
                {errors.slice(0, 5).map((error, index) => (
                  <li key={`error-${index}`}>{error}</li>
                ))}
              </ul>
              {errors.length > 5 ? <p className="mt-2">외 {errors.length - 5}건</p> : null}
            </div>
          ) : null}

          <Button
            type="button"
            onClick={handleImport}
            disabled={isImporting || rows.length === 0 || mappedColumnsCount === 0}
            className="md:w-fit"
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                임포트 중...
              </>
            ) : (
              '인플루언서 일괄 생성'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
