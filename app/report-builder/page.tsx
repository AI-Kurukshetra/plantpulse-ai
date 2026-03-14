import { CustomReportBuilderPanel } from '@/components/important/CustomReportBuilderPanel';
import { ImportantFeatureDashboard } from '@/components/important/ImportantFeatureDashboard';
import { AppShell } from '@/components/layout/AppShell';
import { getCurrentRole } from '@/lib/auth';
import { createPageMetadata } from '@/lib/metadata';
import { getImportantFeatureData } from '@/services/importantFeaturesService';

export const metadata = createPageMetadata(
  'Custom Report Builder',
  'Selection-based report generation for KPI and visualization exports.'
);

export default async function ReportBuilderPage() {
  const [role, data] = await Promise.all([getCurrentRole(), getImportantFeatureData('custom_report_builder')]);
  return (
    <AppShell title={data.title} subtitle={data.subtitle} role={role}>
      <ImportantFeatureDashboard data={data} customPanel={<CustomReportBuilderPanel />} />
    </AppShell>
  );
}
