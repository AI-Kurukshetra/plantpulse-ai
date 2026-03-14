import { createHash } from 'node:crypto';
import { unstable_cache } from 'next/cache';
import { z } from 'zod';
import type {
  AnomalyDetectionAiInsights,
  AnomalyDetectionRecord,
  AnomalyTrendPoint,
  Alert,
  EmissionsAiInsights,
  EmissionsRecord,
  EnergyPoint,
  Equipment,
  Plant,
  ProductionEfficiencyAiInsights,
  ProductionEfficiencyRecord,
  ProductionTrendPoint,
  SustainabilityScoringAiInsights,
  SustainabilityScoringRecord,
  SustainabilityScoringTrendPoint
} from '@/types';

const equipmentInsightSchema = z.object({
  equipmentId: z.string().min(1),
  recommendation: z.string().min(1),
  anomalyProbability: z.number().min(0).max(1),
  predictedFailureWindowHours: z.number().int().min(1),
  summary: z.string().min(1)
});

const alertsSummarySchema = z.object({
  id: z.string().min(1),
  summary: z.string().min(1),
  recommendedAction: z.string().min(1)
});

const syntheticAlertSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  severity: z.enum(['critical', 'warning', 'info']),
  equipmentId: z.string().optional()
});

const equipmentPayloadSchema = z.object({
  type: z.literal('equipment'),
  equipmentInsights: z.array(equipmentInsightSchema)
});

const alertsPayloadSchema = z.object({
  type: z.literal('alerts'),
  alertSummaries: z.array(alertsSummarySchema),
  syntheticAlerts: z.array(syntheticAlertSchema)
});

const energyPayloadSchema = z.object({
  type: z.literal('energy'),
  trendSummary: z.string().min(1),
  forecastNextDayKwh: z.number().min(0),
  optimizationTip: z.string().min(1)
});

const plantPayloadSchema = z.object({
  type: z.literal('plant'),
  summary: z.string().min(1),
  sustainabilityContext: z.string().min(1)
});

const emissionsPayloadSchema = z.object({
  type: z.literal('emissions'),
  trendSummary: z.string().min(1),
  anomalySummary: z.string().min(1),
  optimizationRecommendation: z.string().min(1),
  predictedNextPeriodCo2Kg: z.number().min(0)
});

const productionPayloadSchema = z.object({
  type: z.literal('production_efficiency'),
  trendSummary: z.string().min(1),
  bottleneckPrediction: z.string().min(1),
  recommendation: z.string().min(1),
  predictedNextOee: z.number().min(0).max(100)
});

const sustainabilityScoringPayloadSchema = z.object({
  type: z.literal('sustainability_scoring'),
  trendSummary: z.string().min(1),
  benchmarkSummary: z.string().min(1),
  recommendation: z.string().min(1),
  predictedNextScore: z.number().min(0).max(100)
});

const anomalyPayloadSchema = z.object({
  type: z.literal('anomaly_detection'),
  trendSummary: z.string().min(1),
  anomalyHotspot: z.string().min(1),
  recommendation: z.string().min(1),
  predictedNextAnomalyCount: z.number().int().min(0)
});

const enrichmentResponseSchema = z.union([
  equipmentPayloadSchema,
  alertsPayloadSchema,
  energyPayloadSchema,
  plantPayloadSchema,
  emissionsPayloadSchema,
  productionPayloadSchema,
  sustainabilityScoringPayloadSchema,
  anomalyPayloadSchema
]);

type EnrichmentResponse = z.infer<typeof enrichmentResponseSchema>;

function extractResponseText(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const maybeOutputText = (payload as { output_text?: unknown }).output_text;
  if (typeof maybeOutputText === 'string' && maybeOutputText.trim()) {
    return maybeOutputText;
  }

  const output = (payload as { output?: unknown }).output;
  if (!Array.isArray(output)) {
    return null;
  }

  for (const item of output) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) {
      continue;
    }
    for (const part of content) {
      if (!part || typeof part !== 'object') {
        continue;
      }
      const text = (part as { text?: unknown }).text;
      if (typeof text === 'string' && text.trim()) {
        return text;
      }
    }
  }

  return null;
}

const getCachedEnrichment = unstable_cache(
  async (requestType: EnrichmentRequest['type'], payloadHash: string, payloadJson: string): Promise<EnrichmentResponse | null> => {
    void payloadHash;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return null;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          temperature: 0.25,
          max_output_tokens: 1000,
          input: [
            {
              role: 'system',
              content:
                'You enrich manufacturing telemetry with concise, actionable AI context. Return strict JSON only. Never include markdown.'
            },
            {
              role: 'user',
              content: `Type: ${requestType}\nPayload hash: ${payloadHash}\nPayload:\n${payloadJson}\n\nRules:\n- keep IDs unchanged when provided\n- concise language\n- no hallucinated assets outside payload\n- severity only critical/warning/info for synthetic alerts`
            }
          ]
        })
      });

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as unknown;
      const text = extractResponseText(payload);
      if (!text) {
        return null;
      }

      const parsed = JSON.parse(text);
      return enrichmentResponseSchema.parse(parsed);
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  },
  ['plantpulse-hybrid-ai-enrichment'],
  { revalidate: 90 }
);

type EnrichmentRequest =
  | {
      type: 'equipment';
      equipment: Array<
        Pick<
          Equipment,
          'category' | 'emissionsKgCo2' | 'energyKwh' | 'healthScore' | 'id' | 'name' | 'runtimeHours' | 'status' | 'temperature' | 'vibration'
        >
      >;
      plant: Pick<Plant, 'id' | 'name' | 'targetOee'>;
    }
  | {
      type: 'alerts';
      alerts: Array<Pick<Alert, 'description' | 'equipmentId' | 'id' | 'severity' | 'title'>>;
      plantId: string;
    }
  | {
      type: 'energy';
      dailyEnergy: Array<Pick<EnergyPoint, 'energyPerUnit' | 'label' | 'productionUnits' | 'usageKwh'>>;
    }
  | {
      type: 'plant';
      plant: Pick<Plant, 'id' | 'lineCount' | 'location' | 'name' | 'targetOee' | 'timezone'>;
    }
  | {
      type: 'emissions';
      plantName: string;
      records: Array<
        Pick<
          EmissionsRecord,
          'carbonFactor' | 'ch4Kg' | 'co2Kg' | 'equipmentCategory' | 'equipmentName' | 'measuredAt' | 'noxKg' | 'soxKg'
        >
      >;
    }
  | {
      type: 'production_efficiency';
      plantName: string;
      records: Array<
        Pick<
          ProductionEfficiencyRecord,
          | 'availability'
          | 'bottleneckRisk'
          | 'defectRate'
          | 'equipmentName'
          | 'equipmentType'
          | 'line'
          | 'oee'
          | 'performance'
          | 'quality'
          | 'throughput'
        >
      >;
      trend: Array<Pick<ProductionTrendPoint, 'defectRate' | 'label' | 'oee' | 'throughput'>>;
    }
  | {
      type: 'sustainability_scoring';
      plantName: string;
      records: Array<
        Pick<
          SustainabilityScoringRecord,
          | 'benchmarkScore'
          | 'carbonFactor'
          | 'co2Kg'
          | 'energyPerUnit'
          | 'line'
          | 'noxKg'
          | 'soxKg'
          | 'sustainabilityScore'
          | 'trendDelta'
        >
      >;
      trend: Array<Pick<SustainabilityScoringTrendPoint, 'benchmarkScore' | 'label' | 'sustainabilityScore'>>;
    }
  | {
      type: 'anomaly_detection';
      plantName: string;
      records: Array<
        Pick<
          AnomalyDetectionRecord,
          | 'anomalyScore'
          | 'equipmentName'
          | 'equipmentType'
          | 'measuredAt'
          | 'predictedImpact'
          | 'severity'
          | 'source'
        >
      >;
      trend: Array<Pick<AnomalyTrendPoint, 'anomalyCount' | 'averageScore' | 'label'>>;
    };

function stableHash(input: string) {
  return createHash('sha256').update(input).digest('hex').slice(0, 24);
}

async function requestEnrichment(request: EnrichmentRequest) {
  const payloadJson = JSON.stringify(request);
  const payloadHash = stableHash(payloadJson);
  return getCachedEnrichment(request.type, payloadHash, payloadJson);
}

export async function enrichEquipmentData(
  plant: Pick<Plant, 'id' | 'name' | 'targetOee'>,
  equipment: Equipment[]
): Promise<Equipment[]> {
  const result = await requestEnrichment({
    type: 'equipment',
    plant,
    equipment: equipment.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      status: item.status,
      temperature: item.temperature,
      vibration: item.vibration,
      runtimeHours: item.runtimeHours,
      healthScore: item.healthScore,
      energyKwh: item.energyKwh,
      emissionsKgCo2: item.emissionsKgCo2
    }))
  });

  if (!result || result.type !== 'equipment') {
    return equipment;
  }

  const insightByEquipment = new Map(result.equipmentInsights.map((insight) => [insight.equipmentId, insight]));

  // AI enrichment is layered on top of live Supabase equipment telemetry.
  return equipment.map((item) => {
    const insight = insightByEquipment.get(item.id);
    if (!insight) {
      return item;
    }

    return {
      ...item,
      aiInsight: {
        anomalyProbability: insight.anomalyProbability,
        predictedFailureWindowHours: insight.predictedFailureWindowHours,
        recommendation: insight.recommendation,
        summary: insight.summary
      }
    };
  });
}

export async function enrichAlertsData(plantId: string, alerts: Alert[]): Promise<Alert[]> {
  if (!alerts.length) {
    return alerts;
  }

  const result = await requestEnrichment({
    type: 'alerts',
    plantId,
    alerts: alerts.map((alert) => ({
      id: alert.id,
      title: alert.title,
      description: alert.description,
      severity: alert.severity,
      equipmentId: alert.equipmentId
    }))
  });

  if (!result || result.type !== 'alerts') {
    return alerts;
  }

  const summaryById = new Map(result.alertSummaries.map((summary) => [summary.id, summary]));
  const mergedAlerts = alerts.map((alert) => {
    const summary = summaryById.get(alert.id);
    return summary
      ? {
          ...alert,
          aiSummary: summary.summary,
          recommendedAction: summary.recommendedAction
        }
      : alert;
  });

  const syntheticAlerts: Alert[] = result.syntheticAlerts.slice(0, 2).map((item, index) => ({
    id: `ai-${Date.now()}-${index + 1}`,
    plantId,
    equipmentId: item.equipmentId ?? 'unassigned',
    title: item.title,
    description: item.description,
    severity: item.severity,
    createdAt: new Date().toISOString(),
    acknowledged: false,
    source: 'ai_enrichment',
    generatedByAI: true
  }));

  return [...mergedAlerts, ...syntheticAlerts];
}

export async function enrichDailyEnergyData(dailyEnergy: EnergyPoint[]): Promise<EnergyPoint[]> {
  if (!dailyEnergy.length) {
    return dailyEnergy;
  }

  const result = await requestEnrichment({
    type: 'energy',
    dailyEnergy: dailyEnergy.map((point) => ({
      label: point.label,
      usageKwh: point.usageKwh,
      productionUnits: point.productionUnits,
      energyPerUnit: point.energyPerUnit
    }))
  });

  if (!result || result.type !== 'energy') {
    return dailyEnergy;
  }

  const averageUnits = Math.max(
    1,
    Math.round(dailyEnergy.reduce((sum, point) => sum + point.productionUnits, 0) / dailyEnergy.length)
  );
  const usageKwh = Number(result.forecastNextDayKwh.toFixed(2));

  // AI enrichment adds one explicit predictive point while preserving chart structure.
  return [
    ...dailyEnergy,
    {
      label: 'Forecast',
      usageKwh,
      productionUnits: averageUnits,
      energyPerUnit: Number((usageKwh / averageUnits).toFixed(2)),
      aiInsight: result.optimizationTip,
      aiForecast: true
    }
  ];
}

export async function enrichPlantData(plant: Plant): Promise<Plant> {
  const result = await requestEnrichment({
    type: 'plant',
    plant: {
      id: plant.id,
      name: plant.name,
      location: plant.location,
      lineCount: plant.lineCount,
      targetOee: plant.targetOee,
      timezone: plant.timezone ?? 'UTC'
    }
  });

  if (!result || result.type !== 'plant') {
    return plant;
  }

  return {
    ...plant,
    aiSummary: result.summary,
    sustainabilityContext: result.sustainabilityContext
  };
}

export async function enrichEmissionsInsights(
  plantName: string,
  records: EmissionsRecord[]
): Promise<EmissionsAiInsights | null> {
  if (!records.length) {
    return null;
  }

  const result = await requestEnrichment({
    type: 'emissions',
    plantName,
    records: records.slice(0, 40).map((item) => ({
      measuredAt: item.measuredAt,
      equipmentName: item.equipmentName,
      equipmentCategory: item.equipmentCategory,
      co2Kg: item.co2Kg,
      noxKg: item.noxKg,
      soxKg: item.soxKg,
      ch4Kg: item.ch4Kg,
      carbonFactor: item.carbonFactor
    }))
  });

  if (!result || result.type !== 'emissions') {
    return null;
  }

  return {
    trendSummary: result.trendSummary,
    anomalySummary: result.anomalySummary,
    optimizationRecommendation: result.optimizationRecommendation,
    predictedNextPeriodCo2Kg: Number(result.predictedNextPeriodCo2Kg.toFixed(2))
  };
}

export async function enrichProductionEfficiencyInsights(
  plantName: string,
  records: ProductionEfficiencyRecord[],
  trend: ProductionTrendPoint[]
): Promise<ProductionEfficiencyAiInsights | null> {
  if (!records.length || !trend.length) {
    return null;
  }

  const result = await requestEnrichment({
    type: 'production_efficiency',
    plantName,
    records: records.slice(0, 24).map((item) => ({
      equipmentName: item.equipmentName,
      equipmentType: item.equipmentType,
      line: item.line,
      availability: item.availability,
      performance: item.performance,
      quality: item.quality,
      oee: item.oee,
      throughput: item.throughput,
      defectRate: item.defectRate,
      bottleneckRisk: item.bottleneckRisk
    })),
    trend: trend.slice(-14).map((point) => ({
      label: point.label,
      oee: point.oee,
      throughput: point.throughput,
      defectRate: point.defectRate
    }))
  });

  if (!result || result.type !== 'production_efficiency') {
    return null;
  }

  return {
    trendSummary: result.trendSummary,
    bottleneckPrediction: result.bottleneckPrediction,
    recommendation: result.recommendation,
    predictedNextOee: Number(result.predictedNextOee.toFixed(1))
  };
}

export async function enrichSustainabilityScoringInsights(
  plantName: string,
  records: SustainabilityScoringRecord[],
  trend: SustainabilityScoringTrendPoint[]
): Promise<SustainabilityScoringAiInsights | null> {
  if (!records.length || !trend.length) {
    return null;
  }

  const result = await requestEnrichment({
    type: 'sustainability_scoring',
    plantName,
    records: records.slice(0, 20).map((item) => ({
      line: item.line,
      sustainabilityScore: item.sustainabilityScore,
      benchmarkScore: item.benchmarkScore,
      energyPerUnit: item.energyPerUnit,
      carbonFactor: item.carbonFactor,
      co2Kg: item.co2Kg,
      noxKg: item.noxKg,
      soxKg: item.soxKg,
      trendDelta: item.trendDelta
    })),
    trend: trend.slice(-14).map((point) => ({
      label: point.label,
      sustainabilityScore: point.sustainabilityScore,
      benchmarkScore: point.benchmarkScore
    }))
  });

  if (!result || result.type !== 'sustainability_scoring') {
    return null;
  }

  return {
    trendSummary: result.trendSummary,
    benchmarkSummary: result.benchmarkSummary,
    recommendation: result.recommendation,
    predictedNextScore: Number(result.predictedNextScore.toFixed(1))
  };
}

export async function enrichAnomalyDetectionInsights(
  plantName: string,
  records: AnomalyDetectionRecord[],
  trend: AnomalyTrendPoint[]
): Promise<AnomalyDetectionAiInsights | null> {
  if (!records.length || !trend.length) {
    return null;
  }

  const result = await requestEnrichment({
    type: 'anomaly_detection',
    plantName,
    records: records.slice(0, 30).map((item) => ({
      measuredAt: item.measuredAt,
      equipmentName: item.equipmentName,
      equipmentType: item.equipmentType,
      anomalyScore: item.anomalyScore,
      severity: item.severity,
      source: item.source,
      predictedImpact: item.predictedImpact
    })),
    trend: trend.slice(-14).map((point) => ({
      label: point.label,
      anomalyCount: point.anomalyCount,
      averageScore: point.averageScore
    }))
  });

  if (!result || result.type !== 'anomaly_detection') {
    return null;
  }

  return {
    trendSummary: result.trendSummary,
    anomalyHotspot: result.anomalyHotspot,
    recommendation: result.recommendation,
    predictedNextAnomalyCount: result.predictedNextAnomalyCount
  };
}
