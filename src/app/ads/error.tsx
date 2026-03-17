'use client'

import { Button } from '@/components/ui/button'

export default function RouteError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
      <p className="text-lg font-semibold text-destructive">광고 레퍼런스 보드를 불러오는 중 오류가 발생했습니다.</p>
      <p className="max-w-xl text-sm text-muted-foreground">{error.message || '잠시 후 다시 시도해주세요.'}</p>
      <Button type="button" onClick={reset}>
        다시 시도
      </Button>
    </div>
  )
}
