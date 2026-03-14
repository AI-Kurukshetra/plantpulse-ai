import { ImportantFeatureDashboard } from '@/components/important/ImportantFeatureDashboard';
import { AppShell } from '@/components/layout/AppShell';
import { getCurrentRole } from '@/lib/auth';
import { createPageMetadata } from '@/lib/metadata';
import { getImportantFeatureData } from '@/services/importantFeaturesService';

export const metadata = createPageMetadata(
  'Historical Data Analysis',
  'Time-series analytics for trend identification and continuous operational improvement.'
);

export default async function HistoricalAnalysisPage() {
  const [role, data] = await Promise.all([getCurrentRole(), getImportantFeatureData('historical_analysis')]);
  return (
    <AppShell title={data.title} subtitle={data.subtitle} role={role}>
      <ImportantFeatureDashboard data={data} />
    </AppShell>
  );
}
