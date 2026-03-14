import { EquipmentHealthMonitoring } from '@/components/equipment/EquipmentHealthMonitoring';
import { AppShell } from '@/components/layout/AppShell';
import { getCurrentRole } from '@/lib/auth';
import { createPageMetadata } from '@/lib/metadata';
import { getAlerts } from '@/services/alertsService';
import { getEquipmentStatus } from '@/services/equipmentService';

export const metadata = createPageMetadata(
  'Equipment Health',
  'Equipment health monitoring for PlantPulse AI with temperature, vibration, runtime, and health indicators.'
);

export default async function EquipmentPage() {
  const [equipment, alerts] = await Promise.all([getEquipmentStatus(), getAlerts(20)]);
  const role = await getCurrentRole();

  return (
    <AppShell
      title="Equipment Health"
      subtitle="Temperature, vibration, runtime, and health score tracking for critical assets."
      role={role}
    >
      <EquipmentHealthMonitoring initialEquipment={equipment} initialAlerts={alerts} />
    </AppShell>
  );
}
