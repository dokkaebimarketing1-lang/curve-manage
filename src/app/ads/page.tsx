import { MainLayout } from '@/components/layout/main-layout'
import { getAdCards, getFolders } from '@/lib/actions/ads'

import { AdBoard } from './ad-board'

export default async function AdsPage() {
  const [cardsResult, foldersResult] = await Promise.all([getAdCards(), getFolders()])

  const adCards = cardsResult.success ? (cardsResult.data ?? []) : []
  const folders = foldersResult.success ? (foldersResult.data ?? []) : []

  return (
    <MainLayout title="광고 레퍼런스 보드">
      <div className="flex flex-col gap-4">
        <AdBoard adCards={adCards} folders={folders} />
      </div>
    </MainLayout>
  )
}
