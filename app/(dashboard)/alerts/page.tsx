import { AnomalyDetectionDashboard } from '@/components/alerts/AnomalyDetectionDashboard';
import { createPageMetadata } from '@/lib/metadata';
import { getAnomalyDetectionDashboardData } from '@/services/anomalyService';

export const metadata = createPageMetadata(
  'Anomaly Detection',
  'Machine learning-based anomaly detection across operations with AI-guided recommendations.'
);

export default async function AlertsPage() {
  const anomalyData = await getAnomalyDetectionDashboardData();

  return <AnomalyDetectionDashboard initialData={anomalyData} />;
}
