import { Activity, AlertTriangle, Gauge, Leaf, Radar, Zap } from 'lucide-react';
import { StateBadge } from '@/components/common/StateBadge';
import { Card, CardContent } from '@/components/ui/card';

const kpis = [
  { label: 'OEE', value: '91.8%', change: '+4.2%', icon: Gauge },
  { label: 'Energy / Unit', value: '3.4 kWh', change: '-11%', icon: Zap },
  { label: 'CO2 Intensity', value: '0.86 kg', change: '-9%', icon: Leaf },
  { label: 'Risk Alerts', value: '03', change: '1 critical', icon: AlertTriangle }
];

const equipment = [
  { name: 'Line 01 Press', health: '96%', status: 'Stable' },
  { name: 'Boiler West', health: '82%', status: 'Inspect' },
  { name: 'Cooling Cell B', health: '89%', status: 'Watch' }
];

export function DashboardPreview() {
  return (
    // Fixed-height preview keeps hero media balanced across breakpoints.
    <Card className="relative overflow-hidden border-white/12 bg-[#08141f]/88 lg:max-h-[760px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(28,194,138,0.22),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(243,167,18,0.16),transparent_28%)]" />
      <CardContent className="relative p-5 sm:p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-signal">Live command layer</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Unified plant control view</h3>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-mist/70">
            248 active sensors
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;

            return (
              <div key={kpi.label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-mist/65">{kpi.label}</span>
                  <Icon className="h-4 w-4 text-signal" />
                </div>
                <div className="mt-3 text-2xl font-semibold text-white">{kpi.value}</div>
                <div className="mt-1 text-sm text-signal">{kpi.change}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-mist/55">Sensor trend matrix</p>
                <h4 className="mt-2 text-lg font-medium text-white">Energy, vibration, and output correlation</h4>
              </div>
              <Radar className="h-5 w-5 text-signal" />
            </div>

            <div className="mt-6 grid grid-cols-12 gap-2">
              {[64, 72, 68, 74, 79, 82, 76, 89, 84, 78, 92, 88].map((value, index) => (
                <div key={index} className="flex flex-col justify-end">
                  <div
                    className="rounded-t-full bg-gradient-to-t from-signal via-[#79e2bf] to-[#d7fff0]"
                    style={{ height: `${value * 1.2}px` }}
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-[#0d1a28] p-3">
                <p className="text-xs uppercase tracking-[0.25em] text-mist/50">Temperature drift</p>
                <p className="mt-2 text-xl font-semibold text-white">+2.1 C</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0d1a28] p-3">
                <p className="text-xs uppercase tracking-[0.25em] text-mist/50">Vibration spike</p>
                <p className="mt-2 text-xl font-semibold text-white">3.8 mm/s</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0d1a28] p-3">
                <p className="text-xs uppercase tracking-[0.25em] text-mist/50">Yield uplift</p>
                <p className="mt-2 text-xl font-semibold text-white">+6.4%</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-mist/55">Alerts panel</p>
                  <h4 className="mt-2 text-lg font-medium text-white">AI-prioritized interventions</h4>
                </div>
                <AlertTriangle className="h-5 w-5 text-amber" />
              </div>
              <div className="mt-4 space-y-3">
                {[
                  'Boiler West efficiency drift detected',
                  'CNC spindle anomaly exceeds learned baseline',
                  'Compressed air demand anomaly on Line 01'
                ].map((item, index) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-[#0d1a28] p-3 text-sm text-mist/74">
                    <div className="flex items-center justify-between gap-3">
                      <span>{item}</span>
                      <StateBadge value={index === 1 ? 'critical' : index === 0 ? 'warning' : 'info'} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-mist/55">Equipment health</p>
                  <h4 className="mt-2 text-lg font-medium text-white">Asset risk ladder</h4>
                </div>
                <Activity className="h-5 w-5 text-signal" />
              </div>
              <div className="mt-4 space-y-3">
                {equipment.map((asset) => (
                  <div key={asset.name} className="rounded-2xl border border-white/10 bg-[#0d1a28] p-3">
                    <div className="flex items-center justify-between text-sm text-white">
                      <span>{asset.name}</span>
                      <span className="text-mist/65">{asset.health}</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-signal via-[#79e2bf] to-amber"
                        style={{ width: asset.health }}
                      />
                    </div>
                    <StateBadge
                      value={asset.status === 'Stable' ? 'running' : asset.status === 'Inspect' ? 'maintenance' : 'warning'}
                      label={asset.status}
                      className="mt-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
