import { MainLayout } from '@/components/layout/main-layout'
import { getAdReferences } from '@/lib/actions/ad-reference'

import { AdReferenceTable } from './ad-reference-table'

export default async function AdReferencesPage() {
  const result = await getAdReferences()
  const adReferences = result.success ? (result.data ?? []) : []

  return (
    <MainLayout title="광고 레퍼런스">
      <div className="flex flex-col gap-4">
        <AdReferenceTable initialData={adReferences} />
      </div>
    </MainLayout>
  )
}
