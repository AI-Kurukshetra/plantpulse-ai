import { cache } from 'react';
import { hasSupabaseEnv, supabase } from '@/lib/supabaseClient';
import type { Alert, EnergyPoint, Equipment, Plant } from '@/types';
import type { Database } from '@/types/supabase';
import { getCachedOpenAISnapshot } from '@/lib/openaiPlantPulseData';
import { generateAlerts, generateDailyEnergy, generateHourlyEnergy, generateMockEquipment } from '@/utils/mockData';

type PlantRow = Database['public']['Tables']['plants']['Row'];
type EquipmentRow = Database['public']['Tables']['equipment']['Row'];
type AlertRow = Database['public']['Tables']['alerts']['Row'];
type SensorRow = Database['public']['Tables']['sensors']['Row'];
type MeasurementRow = Database['public']['Tables']['measurements']['Row'];
type EnergyRow = Database['public']['Tables']['energy_consumption']['Row'];
type EmissionsRow = Database['public']['Tables']['emissions']['Row'];
type FallbackSnapshot = {
  alerts: Alert[];
  dailyEnergy: EnergyPoint[];
  equipment: Equipment[];
  hourlyEnergy: EnergyPoint[];
  plant: Plant;
};

export async function getPrimaryPlantRow() {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.from('plants').select('*').order('created_at', { ascending: true }).limit(1);
  if (error || !data.length) {
    return null;
  }

  return data[0];
}

export function mapPlant(row: PlantRow): Plant {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    lineCount: 1,
    targetOee: Number(row.target_oee),
    timezone: row.timezone
  };
}

export function mapAlert(row: AlertRow): Alert {
  return {
    id: row.id,
    plantId: row.plant_id,
    equipmentId: row.equipment_id ?? 'unassigned',
    title: row.title,
    description: row.description,
    severity: row.severity,
    createdAt: row.created_at,
    acknowledged: row.acknowledged,
    source: row.source
  };
}

function latestById<T extends { [key: string]: unknown }>(
  rows: T[],
  idKey: keyof T,
  timeKey: keyof T
) {
  const latest = new Map<string, T>();

  for (const row of rows) {
    const id = String(row[idKey]);
    const current = latest.get(id);

    if (!current || new Date(String(row[timeKey])).getTime() > new Date(String(current[timeKey])).getTime()) {
      latest.set(id, row);
    }
  }

  return latest;
}

export function mapEquipmentRows(
  equipmentRows: EquipmentRow[],
  sensorRows: SensorRow[],
  measurementRows: MeasurementRow[],
  energyRows: EnergyRow[],
  emissionsRows: EmissionsRow[]
): Equipment[] {
  const latestMeasurements = latestById(measurementRows, 'sensor_id', 'recorded_at');
  const latestEnergyByEquipment = latestById(
    energyRows.filter((row) => Boolean(row.equipment_id)),
    'equipment_id',
    'measured_at'
  );
  const latestEmissionsByEquipment = latestById(
    emissionsRows.filter((row) => Boolean(row.equipment_id)),
    'equipment_id',
    'measured_at'
  );

  const getSensorValue = (equipmentId: string, sensorType: SensorRow['sensor_type']) => {
    const sensor = sensorRows.find((row) => row.equipment_id === equipmentId && row.sensor_type === sensorType);
    const measurement = sensor ? latestMeasurements.get(sensor.id) : undefined;
    return Number(measurement?.value ?? 0);
  };

  return equipmentRows.map((row) => {
    const latestEnergy = latestEnergyByEquipment.get(row.id) as EnergyRow | undefined;
    const latestEmissions = latestEmissionsByEquipment.get(row.id) as EmissionsRow | undefined;

    return {
      id: row.id,
      plantId: row.plant_id,
      name: row.name,
      category: row.category,
      status: row.status,
      temperature: Number(getSensorValue(row.id, 'temperature').toFixed(1)),
      vibration: Number(getSensorValue(row.id, 'vibration').toFixed(2)),
      runtimeHours: Math.round(getSensorValue(row.id, 'runtime')),
      healthScore: Number(row.health_score),
      serviceIntervalHours: row.service_interval_hours,
      lastServiceDate: row.installed_at ?? row.created_at,
      energyKwh: Number(latestEnergy?.usage_kwh ?? 0),
      emissionsKgCo2: Number(latestEmissions?.emissions_kg_co2 ?? 0)
    };
  });
}

function buildLocalPlantFallback(): FallbackSnapshot {
  const equipment = generateMockEquipment();
  const alerts = buildLocalFallbackAlerts();
  const hourlyEnergy = generateHourlyEnergy();
  const dailyEnergy = generateDailyEnergy();

  return {
    plant: {
      id: equipment[0]?.plantId ?? 'plant-1',
      name: 'Delta Forge Plant',
      location: 'Pune, India',
      lineCount: 4,
      targetOee: 87,
      timezone: 'Asia/Kolkata'
    } satisfies Plant,
    equipment,
    alerts,
    hourlyEnergy,
    dailyEnergy
  };
}

function buildLocalFallbackAlerts() {
  const equipment = generateMockEquipment();
  const alerts = generateAlerts(
    equipment
      .filter((asset) => asset.temperature > 80 || asset.vibration > 3.5 || asset.runtimeHours > asset.serviceIntervalHours)
      .map((asset) => ({
        equipmentId: asset.id,
        equipmentName: asset.name,
        reasons: [
          asset.temperature > 80 ? `Temperature threshold breached at ${asset.temperature} C` : '',
          asset.vibration > 3.5 ? `High vibration at ${asset.vibration} mm/s` : '',
          asset.runtimeHours > asset.serviceIntervalHours
            ? `Runtime exceeded service interval by ${asset.runtimeHours - asset.serviceIntervalHours} hours`
            : ''
        ].filter(Boolean),
        severity:
          asset.temperature > 80 && asset.vibration > 3.5
            ? 'critical'
            : ('warning' as const)
      }))
  );

  return alerts;
}

const getFallbackSnapshot = cache(async (): Promise<FallbackSnapshot> => {
  // OpenAI is used here to replace static dashboard dummy data with live AI-generated telemetry.
  const aiSnapshot = await getCachedOpenAISnapshot().catch(() => null);
  if (aiSnapshot) {
    return aiSnapshot;
  }

  return buildLocalPlantFallback();
});

export async function getFallbackPlant(): Promise<Plant> {
  const fallback = await getFallbackSnapshot();
  return fallback.plant;
}

export async function getFallbackEquipment(): Promise<Equipment[]> {
  const fallback = await getFallbackSnapshot();
  return fallback.equipment;
}

export async function getFallbackAlerts(): Promise<Alert[]> {
  const fallback = await getFallbackSnapshot();
  return fallback.alerts;
}

export async function getFallbackHourlyEnergy(): Promise<EnergyPoint[]> {
  const fallback = await getFallbackSnapshot();
  return fallback.hourlyEnergy;
}

export async function getFallbackDailyEnergy(): Promise<EnergyPoint[]> {
  const fallback = await getFallbackSnapshot();
  return fallback.dailyEnergy;
}

export function shouldUseFallback() {
  return !hasSupabaseEnv() || !supabase;
}
