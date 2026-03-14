import {
  Alert,
  DashboardMetrics,
  DashboardPayload,
  EnergyPoint,
  Equipment,
  MaintenanceRecommendation,
  Plant
} from '@/types';

const plant: Plant = {
  id: 'plant-1',
  name: 'Delta Forge Plant',
  location: 'Pune, India',
  lineCount: 4,
  targetOee: 87
};

const equipmentSeed: Array<Pick<Equipment, 'name' | 'category' | 'status'>> = [
  { name: 'Compressor A-201', category: 'Compression', status: 'running' },
  { name: 'Boiler B-104', category: 'Utilities', status: 'maintenance' },
  { name: 'CNC Cell C-88', category: 'Machining', status: 'running' },
  { name: 'Conveyor D-13', category: 'Material Flow', status: 'idle' },
  { name: 'Packaging E-52', category: 'Packaging', status: 'running' },
  { name: 'Pump F-09', category: 'Pumping', status: 'offline' }
];

function deterministicVariance(seed: number) {
  return Math.sin(seed * 7.3) * 0.5 + Math.cos(seed * 3.1) * 0.5;
}

export function generateMockEquipment(): Equipment[] {
  return equipmentSeed.map((item, index) => {
    const variance = deterministicVariance(index + 1);
    const temperature = Number((72 + variance * 18 + index * 2.3).toFixed(1));
    const vibration = Number((2.1 + variance * 1.4 + index * 0.35).toFixed(2));
    const runtimeHours = 1640 + index * 420;
    const healthScore = Math.max(54, Math.min(96, Math.round(91 - index * 6 - variance * 12)));
    const energyKwh = Math.round(380 + index * 92 + variance * 60);
    const emissionsKgCo2 = Math.round(energyKwh * 0.42);

    return {
      id: `eq-${index + 1}`,
      plantId: plant.id,
      name: item.name,
      category: item.category,
      status: item.status,
      temperature,
      vibration,
      runtimeHours,
      healthScore,
      serviceIntervalHours: 2400,
      lastServiceDate: new Date(Date.now() - (index + 3) * 86400000 * 12).toISOString(),
      energyKwh,
      emissionsKgCo2
    };
  });
}

export function generateHourlyEnergy(): EnergyPoint[] {
  return Array.from({ length: 12 }, (_, index) => {
    const hour = `${String(index * 2).padStart(2, '0')}:00`;
    const usageKwh = 320 + Math.round(Math.sin(index / 1.7) * 90 + index * 10);
    const productionUnits = 180 + Math.round(Math.cos(index / 2.2) * 18 + index * 5);

    return {
      label: hour,
      usageKwh,
      productionUnits,
      energyPerUnit: Number((usageKwh / productionUnits).toFixed(2))
    };
  });
}

export function generateDailyEnergy(): EnergyPoint[] {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label, index) => {
    const usageKwh = 4200 + Math.round(Math.sin(index * 0.8) * 460 + index * 120);
    const productionUnits = 2400 + Math.round(Math.cos(index * 0.65) * 140 + index * 110);

    return {
      label,
      usageKwh,
      productionUnits,
      energyPerUnit: Number((usageKwh / productionUnits).toFixed(2))
    };
  });
}

export function generateMaintenanceRecommendations(equipment: Equipment[]): MaintenanceRecommendation[] {
  const recommendations: Array<MaintenanceRecommendation | null> = equipment
    .map((asset) => {
      const reasons: string[] = [];

      if (asset.vibration > 3.8) {
        reasons.push(`High vibration at ${asset.vibration} mm/s`);
      }

      if (asset.temperature > 88) {
        reasons.push(`Temperature threshold breached at ${asset.temperature} C`);
      }

      if (asset.runtimeHours > asset.serviceIntervalHours) {
        reasons.push(`Runtime exceeded service interval by ${asset.runtimeHours - asset.serviceIntervalHours} hours`);
      }

      if (reasons.length === 0) {
        return null;
      }

      return {
        equipmentId: asset.id,
        equipmentName: asset.name,
        reasons,
        severity: reasons.length > 1 ? 'critical' : 'warning'
      };
    });

  return recommendations.filter((item): item is MaintenanceRecommendation => item !== null);
}

export function generateAlerts(maintenance: MaintenanceRecommendation[]): Alert[] {
  return maintenance.map((item, index) => ({
    id: `alert-${index + 1}`,
    equipmentId: item.equipmentId,
    title: `${item.equipmentName} requires inspection`,
    description: item.reasons.join(' | '),
    severity: item.severity,
    createdAt: new Date(Date.now() - (index + 1) * 3600000).toISOString(),
    acknowledged: index > 1
  }));
}

export function buildDashboardMetrics(
  equipment: Equipment[],
  alerts: Alert[],
  hourlyEnergy: EnergyPoint[]
): DashboardMetrics {
  const equipmentOnline = equipment.filter((item) => item.status === 'running').length;
  const availability = equipmentOnline / equipment.length;
  const performance = 0.91;
  const quality = 0.97;
  const oee = availability * performance * quality * 100;
  const throughput = hourlyEnergy.reduce((sum, item) => sum + item.productionUnits, 0);
  const totalEnergyKwh = hourlyEnergy.reduce((sum, item) => sum + item.usageKwh, 0);
  const emissionsKgCo2 = equipment.reduce((sum, item) => sum + item.emissionsKgCo2, 0);

  return {
    oee: Number(oee.toFixed(1)),
    throughput,
    activeAlerts: alerts.filter((item) => !item.acknowledged).length,
    equipmentOnline,
    totalEquipment: equipment.length,
    totalEnergyKwh,
    emissionsKgCo2
  };
}

export function generateDashboardPayload(): DashboardPayload {
  const equipment = generateMockEquipment();
  const hourlyEnergy = generateHourlyEnergy();
  const dailyEnergy = generateDailyEnergy();
  const maintenance = generateMaintenanceRecommendations(equipment);
  const alerts = generateAlerts(maintenance);
  const metrics = buildDashboardMetrics(equipment, alerts, hourlyEnergy);

  return {
    plant,
    metrics,
    equipment,
    alerts,
    hourlyEnergy,
    dailyEnergy,
    maintenance
  };
}
