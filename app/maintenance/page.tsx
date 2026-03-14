import { AppShell } from '@/components/layout/AppShell';
import { PredictiveMaintenanceDashboard } from '@/components/maintenance/PredictiveMaintenanceDashboard';
import { getCurrentRole } from '@/lib/auth';
import { createPageMetadata } from '@/lib/metadata';
import {
  getMaintenanceRecommendations,
  getMaintenanceSchedule,
  getMockScheduledMaintenance
} from '@/services/maintenanceService';

export const metadata = createPageMetadata(
  'Predictive Maintenance',
  'Predictive maintenance view with AI-assisted recommendations and schedule execution status.'
);

export default async function MaintenancePage() {
  const [role, recommendations, schedule, mockSchedule] = await Promise.all([
    getCurrentRole(),
    getMaintenanceRecommendations(),
    getMaintenanceSchedule(),
    getMockScheduledMaintenance()
  ]);

  return (
    <AppShell
      title="Predictive Maintenance"
      subtitle="AI-assisted maintenance planning, schedule execution, and asset-level intervention guidance."
      role={role}
    >
      <PredictiveMaintenanceDashboard
        recommendations={recommendations}
        schedule={schedule}
        mockSchedule={mockSchedule}
      />
    </AppShell>
  );
}
