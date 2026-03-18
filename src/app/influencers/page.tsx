import { getInfluencers, getTabCounts } from '@/lib/actions/influencer'
import { getCustomTabs } from '@/lib/actions/custom-tab'
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
  const [result, countsResult, customTabsResult] = await Promise.all([
    getInfluencers(filters),
    getTabCounts(),
    getCustomTabs(),
  ])
  const influencers = result.success ? (result.data ?? []) : []
  const tabCounts = countsResult.success ? (countsResult.data ?? {}) : {}
  const customTabs = customTabsResult.success ? (customTabsResult.data ?? []) : []

  return (
    <MainLayout title="인플루언서 관리">
      <InfluencerTable initialData={influencers} tabCounts={tabCounts} initialCustomTabs={customTabs} />
    </MainLayout>
  )
}
