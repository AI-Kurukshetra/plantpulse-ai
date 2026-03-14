'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { EnergyUsageChart } from '@/components/charts/EnergyUsageChart';
import type { EnergyPoint, Equipment } from '@/types';
import { formatCompactNumber } from '@/utils/format';

type TimeRange = '24h' | '7d';

interface EnergyConsumptionAnalyticsProps {
  initialDailyEnergy: EnergyPoint[];
  initialEquipment: Equipment[];
  initialHourlyEnergy: EnergyPoint[];
}

type EnergyPayload = {
  dailyEnergy: EnergyPoint[];
  equipment: Equipment[];
  hourlyEnergy: EnergyPoint[];
};

function mapAreaFromCategory(category: string) {
  if (category.toLowerCase().includes('util')) return 'Utilities';
  if (category.toLowerCase().includes('pack')) return 'Packaging';
  if (category.toLowerCase().includes('mach')) return 'Machining';
  return 'Operations';
}

export function EnergyConsumptionAnalytics({
  initialDailyEnergy,
  initialEquipment,
  initialHourlyEnergy
}: EnergyConsumptionAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [typeFilter, setTypeFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hourlyEnergy, setHourlyEnergy] = useState(initialHourlyEnergy);
  const [dailyEnergy, setDailyEnergy] = useState(initialDailyEnergy);
  const [equipment, setEquipment] = useState(initialEquipment);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const pageSize = 6;

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Poll server-side energy endpoint so analytics stays current without manual refresh.
        const response = await fetch('/api/energy-consumption', { cache: 'no-store' });
        const payload = (await response.json()) as EnergyPayload;
        if (!response.ok) {
          throw new Error('Unable to refresh energy data.');
        }
        setHourlyEnergy(payload.hourlyEnergy);
        setDailyEnergy(payload.dailyEnergy);
        setEquipment(payload.equipment);
        setRefreshError(null);
      } catch {
        setRefreshError('Live refresh is temporarily unavailable. Showing most recent data.');
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  const categories = useMemo(() => Array.from(new Set(equipment.map((item) => item.category))), [equipment]);
  const areas = useMemo(() => Array.from(new Set(equipment.map((item) => mapAreaFromCategory(item.category)))), [equipment]);
  const chartData = timeRange === '24h' ? hourlyEnergy : dailyEnergy;

  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      const typeMatch = typeFilter === 'all' ? true : item.category === typeFilter;
      const areaMatch = areaFilter === 'all' ? true : mapAreaFromCategory(item.category) === areaFilter;
      return typeMatch && areaMatch;
    });
  }, [areaFilter, equipment, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEquipment.length / pageSize));
  const visibleEquipment = filteredEquipment.slice((page - 1) * pageSize, page * pageSize);

  const totalConsumption = chartData.reduce((sum, item) => sum + item.usageKwh, 0);
  const peakUsage = chartData.reduce((max, item) => Math.max(max, item.usageKwh), 0);
  const totalUnits = chartData.reduce((sum, item) => sum + item.productionUnits, 0);
  const energyPerUnit = totalUnits ? totalConsumption / totalUnits : 0;
  const avgUsage = chartData.length ? totalConsumption / chartData.length : 0;
  const anomalyCount = chartData.filter((item) => item.usageKwh > avgUsage * 1.2).length;
  const optimizationTip =
    dailyEnergy.find((item) => item.aiForecast && item.aiInsight)?.aiInsight ??
    'Use off-peak scheduling to lower demand spikes.';

  const onFilterChange = (update: () => void) => {
    update();
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-[22px] border border-white/10 bg-ink/50 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-mist/60">Total Consumption</p>
          <p className="mt-2 text-2xl font-semibold text-white">{formatCompactNumber(totalConsumption)} kWh</p>
        </article>
        <article className="rounded-[22px] border border-white/10 bg-ink/50 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-mist/60">Peak Usage</p>
          <p className="mt-2 text-2xl font-semibold text-white">{formatCompactNumber(peakUsage)} kWh</p>
        </article>
        <article className="rounded-[22px] border border-white/10 bg-ink/50 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-mist/60">Energy / Unit</p>
          <p className="mt-2 text-2xl font-semibold text-white">{energyPerUnit.toFixed(2)} kWh</p>
        </article>
        <article className="rounded-[22px] border border-white/10 bg-ink/50 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-mist/60">Anomalies</p>
          <p className="mt-2 text-2xl font-semibold text-white">{anomalyCount}</p>
        </article>
        <article className="rounded-[22px] border border-white/10 bg-ink/50 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-mist/60">AI Optimization</p>
          <p className="mt-2 text-sm text-signal">{optimizationTip}</p>
        </article>
      </section>

      <section className="grid gap-3 rounded-[24px] border border-white/10 bg-ink/50 p-4 md:grid-cols-3">
        {/* Filters for time range, equipment type, and plant area. */}
        <label className="rounded-2xl border border-white/10 bg-ink/60 px-3 py-2 text-sm text-mist/80">
          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-mist/55">Time range</span>
          <select
            className="w-full bg-transparent text-white outline-none"
            value={timeRange}
            onChange={(event) => onFilterChange(() => setTimeRange(event.target.value as TimeRange))}
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
          </select>
        </label>
        <label className="rounded-2xl border border-white/10 bg-ink/60 px-3 py-2 text-sm text-mist/80">
          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-mist/55">Equipment type</span>
          <select
            className="w-full bg-transparent text-white outline-none"
            value={typeFilter}
            onChange={(event) => onFilterChange(() => setTypeFilter(event.target.value))}
          >
            <option value="all">All types</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-ink/60 px-3 py-2 text-sm text-mist/80">
          <Filter className="h-4 w-4 text-mist/55" />
          <div className="w-full">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-mist/55">Plant area</span>
            <select
              className="w-full bg-transparent text-white outline-none"
              value={areaFilter}
              onChange={(event) => onFilterChange(() => setAreaFilter(event.target.value))}
            >
              <option value="all">All areas</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </label>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <EnergyUsageChart
          title="Energy Consumption Trend"
          subtitle="Live consumption trend across selected time window."
          data={chartData}
          dataKey="usageKwh"
          stroke="#1cc28a"
          chartHeightClass="h-64"
        />
        <EnergyUsageChart
          title="Energy Intensity"
          subtitle="Energy usage per production unit for optimization tracking."
          data={chartData}
          dataKey="energyPerUnit"
          stroke="#f3a712"
          chartHeightClass="h-64"
        />
      </section>

      <section className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
        <div className="mb-5">
          <p className="text-lg font-medium text-white">Equipment Energy Breakdown</p>
          <p className="mt-1 text-sm text-mist/65">
            Live equipment-level energy usage with AI guidance and filtered view controls.
          </p>
          {refreshError ? <p className="mt-2 text-xs text-amber">{refreshError}</p> : null}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-mist/50">
              <tr className="border-b border-white/10">
                <th className="pb-3">Equipment</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Area</th>
                <th className="pb-3">Energy</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">AI Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {visibleEquipment.map((item) => (
                <tr key={item.id} className="border-b border-white/5 text-mist/80 last:border-none">
                  <td className="py-4 text-white">{item.name}</td>
                  <td className="py-4">{item.category}</td>
                  <td className="py-4">{mapAreaFromCategory(item.category)}</td>
                  <td className="py-4">{item.energyKwh.toFixed(1)} kWh</td>
                  <td className="py-4 capitalize">{item.status}</td>
                  <td className="py-4 text-xs text-signal">
                    {item.aiInsight?.recommendation ?? 'No active recommendation'}
                  </td>
                </tr>
              ))}
              {!visibleEquipment.length ? (
                <tr>
                  <td className="py-4 text-mist/70" colSpan={6}>
                    No equipment records match the selected filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.22em] text-mist/55">
            Page {page} of {totalPages} • {filteredEquipment.length} records
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous energy table page"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-mist/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next energy table page"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-mist/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
