import { MainLayout } from '@/components/layout/main-layout'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <MainLayout title="광고 레퍼런스 보드">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/70 p-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            {['all', 'none', 'folder-a', 'folder-b'].map((folderKey) => (
              <Skeleton key={folderKey} className="h-8 w-20" />
            ))}
            <Skeleton className="h-8 w-36" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'].map((cardKey) => (
            <div key={cardKey} className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="space-y-2 p-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}
