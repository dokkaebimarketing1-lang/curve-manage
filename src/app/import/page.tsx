import { MainLayout } from '@/components/layout/main-layout'
import { CsvImporter } from './csv-importer'

export default function ImportPage() {
  return (
    <MainLayout title="CSV 임포트">
      <div className="flex flex-col gap-4">
        <CsvImporter />
      </div>
    </MainLayout>
  )
}
