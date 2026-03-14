import { DataExchangePanel } from '@/components/important/DataExchangePanel';
import { ImportantFeatureDashboard } from '@/components/important/ImportantFeatureDashboard';
import { createPageMetadata } from '@/lib/metadata';
import { getImportantFeatureData } from '@/services/importantFeaturesService';

export const metadata = createPageMetadata(
  'Data Export & Import Tools',
  'Flexible import/export tooling with validation and confirmation for operational datasets.'
);

export default async function DataExchangePage() {
  const data = await getImportantFeatureData('data_export_import');
  return <ImportantFeatureDashboard data={data} customPanel={<DataExchangePanel />} />;
}
