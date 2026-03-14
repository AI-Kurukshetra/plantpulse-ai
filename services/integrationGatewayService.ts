import { createHash } from 'node:crypto';
import { unstable_cache } from 'next/cache';
import type { IntegrationConnector, IntegrationGatewayDashboardData, IntegrationGatewayInsights } from '@/types';

const baseConnectors: IntegrationConnector[] = [
  {
    id: 'conn-erp-north',
    systemType: 'ERP',
    systemName: 'SAP S/4 North',
    site: 'North Plant',
    status: 'connected',
    latencyMs: 188,
    syncSuccessRate: 98.4,
    lastSyncedAt: new Date(Date.now() - 4 * 60000).toISOString(),
    endpoint: '/api/integrations/test/erp-north',
    notes: 'Orders and cost-center mappings synced every 5 minutes.'
  },
  {
    id: 'conn-mes-south',
    systemType: 'MES',
    systemName: 'Ignition MES South',
    site: 'South Plant',
    status: 'degraded',
    latencyMs: 418,
    syncSuccessRate: 92.2,
    lastSyncedAt: new Date(Date.now() - 12 * 60000).toISOString(),
    endpoint: '/api/integrations/test/mes-south',
    notes: 'Job-state messages delayed due to intermittent gateway congestion.'
  },
  {
    id: 'conn-scada-west',
    systemType: 'SCADA',
    systemName: 'SCADA Stream West',
    site: 'West Plant',
    status: 'connected',
    latencyMs: 156,
    syncSuccessRate: 99.1,
    lastSyncedAt: new Date(Date.now() - 2 * 60000).toISOString(),
    endpoint: '/api/integrations/test/scada-west',
    notes: 'High-frequency telemetry stream healthy.'
  },
  {
    id: 'conn-historian-core',
    systemType: 'Historian',
    systemName: 'OSI PI Historian',
    site: 'North Plant',
    status: 'planned',
    latencyMs: 0,
    syncSuccessRate: 0,
    lastSyncedAt: new Date(Date.now() - 90 * 60000).toISOString(),
    endpoint: '/api/integrations/test/historian-core',
    notes: 'Backfill and retention sync in implementation phase.'
  }
];

function hashSeed(input: string) {
  return parseInt(createHash('sha256').update(input).digest('hex').slice(0, 8), 16);
}

const getCachedIntegrationAiInsight = unstable_cache(
  async (context: string): Promise<IntegrationGatewayInsights | null> => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return null;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          temperature: 0.2,
          max_output_tokens: 220,
          input: [
            { role: 'system', content: 'Return strict JSON with summary, forecast, recommendation only.' },
            { role: 'user', content: context }
          ]
        })
      });
      if (!response.ok) {
        return null;
      }
      const payload = (await response.json()) as { output_text?: string };
      if (!payload.output_text) {
        return null;
      }
      const parsed = JSON.parse(payload.output_text) as Partial<IntegrationGatewayInsights>;
      if (!parsed.summary || !parsed.forecast || !parsed.recommendation) {
        return null;
      }
      return parsed as IntegrationGatewayInsights;
    } catch {
      return null;
    }
  },
  ['plantpulse-integration-gateway-ai'],
  { revalidate: 120 }
);

function fallbackAi(connectors: IntegrationConnector[]): IntegrationGatewayInsights {
  const degraded = connectors.filter((item) => item.status === 'degraded' || item.status === 'offline').length;
  return {
    summary: `${degraded} connector(s) require attention; integration health is otherwise stable.`,
    forecast: 'Gateway load is expected to remain within normal envelope in next 24 hours.',
    recommendation: 'Prioritize retry/backoff tuning for degraded MES channels and enable payload compression.'
  };
}

export async function getIntegrationGatewayData(): Promise<IntegrationGatewayDashboardData> {
  const connectors = baseConnectors;
  const connectedCount = connectors.filter((item) => item.status === 'connected').length;
  const degradedCount = connectors.filter((item) => item.status === 'degraded').length;
  const avgLatency =
    connectors.filter((item) => item.latencyMs > 0).reduce((sum, item) => sum + item.latencyMs, 0) /
    Math.max(1, connectors.filter((item) => item.latencyMs > 0).length);
  const avgSuccessRate =
    connectors.reduce((sum, item) => sum + item.syncSuccessRate, 0) / Math.max(1, connectors.length);

  const seed = hashSeed(connectors.map((item) => `${item.id}-${item.status}`).join('|'));
  const trend = Array.from({ length: 12 }, (_, i) => ({
    label: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
      new Date(Date.now() - (11 - i) * 86400000)
    ),
    connected: Math.max(1, Math.round(connectedCount + Math.sin((i + (seed % 5)) / 2.1))),
    degraded: Math.max(0, Math.round(degradedCount + Math.cos((i + (seed % 3)) / 2.5)))
  }));

  const aiInsights =
    (await getCachedIntegrationAiInsight(
      `Integration API Gateway connectors: ${JSON.stringify(
        connectors.map((item) => ({
          systemType: item.systemType,
          status: item.status,
          latencyMs: item.latencyMs,
          syncSuccessRate: item.syncSuccessRate
        }))
      )}`
    )) ?? fallbackAi(connectors);

  return {
    connectors,
    kpis: [
      { label: 'Connected Systems', value: `${connectedCount}/${connectors.length}` },
      { label: 'Degraded Links', value: `${degradedCount}` },
      { label: 'Avg Latency', value: `${Math.round(avgLatency)} ms` },
      { label: 'Sync Success', value: `${avgSuccessRate.toFixed(1)}%` }
    ],
    trend,
    sites: Array.from(new Set(connectors.map((item) => item.site))),
    systems: ['ERP', 'MES', 'SCADA', 'Historian'],
    aiInsights
  };
}
