'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Button } from '@/components/common/Button';
import type { SustainabilityScoringDashboardData } from '@/types';

const PAGE_SIZE = 8;

export function SustainabilityScoringDashboard({ data }: { data: SustainabilityScoringDashboardData }) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [plantId, setPlantId] = useState(data.plantOptions[0]?.id ?? '');
  const [lineFilter, setLineFilter] = useState<'all' | string>('all');
  const [page, setPage] = useState(1);

  const filteredRecords = useMemo(() => {
    const byPlant = data.records.filter((record) => !plantId || record.plantId === plantId);
    return byPlant.filter((record) => lineFilter === 'all' || record.line === lineFilter);
  }, [data.records, lineFilter, plantId]);

  const filteredTrend = useMemo(() => {
    if (timeRange === '7d') return data.trend.slice(-7);
    if (timeRange === '30d') return data.trend.slice(-30);
    return data.trend.slice(-90);
  }, [data.trend, timeRange]);

  const kpis = useMemo(() => {
    const avgScore = filteredRecords.reduce((sum, row) => sum + row.sustainabilityScore, 0) / Math.max(1, filteredRecords.length);
    const avgBenchmark = filteredRecords.reduce((sum, row) => sum + row.benchmarkScore, 0) / Math.max(1, filteredRecords.length);
    const avgCarbonFactor =
      filteredRecords.reduce((sum, row) => sum + row.carbonFactor, 0) / Math.max(1, filteredRecords.length);
    const benchmarkGap = avgBenchmark - avgScore;
    return {
      avgScore: Number(avgScore.toFixed(1)),
      avgBenchmark: Number(avgBenchmark.toFixed(1)),
      avgCarbonFactor: Number(avgCarbonFactor.toFixed(3)),
      benchmarkGap: Number(benchmarkGap.toFixed(1))
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
          <p className="text-lg font-medium text-white">Sustainability Scoring System</p>
          <p className="mt-1 text-sm text-mist/65">
            Automated score benchmarking against industry thresholds with AI-driven improvement guidance.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm text-mist/70">
            Time Range
            <select
              value={timeRange}
              onChange={(event) => onFilterChange(() => setTimeRange(event.target.value as typeof timeRange))}
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
              {data.plantOptions.map((plant) => (
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
              {data.lineOptions.map((line) => (
                <option key={line} value={line}>
                  {line}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[24px] border border-white/10 bg-ink/50 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-mist/60">Sustainability Score</p>
          <p className="mt-3 text-2xl font-semibold text-white">{kpis.avgScore.toFixed(1)}</p>
        </article>
        <article className="rounded-[24px] border border-white/10 bg-ink/50 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-mist/60">Benchmark</p>
          <p className="mt-3 text-2xl font-semibold text-white">{kpis.avgBenchmark.toFixed(1)}</p>
        </article>
        <article className="rounded-[24px] border border-white/10 bg-ink/50 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-mist/60">Carbon Factor</p>
          <p className="mt-3 text-2xl font-semibold text-white">{kpis.avgCarbonFactor.toFixed(3)}</p>
        </article>
        <article className="rounded-[24px] border border-white/10 bg-ink/50 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-mist/60">Benchmark Gap</p>
          <p className={`mt-3 text-2xl font-semibold ${kpis.benchmarkGap > 0 ? 'text-danger' : 'text-signal'}`}>
            {kpis.benchmarkGap.toFixed(1)}
          </p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
          <div className="mb-4">
            <p className="text-lg font-medium text-white">Score vs Benchmark Trend</p>
            <p className="mt-1 text-sm text-mist/65">Trendline of sustainability score against industry benchmark target.</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredTrend}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="label" stroke="#9ab0c1" tickLine={false} axisLine={false} />
                <YAxis stroke="#9ab0c1" tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#08141f',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '16px'
                  }}
                />
                <Legend />
                <ReferenceLine y={82} stroke="#f3a712" strokeDasharray="4 4" />
                <Line
                  type="monotone"
                  dataKey="sustainabilityScore"
                  name="Score"
                  stroke="#1cc28a"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="benchmarkScore"
                  name="Benchmark"
                  stroke="#8ab4f8"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
          <p className="text-lg font-medium text-white">AI Sustainability Insights</p>
          {/* AI enrichment adds benchmark-aware scoring guidance while preserving deterministic score calculations. */}
          <div className="mt-4 space-y-4 text-sm leading-7 text-mist/78">
            <p>{data.aiInsights.trendSummary}</p>
            <p>{data.aiInsights.benchmarkSummary}</p>
            <p className="text-signal">{data.aiInsights.recommendation}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-mist/55">
              Predicted next score: {data.aiInsights.predictedNextScore.toFixed(1)}
            </p>
          </div>
        </article>
      </section>

      <section className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
        <div className="mb-4">
          <p className="text-lg font-medium text-white">Line Benchmarking Table</p>
          <p className="mt-1 text-sm text-mist/65">
            Score and pollutant indicators benchmarked per production line.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-mist/50">
              <tr className="border-b border-white/10">
                <th className="pb-3">Line</th>
                <th className="pb-3">Score</th>
                <th className="pb-3">Benchmark</th>
                <th className="pb-3">Energy / Unit</th>
                <th className="pb-3">CO2</th>
                <th className="pb-3">NOx</th>
                <th className="pb-3">SOx</th>
                <th className="pb-3">Trend Δ</th>
                <th className="pb-3">AI Insight</th>
              </tr>
            </thead>
            <tbody>
              {pageSlice.map((row) => (
                <tr key={row.line} className="border-b border-white/5 text-mist/80 last:border-none">
                  <td className="py-4 text-white">{row.line}</td>
                  <td className="py-4">{row.sustainabilityScore.toFixed(1)}</td>
                  <td className="py-4">{row.benchmarkScore.toFixed(1)}</td>
                  <td className="py-4">{row.energyPerUnit.toFixed(2)}</td>
                  <td className="py-4">{row.co2Kg.toFixed(2)}</td>
                  <td className="py-4">{row.noxKg.toFixed(3)}</td>
                  <td className="py-4">{row.soxKg.toFixed(3)}</td>
                  <td className={`py-4 ${row.trendDelta >= 0 ? 'text-signal' : 'text-danger'}`}>
                    {row.trendDelta >= 0 ? '+' : ''}
                    {row.trendDelta.toFixed(1)}
                  </td>
                  <td className="max-w-sm py-4 text-xs text-signal">{row.aiInsight ?? 'No insight available'}</td>
                </tr>
              ))}
              {!pageSlice.length ? (
                <tr>
                  <td colSpan={9} className="py-4 text-mist/70">
                    No sustainability benchmark records found for selected filters.
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
              aria-label="Previous sustainability table page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              className="inline-flex items-center justify-center px-3"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              aria-label="Next sustainability table page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
