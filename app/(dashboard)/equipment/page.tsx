import { EquipmentHealthMonitoring } from '@/components/equipment/EquipmentHealthMonitoring';
import { createPageMetadata } from '@/lib/metadata';
import { getAlerts } from '@/services/alertsService';
import { getEquipmentStatus } from '@/services/equipmentService';

export const metadata = createPageMetadata(
  'Equipment Health',
  'Equipment health monitoring for PlantPulse AI with temperature, vibration, runtime, and health indicators.'
);

export default async function EquipmentPage() {
  const [equipment, alerts] = await Promise.all([getEquipmentStatus(), getAlerts(20)]);

  return <EquipmentHealthMonitoring initialEquipment={equipment} initialAlerts={alerts} />;
}
