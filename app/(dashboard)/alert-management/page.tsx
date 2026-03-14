import { ImportantFeatureDashboard } from '@/components/important/ImportantFeatureDashboard';
import { createPageMetadata } from '@/lib/metadata';
import { getImportantFeatureData } from '@/services/importantFeaturesService';

export const metadata = createPageMetadata(
  'Alert Management System',
  'Configurable notifications and escalation workflows with complete alert visibility.'
);

export default async function AlertManagementPage() {
  const data = await getImportantFeatureData('alert_management');
  return <ImportantFeatureDashboard data={data} showModal />;
}
