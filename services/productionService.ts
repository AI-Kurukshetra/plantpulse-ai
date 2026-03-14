import { enrichProductionEfficiencyInsights } from '@/lib/openaiEnrichment';
import { supabase } from '@/lib/supabaseClient';
import type {
  ProductionEfficiencyAiInsights,
  ProductionEfficiencyDashboardData,
  ProductionEfficiencyRecord,
  ProductionTrendPoint
} from '@/types';
import { getEquipmentStatus } from '@/services/equipmentService';
import { getPrimaryPlant } from '@/services/plantService';
import { getPrimaryPlantRow, shouldUseFallback } from '@/services/serviceUtils';

function mapLineFromCategory(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes('util')) return 'Utility Line';
  if (normalized.includes('pack')) return 'Packaging Line';
  if (normalized.includes('mach')) return 'Machining Line';
  if (normalized.includes('compress')) return 'Compression Line';
  return 'Main Line';
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildFallbackTrend(records: ProductionEfficiencyRecord[]): ProductionTrendPoint[] {
  const baseOee = records.length
    ? records.reduce((sum, row) => sum + row.oee, 0) / records.length
    : 74;
  const baseThroughput = records.length
    ? records.reduce((sum, row) => sum + row.throughput, 0) / records.length
    : 320;
  const baseDefectRate = records.length
    ? records.reduce((sum, row) => sum + row.defectRate, 0) / records.length
    : 4.8;

  return Array.from({ length: 14 }, (_, index) => {
    const dayOffset = 13 - index;
    return {
      label: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
        new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000)
      ),
      oee: Number(clamp(baseOee + Math.sin(index / 2.1) * 3.4, 45, 95).toFixed(1)),
      throughput: Number(clamp(baseThroughput + Math.cos(index / 2.3) * 36, 120, 920).toFixed(1)),
      defectRate: Number(clamp(baseDefectRate + Math.sin(index / 2.7) * 0.9, 0.3, 15).toFixed(2))
    };
  });
}

function buildFallbackAiInsights(
  records: ProductionEfficiencyRecord[],
  trend: ProductionTrendPoint[]
): ProductionEfficiencyAiInsights {
  const bottleneck = [...records].sort((a, b) => b.bottleneckRisk - a.bottleneckRisk)[0];
  const latest = trend[trend.length - 1];
  const prior = trend[Math.max(0, trend.length - 2)];
  const oeeDelta = latest && prior ? latest.oee - prior.oee : 0;

  return {
    trendSummary:
      oeeDelta >= 0
        ? `OEE improved by ${oeeDelta.toFixed(1)} points in the latest period.`
        : `OEE dropped by ${Math.abs(oeeDelta).toFixed(1)} points in the latest period.`,
    bottleneckPrediction: bottleneck
      ? `${bottleneck.equipmentName} is the highest bottleneck risk at ${bottleneck.bottleneckRisk.toFixed(1)}%.`
      : 'No bottleneck candidates found from current dataset.',
    recommendation: 'Increase preventive checks on high-vibration assets and rebalance load across lines.',
    predictedNextOee: Number(clamp((latest?.oee ?? 72) + 0.8, 0, 100).toFixed(1))
  };
}

export async function getProductionEfficiencyDashboardData(): Promise<ProductionEfficiencyDashboardData> {
  const [plant, equipment] = await Promise.all([getPrimaryPlant(), getEquipmentStatus()]);
  const plantId = plant.id;
  const plantName = plant.name;

  let energyRows:
    | Array<{
        equipment_id: string | null;
        measured_at: string;
        production_units: number;
      }>
    | null = null;

  // Data source: production_units is read from Supabase energy_consumption when available.
  if (!shouldUseFallback() && supabase) {
    const plantRow = await getPrimaryPlantRow();
    if (plantRow) {
      const { data } = await supabase
        .from('energy_consumption')
        .select('equipment_id, measured_at, production_units')
        .eq('plant_id', plantRow.id)
        .order('measured_at', { ascending: false })
        .limit(420);
      energyRows = data ?? null;
    }
  }

  const rowsByEquipment = new Map<string, Array<{ measured_at: string; production_units: number }>>();
  for (const row of energyRows ?? []) {
    if (!row.equipment_id) continue;
    const list = rowsByEquipment.get(row.equipment_id) ?? [];
    list.push({ measured_at: row.measured_at, production_units: Number(row.production_units ?? 0) });
    rowsByEquipment.set(row.equipment_id, list);
  }

  const records: ProductionEfficiencyRecord[] = equipment.map((asset, index) => {
    const line = mapLineFromCategory(asset.category);
    const productionRows = rowsByEquipment.get(asset.id) ?? [];
    const throughputFromRows = productionRows.reduce((sum, row) => sum + row.production_units, 0);
    const throughput = Number((throughputFromRows || 260 + index * 22 + asset.runtimeHours * 0.01).toFixed(1));
    const availabilityBase =
      asset.status === 'running' ? 0.94 : asset.status === 'idle' ? 0.78 : asset.status === 'maintenance' ? 0.63 : 0.4;
    const availability = clamp(availabilityBase + asset.healthScore / 900, 0.35, 0.99);
    const performance = clamp(throughput / Math.max(260, asset.serviceIntervalHours * 0.12), 0.5, 1.04);
    const defectRate = clamp(
      2 + Math.max(0, asset.vibration - 3.0) * 1.9 + Math.max(0, asset.temperature - 82) * 0.08,
      0.4,
      18
    );
    const quality = clamp(1 - defectRate / 100, 0.6, 0.995);
    const oee = Number((availability * performance * quality * 100).toFixed(1));
    const bottleneckRisk = Number(
      clamp((100 - oee) * 0.55 + (defectRate * 2.4) + (asset.aiInsight?.anomalyProbability ?? 0) * 36, 4, 99).toFixed(1)
    );

    return {
      equipmentId: asset.id,
      equipmentName: asset.name,
      equipmentType: asset.category,
      line,
      status: asset.status,
      availability: Number((availability * 100).toFixed(1)),
      performance: Number((performance * 100).toFixed(1)),
      quality: Number((quality * 100).toFixed(1)),
      oee,
      throughput,
      defectRate: Number(defectRate.toFixed(2)),
      yieldRate: Number((quality * 100).toFixed(1)),
      bottleneckRisk,
      aiInsight:
        asset.aiInsight?.recommendation ??
        (bottleneckRisk > 68
          ? 'Potential bottleneck risk detected. Schedule focused reliability intervention.'
          : 'Performance in expected range.')
    };
  });

  let trend: ProductionTrendPoint[] = [];
  if (energyRows?.length) {
    const byDay = new Map<string, { throughput: number }>();
    for (const row of energyRows) {
      const label = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(row.measured_at));
      const current = byDay.get(label) ?? { throughput: 0 };
      current.throughput += Number(row.production_units ?? 0);
      byDay.set(label, current);
    }

    const ordered = Array.from(byDay.entries()).slice(-14);
    const baselineOee = records.reduce((sum, row) => sum + row.oee, 0) / Math.max(1, records.length);
    const baselineDefect = records.reduce((sum, row) => sum + row.defectRate, 0) / Math.max(1, records.length);
    trend = ordered.map(([label, point], index) => ({
      label,
      throughput: Number(point.throughput.toFixed(1)),
      oee: Number(clamp(baselineOee + Math.sin(index / 2.2) * 2.8, 40, 96).toFixed(1)),
      defectRate: Number(clamp(baselineDefect + Math.cos(index / 2.5) * 0.7, 0.2, 18).toFixed(2))
    }));
  }

  if (!trend.length) {
    trend = buildFallbackTrend(records);
  }

  // AI enrichment adds predictive bottleneck and next-period efficiency guidance on top of live/mock records.
  const aiInsights =
    (await enrichProductionEfficiencyInsights(plantName, records, trend).catch(() => null)) ??
    buildFallbackAiInsights(records, trend);

  return {
    plantOptions: [{ id: plantId, name: plantName }],
    lineOptions: Array.from(new Set(records.map((row) => row.line))).sort(),
    records,
    trend,
    aiInsights
  };
}
