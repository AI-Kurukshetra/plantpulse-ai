import { ImportantFeatureDashboard } from '@/components/important/ImportantFeatureDashboard';
import { createPageMetadata } from '@/lib/metadata';
import { getImportantFeatureData } from '@/services/importantFeaturesService';

export const metadata = createPageMetadata(
  'Mobile Operations App',
  'Mobile-first operations view for managers and technicians with key KPIs and alerts.'
);

export default async function MobileOperationsPage() {
  const data = await getImportantFeatureData('mobile_operations');
  return <ImportantFeatureDashboard data={data} />;
}
