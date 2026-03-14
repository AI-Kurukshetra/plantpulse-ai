'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { EnergyPoint } from '@/types';

export function EnergyCompositionChart({ data }: { data: EnergyPoint[] }) {
  return (
    <section className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
      <div className="mb-5">
        <p className="text-lg font-medium text-white">Hourly Energy vs Output</p>
        <p className="mt-1 text-sm text-mist/65">Production-aligned energy monitoring for the current shift.</p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
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
            <Bar dataKey="usageKwh" fill="#1cc28a" radius={[8, 8, 0, 0]} />
            <Bar dataKey="productionUnits" fill="#f3a712" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
