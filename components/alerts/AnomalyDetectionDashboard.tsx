'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Button } from '@/components/common/Button';
import { StateBadge } from '@/components/common/StateBadge';
import type { AnomalyDetectionDashboardData, AnomalyDetectionRecord, AnomalyTrendPoint } from '@/types';

type TimeRange = '24h' | '7d' | '30d';
const PAGE_SIZE = 8;

type AnomalyPayload = {
  records: AnomalyDetectionRecord[];
  trend: AnomalyTrendPoint[];
  aiInsights: AnomalyDetectionDashboardData['aiInsights'];
};

export function AnomalyDetectionDashboard({ initialData }: { initialData: AnomalyDetectionDashboardData }) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [plantId, setPlantId] = useState(initialData.plantOptions[0]?.id ?? '');
  const [equipmentType, setEquipmentType] = useState<'all' | string>('all');
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState(initialData.records);
  const [trend, setTrend] = useState(initialData.trend);
  const [aiInsights, setAiInsights] = useState(initialData.aiInsights);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Poll anomaly endpoint so operational deviations stay near real-time.
        const response = await fetch('/api/anomaly-detection', { cache: 'no-store' });
        const payload = (await response.json()) as AnomalyPayload;
        if (!response.ok) {
          throw new Error('Unable to refresh anomaly data.');
        }
        setRecords(payload.records);
        setTrend(payload.trend);
        setAiInsights(payload.aiInsights);
        setRefreshError(null);
      } catch {
        setRefreshError('Live anomaly refresh is unavailable. Showing most recent dataset.');
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  const filteredRecords = useMemo(() => {
    const now = Date.now();
    const rangeMs = timeRange === '24h' ? 24 * 60 * 60 * 1000 : timeRange === '7d' ? 7 * 86400000 : 30 * 86400000;
    return records.filter((row) => {
      const inRange = new Date(row.measuredAt).getTime() >= now - rangeMs;
      const byPlant = !plantId || row.plantId === plantId;
      const byType = equipmentType === 'all' || row.equipmentType === equipmentType;
      return inRange && byPlant && byType;
    });
  }, [equipmentType, plantId, records, timeRange]);

  const filteredTrend = useMemo(() => {
    if (timeRange === '24h') return trend.slice(-1);
    if (timeRange === '7d') return trend.slice(-7);
    return trend.slice(-30);
  }, [timeRange, trend]);

  const kpis = useMemo(() => {
    const criticalCount = filteredRecords.filter((row) => row.severity === 'critical').length;
    const averageScore =
      filteredRecords.reduce((sum, row) => sum + row.anomalyScore, 0) / Math.max(1, filteredRecords.length);
    const impactCount = filteredRecords.filter((row) => row.anomalyScore >= 78).length;
    return {
      criticalCount,
      averageScore: Number(averageScore.toFixed(1)),
      total: filteredRecords.length,
      impactCount
    };
  }, [filteredRecords]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const pageSlice = filteredRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const onFilterChange = (update: () => void) => {
    update();
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
        <div className="mb-4">
          <p className="text-lg font-medium text-white">Anomaly Detection Engine</p>
          <p className="mt-1 text-sm text-mist/65">
            ML-style anomaly scoring with AI-assisted triage recommendations across equipment telemetry.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm text-mist/70">
            Time Range
            <select
              value={timeRange}
              onChange={(event) => onFilterChange(() => setTimeRange(event.target.value as TimeRange))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/60 px-4 py-2.5 text-white outline-none"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </label>
          <label className="text-sm text-mist/70">
            Plant
            <select
              value={plantId}
              onChange={(event) => onFilterChange(() => setPlantId(event.target.value))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/60 px-4 py-2.5 text-white outline-none"
            >
              {initialData.plantOptions.map((plant) => (
                <option key={plant.id} value={plant.id}>
                  {plant.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-mist/70">
            Equipment Type
            <select
              value={equipmentType}
              onChange={(event) => onFilterChange(() => setEquipmentType(event.target.value))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/60 px-4 py-2.5 text-white outline-none"
            >
              <option value="all">All types</option>
              {initialData.equipmentTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[24px] border border-white/10 bg-ink/50 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-mist/60">Detected Anomalies</p>
          <p className="mt-3 text-2xl font-semibold text-white">{kpis.total}</p>
        </article>
        <article className="rounded-[24px] border border-white/10 bg-ink/50 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-mist/60">Critical</p>
          <p className="mt-3 text-2xl font-semibold text-danger">{kpis.criticalCount}</p>
        </article>
        <article className="rounded-[24px] border border-white/10 bg-ink/50 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-mist/60">Average Score</p>
          <p className="mt-3 text-2xl font-semibold text-white">{kpis.averageScore.toFixed(1)}</p>
        </article>
        <article className="rounded-[24px] border border-white/10 bg-ink/50 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-mist/60">High-Impact Risks</p>
          <p className="mt-3 text-2xl font-semibold text-white">{kpis.impactCount}</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
          <div className="mb-4">
            <p className="text-lg font-medium text-white">Anomaly Trend</p>
            <p className="mt-1 text-sm text-mist/65">Anomaly count and average score over time.</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredTrend}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="label" stroke="#9ab0c1" tickLine={false} axisLine={false} />
                <YAxis stroke="#9ab0c1" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#08141f',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '16px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="anomalyCount"
                  name="Anomaly Count"
                  stroke="#f3a712"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="averageScore"
                  name="Average Score"
                  stroke="#1cc28a"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
          <p className="text-lg font-medium text-white">AI Anomaly Insights</p>
          {/* AI enrichment summarizes hotspot and predicted anomaly load from detected deviations. */}
          <div className="mt-4 space-y-4 text-sm leading-7 text-mist/78">
            <p>{aiInsights.trendSummary}</p>
            <p>{aiInsights.anomalyHotspot}</p>
            <p className="text-signal">{aiInsights.recommendation}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-mist/55">
              Predicted next anomaly count: {aiInsights.predictedNextAnomalyCount}
            </p>
          </div>
          {refreshError ? <p className="mt-3 text-xs text-amber">{refreshError}</p> : null}
        </article>
      </section>

      <section className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-medium text-white">Detected Deviations</p>
            <p className="mt-1 text-sm text-mist/65">
              Actionable anomaly list with severity, impact prediction, and recommendation.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-danger/40 bg-danger/10 px-3 py-1 text-xs text-danger">
            <AlertTriangle className="h-3.5 w-3.5" />
            Prioritize critical
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-mist/50">
              <tr className="border-b border-white/10">
                <th className="pb-3">Equipment</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Score</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3">Predicted Impact</th>
                <th className="pb-3">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {pageSlice.map((row) => (
                <tr key={row.id} className="border-b border-white/5 text-mist/80 last:border-none">
                  <td className="py-4 text-white">{row.equipmentName}</td>
                  <td className="py-4">{row.equipmentType}</td>
                  <td className="py-4">{row.anomalyScore.toFixed(1)}</td>
                  <td className="py-4">
                    <StateBadge value={row.severity} />
                  </td>
                  <td className="max-w-sm py-4">{row.predictedImpact}</td>
                  <td className="max-w-sm py-4 text-signal">{row.recommendation}</td>
                </tr>
              ))}
              {!pageSlice.length ? (
                <tr>
                  <td colSpan={6} className="py-4 text-mist/70">
                    No anomalies found for selected filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-mist/55">
            Page {page} of {totalPages} • {filteredRecords.length} records
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="inline-flex items-center justify-center px-3"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              aria-label="Previous anomaly page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              className="inline-flex items-center justify-center px-3"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              aria-label="Next anomaly page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
