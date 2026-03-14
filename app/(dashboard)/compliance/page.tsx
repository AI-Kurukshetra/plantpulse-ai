import { ImportantFeatureDashboard } from '@/components/important/ImportantFeatureDashboard';
import { createPageMetadata } from '@/lib/metadata';
import { getImportantFeatureData } from '@/services/importantFeaturesService';

export const metadata = createPageMetadata(
  'Regulatory Compliance Management',
  'Compliance tracking for environmental and safety requirements with AI acceleration guidance.'
);

export default async function CompliancePage() {
  const data = await getImportantFeatureData('regulatory_compliance');
  return <ImportantFeatureDashboard data={data} />;
}
