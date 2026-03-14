import { PredictiveMaintenanceDashboard } from '@/components/maintenance/PredictiveMaintenanceDashboard';
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
  const [recommendations, schedule, mockSchedule] = await Promise.all([
    getMaintenanceRecommendations(),
    getMaintenanceSchedule(),
    getMockScheduledMaintenance()
  ]);

  return (
    <PredictiveMaintenanceDashboard
      recommendations={recommendations}
      schedule={schedule}
      mockSchedule={mockSchedule}
    />
  );
}
