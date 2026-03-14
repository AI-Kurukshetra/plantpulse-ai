import { enrichDailyEnergyData } from '@/lib/openaiEnrichment';
import type { DashboardMetrics, EnergyPoint, Equipment } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import {
  getFallbackDailyEnergy,
  getFallbackHourlyEnergy,
  getPrimaryPlantRow,
  shouldUseFallback
} from '@/services/serviceUtils';

function formatHourLabel(value: string) {
  const date = new Date(value);
  return `${String(date.getHours()).padStart(2, '0')}:00`;
}

function formatDayLabel(value: string) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(value));
}

function aggregateEnergy(
  rows: Array<{ measured_at: string; usage_kwh: number; production_units: number; energy_per_unit: number | null }>,
  formatLabel: (value: string) => string
) {
  const aggregated = new Map<string, { usageKwh: number; productionUnits: number }>();

  for (const row of rows) {
    const label = formatLabel(row.measured_at);
    const current = aggregated.get(label) ?? { usageKwh: 0, productionUnits: 0 };

    aggregated.set(label, {
      usageKwh: Number((current.usageKwh + Number(row.usage_kwh)).toFixed(2)),
      productionUnits: current.productionUnits + row.production_units
    });
  }

  return Array.from(aggregated.entries()).map(([label, value]) => ({
    label,
    usageKwh: value.usageKwh,
    productionUnits: value.productionUnits,
    energyPerUnit: value.productionUnits ? Number((value.usageKwh / value.productionUnits).toFixed(2)) : 0
  }));
}

async function getEnergyRows(limit: number) {
  const plantRow = await getPrimaryPlantRow();
  if (!plantRow || !supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('energy_consumption')
    .select('*')
    .eq('plant_id', plantRow.id)
    .order('measured_at', { ascending: true })
    .limit(limit);

  if (error || !data?.length) {
    return null;
  }

  return data;
}

export async function getHourlyEnergyConsumption(): Promise<EnergyPoint[]> {
  if (shouldUseFallback()) {
    return await getFallbackHourlyEnergy();
  }

  const rows = await getEnergyRows(48);
  return rows ? aggregateEnergy(rows.slice(-12), formatHourLabel) : await getFallbackHourlyEnergy();
}

export async function getDailyEnergyConsumption(): Promise<EnergyPoint[]> {
  if (shouldUseFallback()) {
    return await getFallbackDailyEnergy();
  }

  const rows = await getEnergyRows(168);
  if (!rows) {
    return await getFallbackDailyEnergy();
  }

  const aggregated = aggregateEnergy(rows.slice(-56), formatDayLabel);
  // AI enrichment layers predictive demand and optimization tips onto Supabase daily aggregates.
  return enrichDailyEnergyData(aggregated).catch(() => aggregated);
}

export async function getDashboardMetrics(
  equipment: Equipment[],
  alertsCount: number
): Promise<DashboardMetrics> {
  const hourlyEnergy = await getHourlyEnergyConsumption();
  const totalEnergyKwh = hourlyEnergy.reduce((sum, point) => sum + point.usageKwh, 0);
  const throughput = hourlyEnergy.reduce((sum, point) => sum + point.productionUnits, 0);
  const equipmentOnline = equipment.filter((item) => item.status === 'running').length;
  const totalEquipment = equipment.length;
  const availability = totalEquipment ? equipmentOnline / totalEquipment : 0;
  const performance = 0.92;
  const quality = 0.97;
  const oee = Number((availability * performance * quality * 100).toFixed(1));
  const emissionsKgCo2 = Number(
    equipment.reduce((sum, item) => sum + Number(item.emissionsKgCo2 || 0), 0).toFixed(1)
  );

  return {
    oee,
    throughput,
    activeAlerts: alertsCount,
    equipmentOnline,
    totalEquipment,
    totalEnergyKwh: Number(totalEnergyKwh.toFixed(1)),
    emissionsKgCo2
  };
}
