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
import type { ProductionEfficiencyDashboardData, ProductionEfficiencyRecord, ProductionTrendPoint } from '@/types';
import { formatCompactNumber } from '@/utils/format';

type TimeRange = '7d' | '30d' | '90d';

type ProductionPayload = {
  aiInsights: ProductionEfficiencyDashboardData['aiInsights'];
  records: ProductionEfficiencyRecord[];
  trend: ProductionTrendPoint[];
};

const PAGE_SIZE = 8;

function riskClass(value: number) {
  if (value >= 70) return 'bg-danger/20 text-danger';
  if (value >= 50) return 'bg-amber-400/20 text-amber-200';
  return 'bg-emerald-400/20 text-emerald-200';
}

export function ProductionEfficiencyAnalytics({ initialData }: { initialData: ProductionEfficiencyDashboardData }) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [plantId, setPlantId] = useState(initialData.plantOptions[0]?.id ?? '');
  const [lineFilter, setLineFilter] = useState<'all' | string>('all');
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState(initialData.records);
  const [trend, setTrend] = useState(initialData.trend);
  const [aiInsights, setAiInsights] = useState(initialData.aiInsights);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Poll production endpoint so OEE/throughput/quality cards stay current without manual refresh.
        const response = await fetch('/api/production-efficiency', { cache: 'no-store' });
        const payload = (await response.json()) as ProductionPayload;
        if (!response.ok) {
          throw new Error('Unable to refresh production efficiency data.');
        }
        setRecords(payload.records);
        setTrend(payload.trend);
        setAiInsights(payload.aiInsights);
        setRefreshError(null);
      } catch {
        setRefreshError('Live refresh is unavailable. Showing most recent production data.');
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  const filteredRecords = useMemo(() => {
    const byPlant = records.filter((row) => !plantId || initialData.plantOptions.some((plant) => plant.id === plantId));
    const byLine = byPlant.filter((row) => lineFilter === 'all' || row.line === lineFilter);
    return byLine;
  }, [initialData.plantOptions, lineFilter, plantId, records]);

  const filteredTrend = useMemo(() => {
    if (timeRange === '7d') return trend.slice(-7);
    if (timeRange === '30d') return trend.slice(-30);
    return trend.slice(-90);
  }, [timeRange, trend]);

  const totals = useMemo(() => {
    const avgOee = filteredRecords.reduce((sum, row) => sum + row.oee, 0) / Math.max(1, filteredRecords.length);
    const totalThroughput = filteredRecords.reduce((sum, row) => sum + row.throughput, 0);
    const avgQuality = filteredRecords.reduce((sum, row) => sum + row.quality, 0) / Math.max(1, filteredRecords.length);
    const avgDefect = filteredRecords.reduce((sum, row) => sum + row.defectRate, 0) / Math.max(1, filteredRecords.length);
    return {
      avgOee: Number(avgOee.toFixed(1)),
      totalThroughput: Number(totalThroughput.toFixed(1)),
      avgQuality: Number(avgQuality.toFixed(1)),
      avgDefect: Number(avgDefect.toFixed(2))
    };
  }, [filteredRecords]);

  const bottlenecks = useMemo(
    () => [...filteredRecords].sort((a, b) => b.bottleneckRisk - a.bottleneckRisk).slice(0, 3),
    [filteredRecords]
  );

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const pageSlice = filteredRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const onFilterChange = (update: () => void) => {
    update();
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[24px] border border-white/10 bg-ink/50 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-mist/60">OEE</p>
          <p className="mt-3 text-2xl font-semibold text-white">{totals.avgOee.toFixed(1)}%</p>
        </article>
        <article className="rounded-[24px] border border-white/10 bg-ink/50 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-mist/60">Throughput</p>
          <p className="mt-3 text-2xl font-semibold text-white">{formatCompactNumber(totals.totalThroughput)} units</p>
        </article>
        <article className="rounded-[24px] border border-white/10 bg-ink/50 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-mist/60">Quality Yield</p>
          <p className="mt-3 text-2xl font-semibold text-white">{totals.avgQuality.toFixed(1)}%</p>
        </article>
        <article className="rounded-[24px] border border-white/10 bg-ink/50 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-mist/60">Defect Rate</p>
          <p className="mt-3 text-2xl font-semibold text-white">{totals.avgDefect.toFixed(2)}%</p>
        </article>
      </section>

      <section className="grid gap-3 rounded-[24px] border border-white/10 bg-ink/50 p-4 md:grid-cols-3">
        <label className="text-sm text-mist/70">
          Time Range
          <select
            value={timeRange}
            onChange={(event) => onFilterChange(() => setTimeRange(event.target.value as TimeRange))}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/60 px-4 py-2.5 text-white outline-none"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
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
          Line
          <select
            value={lineFilter}
            onChange={(event) => onFilterChange(() => setLineFilter(event.target.value))}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/60 px-4 py-2.5 text-white outline-none"
          >
            <option value="all">All lines</option>
            {initialData.lineOptions.map((line) => (
              <option key={line} value={line}>
                {line}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
          <div className="mb-4">
            <p className="text-lg font-medium text-white">Production Trend</p>
            <p className="mt-1 text-sm text-mist/65">OEE, throughput, and defect rate trends over selected period.</p>
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
                <Line type="monotone" dataKey="oee" stroke="#1cc28a" strokeWidth={3} dot={false} name="OEE %" />
                <Line
                  type="monotone"
                  dataKey="throughput"
                  stroke="#8ab4f8"
                  strokeWidth={2.5}
                  dot={false}
                  name="Throughput"
                />
                <Line
                  type="monotone"
                  dataKey="defectRate"
                  stroke="#f3a712"
                  strokeWidth={2.5}
                  dot={false}
                  name="Defect %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="space-y-4 rounded-[26px] border border-white/10 bg-ink/50 p-5">
          <div>
            <p className="text-lg font-medium text-white">AI Efficiency Insights</p>
            {/* AI enrichment here summarizes bottlenecks and predicts next OEE from production telemetry. */}
            <p className="mt-2 text-sm text-mist/75">{aiInsights.trendSummary}</p>
            <p className="mt-2 text-sm text-mist/75">{aiInsights.bottleneckPrediction}</p>
            <p className="mt-2 text-sm text-signal">{aiInsights.recommendation}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-mist/55">
              Predicted next OEE: {aiInsights.predictedNextOee.toFixed(1)}%
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-ink/60 p-4">
            <p className="text-sm font-medium text-white">Top Bottlenecks</p>
            <ul className="mt-3 space-y-2">
              {bottlenecks.map((item) => (
                <li key={item.equipmentId} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate text-white">{item.equipmentName}</p>
                    <p className="text-xs text-mist/60">{item.line}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs ${riskClass(item.bottleneckRisk)}`}>
                    {item.bottleneckRisk.toFixed(1)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {refreshError ? <p className="text-xs text-amber">{refreshError}</p> : null}
        </article>
      </section>

      <section className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-medium text-white">Equipment Efficiency Table</p>
            <p className="mt-1 text-sm text-mist/65">
              Availability, performance, quality, and bottleneck risk by equipment.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-danger/40 bg-danger/10 px-3 py-1 text-xs text-danger">
            <AlertTriangle className="h-3.5 w-3.5" />
            Bottlenecks highlighted
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-mist/50">
              <tr className="border-b border-white/10">
                <th className="pb-3">Equipment</th>
                <th className="pb-3">Line</th>
                <th className="pb-3">OEE</th>
                <th className="pb-3">Throughput</th>
                <th className="pb-3">Quality</th>
                <th className="pb-3">Defect</th>
                <th className="pb-3">Bottleneck Risk</th>
                <th className="pb-3">AI Insight</th>
              </tr>
            </thead>
            <tbody>
              {pageSlice.map((item) => (
                <tr
                  key={item.equipmentId}
                  className={`border-b border-white/5 text-mist/80 last:border-none ${
                    item.bottleneckRisk >= 70 ? 'bg-danger/5' : ''
                  }`}
                >
                  <td className="py-4 text-white">{item.equipmentName}</td>
                  <td className="py-4">{item.line}</td>
                  <td className="py-4">{item.oee.toFixed(1)}%</td>
                  <td className="py-4">{item.throughput.toFixed(1)}</td>
                  <td className="py-4">{item.quality.toFixed(1)}%</td>
                  <td className="py-4">{item.defectRate.toFixed(2)}%</td>
                  <td className="py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ${riskClass(item.bottleneckRisk)}`}>
                      {item.bottleneckRisk.toFixed(1)}%
                    </span>
                  </td>
                  <td className="max-w-sm py-4 text-xs text-signal">{item.aiInsight ?? 'No recommendation'}</td>
                </tr>
              ))}
              {!pageSlice.length ? (
                <tr>
                  <td colSpan={8} className="py-4 text-mist/70">
                    No production records found for selected filters.
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
              aria-label="Previous production table page"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              className="inline-flex items-center justify-center px-3"
              aria-label="Next production table page"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
