import type { MaintenanceRecommendation, MaintenanceScheduleItem, MockMaintenanceScheduleItem } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { getEquipmentStatus } from '@/services/equipmentService';
import { getPrimaryPlantRow, shouldUseFallback } from '@/services/serviceUtils';
import { generateMaintenanceRecommendations } from '@/utils/mockData';

function toRecommendation(asset: Awaited<ReturnType<typeof getEquipmentStatus>>[number]): MaintenanceRecommendation | null {
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

  if (!reasons.length) {
    return null;
  }

  return {
    equipmentId: asset.id,
    equipmentName: asset.name,
    reasons,
    severity: reasons.length > 1 ? 'critical' : 'warning'
  };
}

export async function getMaintenanceRecommendations(): Promise<MaintenanceRecommendation[]> {
  const equipment = await getEquipmentStatus();
  const recommendations = equipment
    .map((asset) => {
      if (asset.aiInsight?.recommendation) {
        // AI enrichment recommendation is preferred when available.
        return {
          equipmentId: asset.id,
          equipmentName: asset.name,
          reasons: [asset.aiInsight.recommendation],
          severity:
            asset.aiInsight.anomalyProbability > 0.8
              ? 'critical'
              : asset.aiInsight.anomalyProbability > 0.55
                ? 'warning'
                : 'info'
        } satisfies MaintenanceRecommendation;
      }
      return toRecommendation(asset);
    })
    .filter((item): item is MaintenanceRecommendation => Boolean(item));

  if (recommendations.length) {
    return recommendations;
  }

  return generateMaintenanceRecommendations(equipment);
}

export async function getMaintenanceSchedule(): Promise<MaintenanceScheduleItem[]> {
  const buildFallbackSchedule = async (): Promise<MaintenanceScheduleItem[]> => {
    const equipment = await getEquipmentStatus();
    const recommendations = await getMaintenanceRecommendations();
    const recommendationByEquipment = new Map(recommendations.map((item) => [item.equipmentId, item]));
    const fallbackAssets =
      equipment.length > 0
        ? equipment.slice(0, 6).map((item) => ({ id: item.id, name: item.name }))
        : [
            { id: 'fallback-eq-1', name: 'Compressor A-201' },
            { id: 'fallback-eq-2', name: 'Boiler B-104' },
            { id: 'fallback-eq-3', name: 'CNC Cell C-88' },
            { id: 'fallback-eq-4', name: 'Conveyor D-13' },
            { id: 'fallback-eq-5', name: 'Packaging E-52' },
            { id: 'fallback-eq-6', name: 'Pump F-09' }
          ];

    // Always provide baseline dummy live schedule rows for demos when DB rows are unavailable.
    return fallbackAssets.map((asset, index) => {
      const recommendation = recommendationByEquipment.get(asset.id);
      const status: MaintenanceScheduleItem['status'] =
        index === 0 ? 'in_progress' : index === 3 ? 'overdue' : index === 5 ? 'completed' : 'scheduled';

      return {
        id: `fallback-maint-${index + 1}`,
        equipmentId: asset.id,
        equipmentName: asset.name,
        scheduledFor: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
        serviceIntervalHours: 2400,
        status,
        notes: recommendation?.reasons.join(' | ') ?? 'Predictive maintenance window generated for demo tracking.',
        aiRecommendation: recommendation?.reasons[0] ?? 'Inspect vibration trend and confirm bearing alignment.'
      };
    });
  };

  if (shouldUseFallback()) {
    return buildFallbackSchedule();
  }

  const plantRow = await getPrimaryPlantRow();
  if (!plantRow || !supabase) {
    return [];
  }

  const { data: scheduleRows, error } = await supabase
    .from('maintenance_schedules')
    .select('*')
    .order('scheduled_for', { ascending: true })
    .limit(20);

  if (error || !scheduleRows?.length) {
    // Provide deterministic dummy schedule rows when live table is empty in hackathon/demo mode.
    return buildFallbackSchedule();
  }

  const equipment = await getEquipmentStatus();
  const equipmentById = new Map(equipment.map((item) => [item.id, item]));

  const mapped: MaintenanceScheduleItem[] = [];
  for (const row of scheduleRows) {
      const equipmentItem = equipmentById.get(row.equipment_id);
      if (!equipmentItem || equipmentItem.plantId !== plantRow.id) {
        continue;
      }

      mapped.push({
        id: row.id,
        equipmentId: row.equipment_id,
        equipmentName: equipmentItem.name,
        scheduledFor: row.scheduled_for,
        serviceIntervalHours: row.service_interval_hours,
        status: row.status,
        notes: row.notes,
        aiRecommendation: equipmentItem.aiInsight?.recommendation
      });
    }

  return mapped.length ? mapped : buildFallbackSchedule();
}

export async function getMockScheduledMaintenance(): Promise<MockMaintenanceScheduleItem[]> {
  const equipment = await getEquipmentStatus();
  const recommendations = await getMaintenanceRecommendations();
  const recommendationByEquipment = new Map(recommendations.map((item) => [item.equipmentId, item]));

  const maintenanceTypes: MockMaintenanceScheduleItem['maintenanceType'][] = [
    'inspection',
    'calibration',
    'preventive',
    'parts_replacement'
  ];

  const fallbackAssets =
    equipment.length > 0
      ? equipment
      : [
          { id: 'mock-eq-1', name: 'Compressor A-201' },
          { id: 'mock-eq-2', name: 'Boiler B-104' },
          { id: 'mock-eq-3', name: 'CNC Cell C-88' },
          { id: 'mock-eq-4', name: 'Pump F-09' }
        ];

  // Mock schedule stays deterministic to support QA/testing for predictive maintenance flows.
  return fallbackAssets.slice(0, 6).map((asset, index) => {
    const recommendation = recommendationByEquipment.get(asset.id);
    const status: MockMaintenanceScheduleItem['status'] = index % 4 === 3 ? 'completed' : 'scheduled';

    return {
      id: `mock-maint-${asset.id}-${index + 1}`,
      equipmentId: asset.id,
      equipmentName: asset.name,
      scheduledFor: new Date(Date.now() + (index + 1) * 36 * 60 * 60 * 1000).toISOString(),
      maintenanceType: maintenanceTypes[index % maintenanceTypes.length],
      status,
      notes: recommendation?.reasons[0] ?? 'Routine predictive servicing based on usage trend.'
    };
  });
}
