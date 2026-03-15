import { getInfluencers, getTabCounts } from '@/lib/actions/influencer'
import { searchParamsToFilters } from '@/lib/filters/url-state'
import { InfluencerTable } from './influencer-table'
import { MainLayout } from '@/components/layout/main-layout'

export default async function InfluencersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const filters = searchParamsToFilters(params)
  const [result, countsResult] = await Promise.all([
    getInfluencers(filters),
    getTabCounts(),
  ])
  const influencers = result.success ? (result.data ?? []) : []
  const tabCounts = countsResult.success ? (countsResult.data ?? {}) : {}

  return (
    <MainLayout title="인플루언서 관리">
      <div className="flex flex-col gap-4">
        <InfluencerTable initialData={influencers} tabCounts={tabCounts} />
      </div>
    </MainLayout>
  )
}
