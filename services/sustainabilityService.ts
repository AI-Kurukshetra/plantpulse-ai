import { enrichEmissionsInsights, enrichSustainabilityScoringInsights } from '@/lib/openaiEnrichment';
import type {
  EmissionsAiInsights,
  EmissionsDashboardData,
  EmissionsRecord,
  EnergyPoint,
  SustainabilityScoringAiInsights,
  SustainabilityScoringDashboardData,
  SustainabilityScoringRecord,
  SustainabilityScoringTrendPoint,
  SustainabilitySnapshot
} from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { getEquipmentStatus } from '@/services/equipmentService';
import { getDailyEnergyConsumption } from '@/services/energyService';
import { getPrimaryPlant } from '@/services/plantService';
import { getPrimaryPlantRow, shouldUseFallback } from '@/services/serviceUtils';

export async function getSustainabilitySnapshot(): Promise<SustainabilitySnapshot> {
  const plant = await getPrimaryPlant();
  const dailyEnergy = await getDailyEnergyConsumption();

  if (shouldUseFallback() || !supabase) {
    const totalEnergyKwh = dailyEnergy.reduce((sum, row) => sum + row.usageKwh, 0);
    const totalEmissionsKgCo2 = Number((totalEnergyKwh * 0.42).toFixed(2));
    const sustainabilityScore = Math.max(
      0,
      Math.min(100, Number((82 + (plant.targetOee - 80) * 0.6 - totalEmissionsKgCo2 / 2500).toFixed(1)))
    );

    return {
      totalEnergyKwh: Number(totalEnergyKwh.toFixed(2)),
      totalEmissionsKgCo2,
      averageCarbonFactor: 0.42,
      sustainabilityScore,
      trendNarrative:
        plant.sustainabilityContext ??
        'Energy intensity is stable with moderate emission improvement opportunities in high-load windows.'
    };
  }

  const plantRow = await getPrimaryPlantRow();
  if (!plantRow) {
    return {
      totalEnergyKwh: 0,
      totalEmissionsKgCo2: 0,
      averageCarbonFactor: 0.42,
      sustainabilityScore: 0,
      trendNarrative: 'No sustainability data available for the selected plant.'
    };
  }

  const [{ data: energyRows }, { data: emissionsRows }] = await Promise.all([
    supabase
      .from('energy_consumption')
      .select('*')
      .eq('plant_id', plantRow.id)
      .order('measured_at', { ascending: false })
      .limit(200),
    supabase
      .from('emissions')
      .select('*')
      .eq('plant_id', plantRow.id)
      .order('measured_at', { ascending: false })
      .limit(200)
  ]);

  const totalEnergyKwh = Number(
    (energyRows ?? []).reduce((sum, row) => sum + Number(row.usage_kwh ?? 0), 0).toFixed(2)
  );
  const totalEmissionsKgCo2 = Number(
    (emissionsRows ?? []).reduce((sum, row) => sum + Number(row.emissions_kg_co2 ?? 0), 0).toFixed(2)
  );
  const averageCarbonFactor = Number(
    ((emissionsRows ?? []).reduce((sum, row) => sum + Number(row.carbon_factor ?? 0.42), 0) /
      Math.max((emissionsRows ?? []).length, 1)).toFixed(3)
  );
  const intensity = totalEnergyKwh > 0 ? totalEmissionsKgCo2 / totalEnergyKwh : 0.42;
  const sustainabilityScore = Math.max(
    0,
    Math.min(100, Number((88 - intensity * 45 + Math.max(plant.targetOee - 80, 0) * 0.45).toFixed(1)))
  );

  return {
    totalEnergyKwh,
    totalEmissionsKgCo2,
    averageCarbonFactor,
    sustainabilityScore,
    // Plant-level AI context is layered onto live sustainability metrics.
    trendNarrative:
      plant.sustainabilityContext ??
      'Emissions trend is near baseline. Prioritize high-runtime assets for the next reduction cycle.'
  };
}

export async function getSustainabilityTrend(): Promise<EnergyPoint[]> {
  const dailyEnergy = await getDailyEnergyConsumption();
  return dailyEnergy.map((point) => ({
    ...point,
    energyPerUnit: Number((point.energyPerUnit * 0.42).toFixed(3))
  }));
}

function deriveGasBreakdown(co2Kg: number, carbonFactor: number) {
  const normalizedFactor = Math.max(0.2, Math.min(0.95, carbonFactor));
  const noxKg = Number((co2Kg * (0.012 + normalizedFactor * 0.01)).toFixed(3));
  const soxKg = Number((co2Kg * (0.006 + normalizedFactor * 0.005)).toFixed(3));
  const ch4Kg = Number((co2Kg * (0.0018 + normalizedFactor * 0.0012)).toFixed(3));
  return { noxKg, soxKg, ch4Kg };
}

function buildMockEmissionsRecords(
  plantId: string,
  plantName: string,
  equipment: Awaited<ReturnType<typeof getEquipmentStatus>>
): EmissionsRecord[] {
  const assets =
    equipment.length > 0
      ? equipment
      : [
          { id: 'mock-eq-1', name: 'Compressor A-201', category: 'Compression', emissionsKgCo2: 56, energyKwh: 132 },
          { id: 'mock-eq-2', name: 'Boiler B-104', category: 'Utilities', emissionsKgCo2: 71, energyKwh: 164 },
          { id: 'mock-eq-3', name: 'CNC Cell C-88', category: 'Machining', emissionsKgCo2: 49, energyKwh: 128 }
        ];

  const rows: EmissionsRecord[] = [];
  for (let dayOffset = 13; dayOffset >= 0; dayOffset -= 1) {
    for (const [index, asset] of assets.slice(0, 6).entries()) {
      const co2Kg = Number((Math.max(8, Number(asset.emissionsKgCo2) || 40) * (0.82 + dayOffset * 0.014 + index * 0.03)).toFixed(2));
      const carbonFactor = Number((0.36 + ((dayOffset + index) % 5) * 0.016).toFixed(3));
      const breakdown = deriveGasBreakdown(co2Kg, carbonFactor);

      rows.push({
        id: `mock-em-${dayOffset}-${asset.id}-${index}`,
        plantId,
        plantName,
        equipmentId: asset.id,
        equipmentName: asset.name,
        equipmentCategory: asset.category,
        measuredAt: new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000).toISOString(),
        co2Kg,
        carbonFactor,
        ...breakdown,
        aiInsight:
          carbonFactor > 0.42
            ? 'Carbon factor elevated. Validate combustion tuning and process load balancing.'
            : 'Emissions stable for current operating window.'
      });
    }
  }

  return rows.sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());
}

function buildFallbackEmissionsInsights(records: EmissionsRecord[]): EmissionsAiInsights {
  const latestTen = records.slice(0, 10);
  const baselineTen = records.slice(10, 20);
  const latestAvg = latestTen.reduce((sum, row) => sum + row.co2Kg, 0) / Math.max(1, latestTen.length);
  const baselineAvg = baselineTen.reduce((sum, row) => sum + row.co2Kg, 0) / Math.max(1, baselineTen.length);
  const delta = latestAvg - baselineAvg;
  const anomalyCount = latestTen.filter((row) => row.carbonFactor > 0.44).length;

  return {
    trendSummary:
      delta > 0
        ? `CO2 trend is increasing by ${delta.toFixed(1)} kg versus prior period.`
        : `CO2 trend is down by ${Math.abs(delta).toFixed(1)} kg versus prior period.`,
    anomalySummary: `${anomalyCount} recent records exceed the high carbon-factor threshold.`,
    optimizationRecommendation: 'Prioritize combustion recalibration on high-load utility equipment during peak windows.',
    predictedNextPeriodCo2Kg: Number((latestAvg * 1.04).toFixed(2))
  };
}

export async function getEmissionsDashboardData(): Promise<EmissionsDashboardData> {
  const plant = await getPrimaryPlant();
  const plantId = plant.id;
  const plantName = plant.name;

  let records: EmissionsRecord[] = [];

  if (shouldUseFallback() || !supabase) {
    const equipment = await getEquipmentStatus();
    records = buildMockEmissionsRecords(plantId, plantName, equipment);
  } else {
    const plantRow = await getPrimaryPlantRow();
    if (!plantRow) {
      const equipment = await getEquipmentStatus();
      records = buildMockEmissionsRecords(plantId, plantName, equipment);
    } else {
      const [{ data: emissionsRows }, { data: equipmentRows }] = await Promise.all([
        supabase
          .from('emissions')
          .select('*')
          .eq('plant_id', plantRow.id)
          .order('measured_at', { ascending: false })
          .limit(320),
        supabase.from('equipment').select('id, name, category').eq('plant_id', plantRow.id)
      ]);

      const equipmentById = new Map((equipmentRows ?? []).map((row) => [row.id, row]));
      if (!emissionsRows?.length) {
        const equipment = await getEquipmentStatus();
        records = buildMockEmissionsRecords(plantRow.id, plantRow.name, equipment);
      } else {
        records = emissionsRows.map((row) => {
          const equipment = row.equipment_id ? equipmentById.get(row.equipment_id) : null;
          const co2Kg = Number(row.emissions_kg_co2 ?? 0);
          const carbonFactor = Number(row.carbon_factor ?? 0.42);
          const breakdown = deriveGasBreakdown(co2Kg, carbonFactor);

          return {
            id: String(row.id),
            plantId: row.plant_id,
            plantName: plantRow.name,
            equipmentId: row.equipment_id,
            equipmentName: equipment?.name ?? 'Plant Aggregate',
            equipmentCategory: equipment?.category ?? 'General',
            measuredAt: row.measured_at,
            co2Kg,
            carbonFactor,
            ...breakdown,
            aiInsight:
              carbonFactor > 0.44
                ? 'Anomaly candidate: carbon factor above expected baseline.'
                : 'Within expected emission profile.'
          } satisfies EmissionsRecord;
        });
      }
    }
  }

  // AI enrichment adds predictive trend/anomaly narrative on top of live-or-mock emissions data.
  const aiInsights =
    (await enrichEmissionsInsights(plantName, records).catch(() => null)) ?? buildFallbackEmissionsInsights(records);

  return {
    plantOptions: [{ id: records[0]?.plantId ?? plantId, name: records[0]?.plantName ?? plantName }],
    equipmentTypeOptions: Array.from(new Set(records.map((item) => item.equipmentCategory))).sort(),
    records,
    aiInsights
  };
}

function mapLineFromCategory(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes('util')) return 'Utility Line';
  if (normalized.includes('pack')) return 'Packaging Line';
  if (normalized.includes('mach')) return 'Machining Line';
  if (normalized.includes('compress')) return 'Compression Line';
  return 'Main Line';
}

function metricScoreLowerBetter(actual: number, benchmark: number) {
  if (actual <= 0 || benchmark <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, Number(((benchmark / actual) * 100).toFixed(1))));
}

function buildFallbackSustainabilityInsights(
  records: SustainabilityScoringRecord[],
  trend: SustainabilityScoringTrendPoint[]
): SustainabilityScoringAiInsights {
  const latest = trend[trend.length - 1];
  const previous = trend[Math.max(0, trend.length - 2)];
  const delta = latest && previous ? latest.sustainabilityScore - previous.sustainabilityScore : 0;
  const lagging = [...records].sort((a, b) => a.sustainabilityScore - b.sustainabilityScore)[0];

  return {
    trendSummary:
      delta >= 0
        ? `Sustainability score improved by ${delta.toFixed(1)} points in the latest period.`
        : `Sustainability score declined by ${Math.abs(delta).toFixed(1)} points in the latest period.`,
    benchmarkSummary: lagging
      ? `${lagging.line} is furthest from benchmark by ${(lagging.benchmarkScore - lagging.sustainabilityScore).toFixed(1)} points.`
      : 'Sustainability score is aligned with benchmark targets.',
    recommendation: 'Reduce high-carbon-factor windows and improve line-level energy intensity during peak production.',
    predictedNextScore: Number(Math.max(0, Math.min(100, (latest?.sustainabilityScore ?? 70) + 0.7)).toFixed(1))
  };
}

export async function getSustainabilityScoringDashboardData(): Promise<SustainabilityScoringDashboardData> {
  // Reuse emissions dataset source so sustainability scoring stays tied to live-or-fallback plant telemetry.
  const [plant, emissionsData, equipment] = await Promise.all([
    getPrimaryPlant(),
    getEmissionsDashboardData(),
    getEquipmentStatus()
  ]);

  const equipmentById = new Map(equipment.map((item) => [item.id, item]));
  const recordsByLine = new Map<
    string,
    {
      co2Sum: number;
      noxSum: number;
      soxSum: number;
      carbonFactorSum: number;
      energyPerUnitSum: number;
      count: number;
      equipmentCount: number;
    }
  >();

  for (const row of emissionsData.records) {
    const fallbackCategory = row.equipmentCategory || 'General';
    const line = mapLineFromCategory(fallbackCategory);
    const equipmentItem = row.equipmentId ? equipmentById.get(row.equipmentId) : null;
    const energyPerUnitEstimate = Math.max(0.4, Number(((equipmentItem?.energyKwh ?? row.co2Kg * 2.2) / 130).toFixed(2)));

    const current = recordsByLine.get(line) ?? {
      co2Sum: 0,
      noxSum: 0,
      soxSum: 0,
      carbonFactorSum: 0,
      energyPerUnitSum: 0,
      count: 0,
      equipmentCount: 0
    };

    current.co2Sum += row.co2Kg;
    current.noxSum += row.noxKg;
    current.soxSum += row.soxKg;
    current.carbonFactorSum += row.carbonFactor;
    current.energyPerUnitSum += energyPerUnitEstimate;
    current.count += 1;
    current.equipmentCount += equipmentItem ? 1 : 0;
    recordsByLine.set(line, current);
  }

  const benchmark = {
    energyPerUnit: 1.8,
    carbonFactor: 0.38,
    co2Kg: 48,
    noxKg: 0.9,
    soxKg: 0.45
  };

  const records: SustainabilityScoringRecord[] = Array.from(recordsByLine.entries()).map(([line, aggregate], index) => {
    const count = Math.max(1, aggregate.count);
    const energyPerUnit = Number((aggregate.energyPerUnitSum / count).toFixed(2));
    const carbonFactor = Number((aggregate.carbonFactorSum / count).toFixed(3));
    const co2Kg = Number((aggregate.co2Sum / count).toFixed(2));
    const noxKg = Number((aggregate.noxSum / count).toFixed(3));
    const soxKg = Number((aggregate.soxSum / count).toFixed(3));

    const scoreEnergy = metricScoreLowerBetter(energyPerUnit, benchmark.energyPerUnit);
    const scoreCarbon = metricScoreLowerBetter(carbonFactor, benchmark.carbonFactor);
    const scoreCo2 = metricScoreLowerBetter(co2Kg, benchmark.co2Kg);
    const scoreNox = metricScoreLowerBetter(noxKg, benchmark.noxKg);
    const scoreSox = metricScoreLowerBetter(soxKg, benchmark.soxKg);

    // Weighted industry benchmark scoring across carbon intensity and core pollutant indicators.
    const sustainabilityScore = Number(
      (scoreEnergy * 0.3 + scoreCarbon * 0.25 + scoreCo2 * 0.2 + scoreNox * 0.15 + scoreSox * 0.1).toFixed(1)
    );
    const benchmarkScore = 82;
    const trendDelta = Number(((sustainabilityScore - benchmarkScore) * 0.08 + Math.sin(index + 1) * 1.2).toFixed(1));

    return {
      line,
      plantId: plant.id,
      plantName: plant.name,
      sustainabilityScore,
      benchmarkScore,
      energyPerUnit,
      carbonFactor,
      co2Kg,
      noxKg,
      soxKg,
      trendDelta,
      aiInsight:
        sustainabilityScore < 72
          ? 'Score below benchmark. Prioritize line-level decarbonization and combustion tuning.'
          : 'Line is tracking near benchmark targets.'
    };
  });

  const trendByDate = new Map<string, { score: number; count: number }>();
  for (const row of emissionsData.records.slice().reverse()) {
    const label = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(row.measuredAt));
    const score = Number((metricScoreLowerBetter(row.carbonFactor, benchmark.carbonFactor) * 0.55 +
      metricScoreLowerBetter(row.co2Kg, benchmark.co2Kg) * 0.45).toFixed(1));
    const current = trendByDate.get(label) ?? { score: 0, count: 0 };
    current.score += score;
    current.count += 1;
    trendByDate.set(label, current);
  }

  const trend: SustainabilityScoringTrendPoint[] = Array.from(trendByDate.entries())
    .slice(-14)
    .map(([label, value]) => ({
      label,
      sustainabilityScore: Number((value.score / Math.max(1, value.count)).toFixed(1)),
      benchmarkScore: 82
    }));

  // AI enrichment generates benchmark narrative and next-score projection without changing score structure.
  const aiInsights =
    (await enrichSustainabilityScoringInsights(plant.name, records, trend).catch(() => null)) ??
    buildFallbackSustainabilityInsights(records, trend);

  return {
    plantOptions: [{ id: plant.id, name: plant.name }],
    lineOptions: Array.from(new Set(records.map((row) => row.line))).sort(),
    records,
    trend,
    aiInsights
  };
}
