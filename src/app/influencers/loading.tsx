import { MainLayout } from '@/components/layout/main-layout'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <MainLayout title="인플루언서 관리">
      <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm h-[calc(100vh-6rem)]">
        <div className="shrink-0 border-b border-border bg-secondary/20 px-3 py-2">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-1">
              {['all', 'reference', 'listup', 'mcn', 'must', 'past', 'ad'].map((tabKey) => (
                <Skeleton key={tabKey} className="h-7 w-20" />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Skeleton className="h-8 w-44" />
              <Skeleton className="h-7 w-7" />
              <Skeleton className="h-7 w-7" />
              <Skeleton className="h-7 w-16" />
            </div>
          </div>
        </div>

        <div className="overflow-auto p-3">
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            {['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8'].map((rowKey) => (
              <Skeleton key={rowKey} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
