import { CustomReportBuilderPanel } from '@/components/important/CustomReportBuilderPanel';
import { ImportantFeatureDashboard } from '@/components/important/ImportantFeatureDashboard';
import { createPageMetadata } from '@/lib/metadata';
import { getImportantFeatureData } from '@/services/importantFeaturesService';

export const metadata = createPageMetadata(
  'Custom Report Builder',
  'Selection-based report generation for KPI and visualization exports.'
);

export default async function ReportBuilderPage() {
  const data = await getImportantFeatureData('custom_report_builder');
  return <ImportantFeatureDashboard data={data} customPanel={<CustomReportBuilderPanel />} />;
}
