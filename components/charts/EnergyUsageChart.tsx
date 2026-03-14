'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { EnergyPoint } from '@/types';

interface EnergyUsageChartProps {
  title: string;
  subtitle: string;
  data: EnergyPoint[];
  dataKey: 'usageKwh' | 'energyPerUnit';
  stroke: string;
  chartHeightClass?: string;
  showForecastNote?: boolean;
}

export function EnergyUsageChart({
  title,
  subtitle,
  data,
  dataKey,
  stroke,
  chartHeightClass = 'h-72',
  showForecastNote = true
}: EnergyUsageChartProps) {
  const hasForecastPoint = data.some((point) => point.aiForecast);

  return (
    <section className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
      <div className="mb-5">
        <p className="text-lg font-medium text-white">{title}</p>
        <p className="mt-1 text-sm text-mist/65">{subtitle}</p>
      </div>

      {/* Chart height is configurable so dashboard cards can align without extra whitespace. */}
      <div className={`${chartHeightClass} w-full`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="label" stroke="#9ab0c1" tickLine={false} axisLine={false} />
            <YAxis stroke="#9ab0c1" tickLine={false} axisLine={false} width={40} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#08141f',
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '16px'
              }}
            />
            <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Forecast note is shown when hybrid AI enrichment appended predictive points. */}
      {hasForecastPoint && showForecastNote ? (
        <p className="mt-3 text-xs uppercase tracking-[0.22em] text-signal">Includes AI forecast data point</p>
      ) : null}
    </section>
  );
}
