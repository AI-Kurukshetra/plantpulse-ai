'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
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
import type { EmissionsDashboardData } from '@/types';
import { formatCompactNumber, formatDateTime } from '@/utils/format';

interface EmissionsTrackingDashboardProps {
  data: EmissionsDashboardData;
}

const PAGE_SIZE = 10;

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value));
}

export function EmissionsTrackingDashboard({ data }: EmissionsTrackingDashboardProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [plantId, setPlantId] = useState(data.plantOptions[0]?.id ?? '');
  const [equipmentType, setEquipmentType] = useState<'all' | string>('all');
  const [page, setPage] = useState(1);

  const filteredRecords = useMemo(() => {
    const now = Date.now();
    const rangeMs = timeRange === '7d' ? 7 * 86400000 : timeRange === '30d' ? 30 * 86400000 : 90 * 86400000;
    return data.records.filter((record) => {
      const inRange = new Date(record.measuredAt).getTime() >= now - rangeMs;
      const byPlant = !plantId || record.plantId === plantId;
      const byType = equipmentType === 'all' || record.equipmentCategory === equipmentType;
      return inRange && byPlant && byType;
    });
  }, [data.records, equipmentType, plantId, timeRange]);

  const chartSeries = useMemo(() => {
    const grouped = new Map<string, { label: string; co2Kg: number; noxKg: number; soxKg: number }>();
    for (const row of [...filteredRecords].reverse()) {
      const key = formatShortDate(row.measuredAt);
      const current = grouped.get(key) ?? { label: key, co2Kg: 0, noxKg: 0, soxKg: 0 };
      current.co2Kg = Number((current.co2Kg + row.co2Kg).toFixed(2));
      current.noxKg = Number((current.noxKg + row.noxKg).toFixed(3));
      current.soxKg = Number((current.soxKg + row.soxKg).toFixed(3));
      grouped.set(key, current);
    }
    return Array.from(grouped.values()).slice(-14);
  }, [filteredRecords]);

  const totals = useMemo(() => {
    const totalCo2 = filteredRecords.reduce((sum, row) => sum + row.co2Kg, 0);
    const totalNox = filteredRecords.reduce((sum, row) => sum + row.noxKg, 0);
    const totalSox = filteredRecords.reduce((sum, row) => sum + row.soxKg, 0);
    const avgCarbonFactor =
      filteredRecords.reduce((sum, row) => sum + row.carbonFactor, 0) / Math.max(1, filteredRecords.length);
    return {
      totalCo2: Number(totalCo2.toFixed(2)),
      totalNox: Number(totalNox.toFixed(2)),
      totalSox: Number(totalSox.toFixed(2)),
      avgCarbonFactor: Number(avgCarbonFactor.toFixed(3))
    };
  }, [filteredRecords]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const pageSlice = filteredRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCsv = () => {
    // Export supports operational reporting without exposing any server credentials.
    const header = [
      'measured_at',
      'plant',
      'equipment',
      'equipment_type',
      'co2_kg',
      'nox_kg',
      'sox_kg',
      'ch4_kg',
      'carbon_factor',
      'ai_insight'
    ];

    const rows = filteredRecords.map((item) => [
      item.measuredAt,
      item.plantName,
      item.equipmentName,
      item.equipmentCategory,
      item.co2Kg,
      item.noxKg,
      item.soxKg,
      item.ch4Kg,
      item.carbonFactor,
      `"${(item.aiInsight ?? '').replaceAll('"', '""')}"`
    ]);

    const csv = [header.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `emissions-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-lg font-medium text-white">Emissions Tracking & Reporting</p>
            <p className="mt-1 text-sm text-mist/65">
              Live or fallback emissions telemetry with AI trend prediction and anomaly context.
            </p>
          </div>
          <Button className="inline-flex items-center gap-2" onClick={exportCsv}>
            <Download className="h-4 w-4" />
            Export Report (CSV)
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm text-mist/70">
            Time Range
            <select
              className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/60 px-4 py-2.5 text-white outline-none"
              value={timeRange}
              onChange={(event) => {
                setTimeRange(event.target.value as typeof timeRange);
                setPage(1);
              }}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </label>

          <label className="text-sm text-mist/70">
            Plant
            <select
              className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/60 px-4 py-2.5 text-white outline-none"
              value={plantId}
              onChange={(event) => {
                setPlantId(event.target.value);
                setPage(1);
              }}
            >
              {data.plantOptions.map((plant) => (
                <option key={plant.id} value={plant.id}>
                  {plant.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-mist/70">
            Equipment Type
            <select
              className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/60 px-4 py-2.5 text-white outline-none"
              value={equipmentType}
              onChange={(event) => {
                setEquipmentType(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">All categories</option>
              {data.equipmentTypeOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-[24px] border border-white/10 bg-ink/50 p-5 xl:col-span-1">
          <p className="text-xs uppercase tracking-[0.25em] text-mist/60">CO2</p>
          <p className="mt-3 text-2xl font-semibold text-white">{formatCompactNumber(totals.totalCo2)} kg</p>
        </article>
        <article className="rounded-[24px] border border-white/10 bg-ink/50 p-5 xl:col-span-1">
          <p className="text-xs uppercase tracking-[0.25em] text-mist/60">NOx</p>
          <p className="mt-3 text-2xl font-semibold text-white">{formatCompactNumber(totals.totalNox)} kg</p>
        </article>
        <article className="rounded-[24px] border border-white/10 bg-ink/50 p-5 xl:col-span-1">
          <p className="text-xs uppercase tracking-[0.25em] text-mist/60">SOx</p>
          <p className="mt-3 text-2xl font-semibold text-white">{formatCompactNumber(totals.totalSox)} kg</p>
        </article>
        <article className="rounded-[24px] border border-white/10 bg-ink/50 p-5 xl:col-span-1">
          <p className="text-xs uppercase tracking-[0.25em] text-mist/60">Avg Carbon Factor</p>
          <p className="mt-3 text-2xl font-semibold text-white">{totals.avgCarbonFactor.toFixed(3)}</p>
        </article>
        <article className="rounded-[24px] border border-white/10 bg-ink/50 p-5 xl:col-span-1">
          <p className="text-xs uppercase tracking-[0.25em] text-mist/60">Predicted Next CO2</p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {formatCompactNumber(data.aiInsights.predictedNextPeriodCo2Kg)} kg
          </p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
          <div className="mb-4">
            <p className="text-lg font-medium text-white">Gas Emissions Trend</p>
            <p className="mt-1 text-sm text-mist/65">CO2, NOx, and SOx trends across selected period.</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartSeries}>
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
                <Line type="monotone" dataKey="co2Kg" stroke="#1cc28a" strokeWidth={3} dot={false} name="CO2 (kg)" />
                <Line type="monotone" dataKey="noxKg" stroke="#f3a712" strokeWidth={2.5} dot={false} name="NOx (kg)" />
                <Line type="monotone" dataKey="soxKg" stroke="#8ab4f8" strokeWidth={2.5} dot={false} name="SOx (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
          <p className="text-lg font-medium text-white">AI Emissions Insights</p>
          {/* AI insights are layered after emissions data fetch; fallback text is used if OpenAI is unavailable. */}
          <div className="mt-4 space-y-4 text-sm leading-7 text-mist/78">
            <p>{data.aiInsights.trendSummary}</p>
            <p>{data.aiInsights.anomalySummary}</p>
            <p className="text-signal">{data.aiInsights.optimizationRecommendation}</p>
          </div>
        </article>
      </section>

      <section className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
        <div className="mb-4">
          <p className="text-lg font-medium text-white">Emissions Records</p>
          <p className="mt-1 text-sm text-mist/65">
            Paginated report view for compliance tracking by equipment and greenhouse gas metrics.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-white/[0.03] text-left text-mist/55">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Equipment</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">CO2 (kg)</th>
                <th className="px-4 py-3">NOx (kg)</th>
                <th className="px-4 py-3">SOx (kg)</th>
                <th className="px-4 py-3">AI Insight</th>
              </tr>
            </thead>
            <tbody>
              {!pageSlice.length ? (
                <tr>
                  <td className="px-4 py-5 text-mist/70" colSpan={7}>
                    No emissions rows found for the selected filters.
                  </td>
                </tr>
              ) : null}
              {pageSlice.map((row) => (
                <tr key={row.id} className="border-t border-white/10 text-mist/80">
                  <td className="whitespace-nowrap px-4 py-3">{formatDateTime(row.measuredAt)}</td>
                  <td className="px-4 py-3 font-medium text-white">{row.equipmentName}</td>
                  <td className="px-4 py-3">{row.equipmentCategory}</td>
                  <td className="px-4 py-3">{row.co2Kg.toFixed(2)}</td>
                  <td className="px-4 py-3">{row.noxKg.toFixed(3)}</td>
                  <td className="px-4 py-3">{row.soxKg.toFixed(3)}</td>
                  <td className="max-w-sm px-4 py-3">{row.aiInsight ?? 'No anomaly detected.'}</td>
                </tr>
              ))}
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
              disabled={page <= 1}
              className="inline-flex items-center justify-center px-3"
              aria-label="Previous emissions page"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              disabled={page >= totalPages}
              className="inline-flex items-center justify-center px-3"
              aria-label="Next emissions page"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
