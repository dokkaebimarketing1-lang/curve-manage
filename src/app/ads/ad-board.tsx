'use client'

import { FormEvent, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Folder as FolderIcon, Link2, Plus, Trash2, X } from 'lucide-react'

import {
  createAdCard,
  createFolder,
  deleteAdCard,
  deleteFolder,
} from '@/lib/actions/ad-card'
import { AdCard, Folder } from '@/lib/types/database'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AdBoardProps {
  adCards: AdCard[]
  folders: Folder[]
}

interface AddCardFormState {
  url: string
  title: string
  oneLineReview: string
  referenceBrand: string
  sourceHandle: string
  tags: string
  folderId: string
}

const ALL_FOLDER = 'all'
const NO_FOLDER = 'none'

const defaultFormState: AddCardFormState = {
  url: '',
  title: '',
  oneLineReview: '',
  referenceBrand: '',
  sourceHandle: '',
  tags: '',
  folderId: NO_FOLDER,
}

function normalizeTagList(raw: string): string[] {
  return raw
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function deriveThumbnailUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url)
    const host = parsedUrl.hostname.replace('www.', '')

    if (host === 'youtu.be') {
      const id = parsedUrl.pathname.replace('/', '')
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
    }

    if (host.includes('youtube.com')) {
      const id = parsedUrl.searchParams.get('v')
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
    }

    if (/\.(png|jpe?g|gif|webp)$/i.test(parsedUrl.pathname)) {
      return url
    }

    return null
  } catch {
    return null
  }
}

export function AdBoard({ adCards, folders }: AdBoardProps) {
  const router = useRouter()
  const [activeFolderId, setActiveFolderId] = useState<string>(ALL_FOLDER)
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [formState, setFormState] = useState<AddCardFormState>(defaultFormState)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filteredCards = useMemo(() => {
    if (activeFolderId === ALL_FOLDER) {
      return adCards
    }

    if (activeFolderId === NO_FOLDER) {
      return adCards.filter((card) => !card.folder_id)
    }

    return adCards.filter((card) => card.folder_id === activeFolderId)
  }, [activeFolderId, adCards])

  const handleCreateFolder = () => {
    const name = newFolderName.trim()
    if (!name) {
      return
    }

    setErrorMessage(null)
    startTransition(async () => {
      const result = await createFolder(name)
      if (!result.success) {
        setErrorMessage(result.error ?? '폴더를 생성하지 못했습니다.')
        return
      }

      setNewFolderName('')
      router.refresh()
    })
  }

  const handleDeleteFolder = (folderId: string) => {
    setErrorMessage(null)
    startTransition(async () => {
      const result = await deleteFolder(folderId)
      if (!result.success) {
        setErrorMessage(result.error ?? '폴더를 삭제하지 못했습니다.')
        return
      }

      if (activeFolderId === folderId) {
        setActiveFolderId(ALL_FOLDER)
      }
      router.refresh()
    })
  }

  const handleDeleteCard = (id: string) => {
    setErrorMessage(null)
    startTransition(async () => {
      const result = await deleteAdCard(id)
      if (!result.success) {
        setErrorMessage(result.error ?? '카드를 삭제하지 못했습니다.')
        return
      }

      router.refresh()
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedUrl = formState.url.trim()
    if (!trimmedUrl) {
      setErrorMessage('URL은 필수입니다.')
      return
    }

    setErrorMessage(null)

    startTransition(async () => {
      const result = await createAdCard({
        url: trimmedUrl,
        title: formState.title.trim() || null,
        one_line_review: formState.oneLineReview.trim() || null,
        reference_brand: formState.referenceBrand.trim() || null,
        source_handle: formState.sourceHandle.trim() || null,
        tags: normalizeTagList(formState.tags),
        folder_id: formState.folderId === NO_FOLDER ? null : formState.folderId,
        thumbnail_url: deriveThumbnailUrl(trimmedUrl),
      })

      if (!result.success) {
        setErrorMessage(result.error ?? '카드를 생성하지 못했습니다.')
        return
      }

      setFormState(defaultFormState)
      setIsCardDialogOpen(false)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/70 p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={activeFolderId === ALL_FOLDER ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFolderId(ALL_FOLDER)}
          >
            전체
          </Button>
          <Button
            variant={activeFolderId === NO_FOLDER ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFolderId(NO_FOLDER)}
          >
            미분류
          </Button>

          {folders.map((folder) => (
            <div key={folder.id} className="group relative">
              <Button
                variant={activeFolderId === folder.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFolderId(folder.id)}
              >
                <FolderIcon className="mr-1 h-3.5 w-3.5" />
                {folder.name}
              </Button>
              <button
                type="button"
                aria-label={`${folder.name} 삭제`}
                onClick={() => handleDeleteFolder(folder.id)}
                className="absolute -right-1 -top-1 hidden h-5 w-5 items-center justify-center rounded-full border bg-background text-muted-foreground transition hover:text-destructive group-hover:flex"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          <div className="flex items-center gap-2 rounded-md border border-dashed px-2 py-1.5">
            <Input
              value={newFolderName}
              onChange={(event) => setNewFolderName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleCreateFolder()
                }
              }}
              placeholder="+ 폴더"
              className="h-7 w-28 border-0 bg-transparent p-0 text-xs shadow-none focus-visible:ring-0"
            />
            <Button type="button" size="sm" variant="ghost" className="h-7 px-2" onClick={handleCreateFolder}>
              추가
            </Button>
          </div>
        </div>

        <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-1 h-4 w-4" />
              카드 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>광고 레퍼런스 카드 추가</DialogTitle>
              <DialogDescription>링크, 리뷰, 태그를 입력해 보드를 정리하세요.</DialogDescription>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <p className="text-sm font-medium">URL *</p>
                <Input
                  value={formState.url}
                  onChange={(event) => setFormState((prev) => ({ ...prev, url: event.target.value }))}
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">제목</p>
                  <Input
                    value={formState.title}
                    onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="카드 제목"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">한줄평</p>
                  <Input
                    value={formState.oneLineReview}
                    onChange={(event) => setFormState((prev) => ({ ...prev, oneLineReview: event.target.value }))}
                    placeholder="핵심 포인트"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">레퍼런스 브랜드</p>
                  <Input
                    value={formState.referenceBrand}
                    onChange={(event) => setFormState((prev) => ({ ...prev, referenceBrand: event.target.value }))}
                    placeholder="브랜드명"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">소스 핸들</p>
                  <Input
                    value={formState.sourceHandle}
                    onChange={(event) => setFormState((prev) => ({ ...prev, sourceHandle: event.target.value }))}
                    placeholder="@source"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">태그 (콤마 구분)</p>
                  <Input
                    value={formState.tags}
                    onChange={(event) => setFormState((prev) => ({ ...prev, tags: event.target.value }))}
                    placeholder="UGC, 후킹, 쇼츠"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">폴더</p>
                  <Select
                    value={formState.folderId}
                    onValueChange={(value) => setFormState((prev) => ({ ...prev, folderId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="폴더 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_FOLDER}>미분류</SelectItem>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCardDialogOpen(false)}
                  disabled={isPending}
                >
                  취소
                </Button>
                <Button type="submit" disabled={isPending}>
                  저장
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {errorMessage ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {filteredCards.map((card) => (
          <Card
            key={card.id}
            className="group overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative">
              <a
                href={card.url ?? '#'}
                target="_blank"
                rel="noreferrer"
                className="block aspect-video bg-muted"
              >
                {card.thumbnail_url ? (
                  <img
                    src={card.thumbnail_url}
                    alt={card.title ?? '광고 레퍼런스 썸네일'}
                    className="h-full w-full rounded-t-xl object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-t-xl bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-500">
                    <Link2 className="h-6 w-6" />
                  </div>
                )}
              </a>

              <button
                type="button"
                aria-label="카드 삭제"
                onClick={() => handleDeleteCard(card.id)}
                className="absolute right-2 top-2 hidden h-7 w-7 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm transition hover:text-destructive group-hover:flex"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 p-3">
              <p className="truncate text-sm font-medium">{card.title || '제목 없음'}</p>
              <p className="truncate text-sm text-muted-foreground">{card.one_line_review || '-'}</p>

              <div className="flex flex-wrap gap-1">
                {card.tags?.length ? (
                  card.tags.map((tag) => (
                    <Badge key={`${card.id}-${tag}`} variant="secondary" className="rounded-md px-2 py-0 text-[11px] font-medium">
                      #{tag}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline" className="rounded-md px-2 py-0 text-[11px] text-muted-foreground">
                    태그 없음
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="truncate">{card.reference_brand || '브랜드 미지정'}</span>
                <span className="truncate">{card.source_handle || '-'}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!filteredCards.length ? (
        <div className="rounded-xl border border-dashed bg-muted/30 p-10 text-center text-sm text-muted-foreground">
          아직 카드가 없습니다. 우측 상단의 카드 추가 버튼으로 첫 레퍼런스를 저장해보세요.
        </div>
      ) : null}
    </div>
  )
}
