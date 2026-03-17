import { MainLayout } from '@/components/layout/main-layout'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <MainLayout title="광고 레퍼런스">
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-secondary/20 px-3 py-2">
            <div className="flex items-center justify-end gap-1.5">
              <Skeleton className="h-7 w-7" />
              <Skeleton className="h-7 w-14" />
            </div>
          </div>

          <div className="space-y-2 p-3">
            <Skeleton className="h-8 w-full" />
            {['row-a', 'row-b', 'row-c', 'row-d', 'row-e', 'row-f'].map((rowKey) => (
              <Skeleton key={rowKey} className="h-8 w-full" />
            ))}
          </div>

          <div className="border-t border-border px-3 py-1.5 flex items-center justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
