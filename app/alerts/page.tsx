import { AnomalyDetectionDashboard } from '@/components/alerts/AnomalyDetectionDashboard';
import { AppShell } from '@/components/layout/AppShell';
import { getCurrentRole } from '@/lib/auth';
import { createPageMetadata } from '@/lib/metadata';
import { getAnomalyDetectionDashboardData } from '@/services/anomalyService';

export const metadata = createPageMetadata(
  'Anomaly Detection',
  'Machine learning-based anomaly detection across operations with AI-guided recommendations.'
);

export default async function AlertsPage() {
  const [role, anomalyData] = await Promise.all([getCurrentRole(), getAnomalyDetectionDashboardData()]);

  return (
    <AppShell
      title="Anomaly Detection Engine"
      subtitle="Detect operational deviations, predict impact severity, and act on AI-driven recommendations."
      role={role}
    >
      <AnomalyDetectionDashboard initialData={anomalyData} />
    </AppShell>
  );
}
