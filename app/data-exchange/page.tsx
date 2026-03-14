import { DataExchangePanel } from '@/components/important/DataExchangePanel';
import { ImportantFeatureDashboard } from '@/components/important/ImportantFeatureDashboard';
import { AppShell } from '@/components/layout/AppShell';
import { getCurrentRole } from '@/lib/auth';
import { createPageMetadata } from '@/lib/metadata';
import { getImportantFeatureData } from '@/services/importantFeaturesService';

export const metadata = createPageMetadata(
  'Data Export & Import Tools',
  'Flexible import/export tooling with validation and confirmation for operational datasets.'
);

export default async function DataExchangePage() {
  const [role, data] = await Promise.all([getCurrentRole(), getImportantFeatureData('data_export_import')]);
  return (
    <AppShell title={data.title} subtitle={data.subtitle} role={role}>
      <ImportantFeatureDashboard data={data} customPanel={<DataExchangePanel />} />
    </AppShell>
  );
}
