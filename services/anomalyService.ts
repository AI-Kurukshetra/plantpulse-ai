import { enrichAnomalyDetectionInsights } from '@/lib/openaiEnrichment';
import type {
  AnomalyDetectionAiInsights,
  AnomalyDetectionDashboardData,
  AnomalyDetectionRecord,
  AnomalyTrendPoint,
  AlertSeverity
} from '@/types';
import { getAlerts } from '@/services/alertsService';
import { getEquipmentStatus } from '@/services/equipmentService';
import { getPrimaryPlant } from '@/services/plantService';

function scoreToSeverity(score: number): AlertSeverity {
  if (score >= 78) return 'critical';
  if (score >= 48) return 'warning';
  return 'info';
}

function predictedImpactByScore(score: number) {
  if (score >= 78) {
    return 'High failure risk and immediate throughput degradation likely within shift window.';
  }
  if (score >= 48) {
    return 'Moderate efficiency loss risk with potential quality variance if unresolved.';
  }
  return 'Low immediate impact, but deviation should be observed for trend escalation.';
}

function computeTelemetryAnomalyScore(params: {
  temperature: number;
  vibration: number;
  runtimeHours: number;
  serviceIntervalHours: number;
  aiProbability?: number;
  status: 'running' | 'idle' | 'maintenance' | 'offline';
}) {
  const temperatureRisk = Math.max(0, (params.temperature - 80) * 1.6);
  const vibrationRisk = Math.max(0, (params.vibration - 3.2) * 14);
  const runtimeRisk = Math.max(0, ((params.runtimeHours - params.serviceIntervalHours) / 140) * 5.5);
  const statusRisk = params.status === 'offline' ? 26 : params.status === 'maintenance' ? 18 : params.status === 'idle' ? 6 : 0;
  const aiRisk = (params.aiProbability ?? 0) * 42;

  return Math.max(0, Math.min(100, Number((temperatureRisk + vibrationRisk + runtimeRisk + statusRisk + aiRisk).toFixed(1))));
}

function buildFallbackInsights(records: AnomalyDetectionRecord[], trend: AnomalyTrendPoint[]): AnomalyDetectionAiInsights {
  const hotspot = [...records].sort((a, b) => b.anomalyScore - a.anomalyScore)[0];
  const averageRecentCount =
    trend.slice(-5).reduce((sum, point) => sum + point.anomalyCount, 0) / Math.max(1, trend.slice(-5).length);

  return {
    trendSummary: `Anomaly trend indicates ${averageRecentCount.toFixed(1)} high-risk events per recent interval.`,
    anomalyHotspot: hotspot
      ? `${hotspot.equipmentName} is currently the top anomaly hotspot at score ${hotspot.anomalyScore.toFixed(1)}.`
      : 'No clear anomaly hotspot detected in current data.',
    recommendation: 'Prioritize vibration diagnostics on critical assets and tighten threshold checks during high-load windows.',
    predictedNextAnomalyCount: Math.max(0, Math.round(averageRecentCount + 1))
  };
}

export async function getAnomalyDetectionDashboardData(): Promise<AnomalyDetectionDashboardData> {
  // Data fetch combines equipment telemetry and alert stream to produce operational anomaly events.
  const [plant, equipment, alerts] = await Promise.all([getPrimaryPlant(), getEquipmentStatus(), getAlerts(40)]);

  const alertByEquipment = new Map(alerts.map((alert) => [alert.equipmentId, alert]));

  let records: AnomalyDetectionRecord[] = equipment.map((asset, index) => {
    const linkedAlert = alertByEquipment.get(asset.id);
    const score = computeTelemetryAnomalyScore({
      temperature: asset.temperature,
      vibration: asset.vibration,
      runtimeHours: asset.runtimeHours,
      serviceIntervalHours: asset.serviceIntervalHours,
      aiProbability: asset.aiInsight?.anomalyProbability,
      status: asset.status
    });
    const severity = linkedAlert?.severity ?? scoreToSeverity(score);

    return {
      id: `anomaly-${asset.id}`,
      plantId: plant.id,
      plantName: plant.name,
      equipmentId: asset.id,
      equipmentName: asset.name,
      equipmentType: asset.category,
      measuredAt: linkedAlert?.createdAt ?? new Date(Date.now() - index * 45 * 60 * 1000).toISOString(),
      anomalyScore: score,
      severity,
      predictedImpact: predictedImpactByScore(score),
      recommendation:
        linkedAlert?.recommendedAction ??
        asset.aiInsight?.recommendation ??
        'Inspect sensor signal quality and verify operating envelope for this asset.',
      source: linkedAlert?.generatedByAI ? 'ai' : linkedAlert ? 'alert' : 'telemetry',
      aiInsight: linkedAlert?.aiSummary ?? asset.aiInsight?.summary
    };
  });

  // Ensure table is always populated in demo mode when source telemetry is sparse.
  if (!records.length) {
    records = [
      {
        id: 'anomaly-fallback-1',
        plantId: plant.id,
        plantName: plant.name,
        equipmentId: 'fallback-eq-1',
        equipmentName: 'Compressor A-201',
        equipmentType: 'Compression',
        measuredAt: new Date().toISOString(),
        anomalyScore: 82.4,
        severity: 'critical',
        predictedImpact: predictedImpactByScore(82.4),
        recommendation: 'Immediate inspection required for sustained high vibration and thermal variance.',
        source: 'telemetry',
        aiInsight: 'Escalating vibration pattern suggests bearing wear progression.'
      }
    ];
  }

  const trendBuckets = new Map<string, { totalScore: number; count: number }>();
  for (const row of records.slice().reverse()) {
    const label = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(row.measuredAt));
    const current = trendBuckets.get(label) ?? { totalScore: 0, count: 0 };
    current.totalScore += row.anomalyScore;
    current.count += 1;
    trendBuckets.set(label, current);
  }

  let trend: AnomalyTrendPoint[] = Array.from(trendBuckets.entries())
    .slice(-14)
    .map(([label, point]) => ({
      label,
      anomalyCount: point.count,
      averageScore: Number((point.totalScore / Math.max(1, point.count)).toFixed(1))
    }));

  if (!trend.length) {
    trend = Array.from({ length: 7 }, (_, index) => ({
      label: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
        new Date(Date.now() - (6 - index) * 86400000)
      ),
      anomalyCount: Math.max(1, Math.round(2 + Math.sin(index) * 1.4)),
      averageScore: Number((58 + Math.cos(index / 1.6) * 8).toFixed(1))
    }));
  }

  // AI enrichment summarizes detected deviation patterns and predicts near-term anomaly load.
  const aiInsights =
    (await enrichAnomalyDetectionInsights(plant.name, records, trend).catch(() => null)) ??
    buildFallbackInsights(records, trend);

  return {
    plantOptions: [{ id: plant.id, name: plant.name }],
    equipmentTypeOptions: Array.from(new Set(records.map((row) => row.equipmentType))).sort(),
    records: records.sort((a, b) => b.anomalyScore - a.anomalyScore),
    trend,
    aiInsights
  };
}
