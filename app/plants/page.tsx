import { AppShell } from '@/components/layout/AppShell';
import { getCurrentRole } from '@/lib/auth';
import { createPageMetadata } from '@/lib/metadata';
import { getAlerts } from '@/services/alertsService';
import { getEquipmentStatus } from '@/services/equipmentService';
import { getDailyEnergyConsumption, getDashboardMetrics } from '@/services/energyService';
import { getPrimaryPlant } from '@/services/plantService';
import { formatCompactNumber, formatPercent } from '@/utils/format';

export const metadata = createPageMetadata(
  'Plants',
  'PlantPulse AI plant overview with site profile, OEE, energy demand, and active alert status.'
);

export default async function PlantsPage() {
  const [plant, equipment, alerts, dailyEnergy] = await Promise.all([
    getPrimaryPlant(),
    getEquipmentStatus(),
    getAlerts(),
    getDailyEnergyConsumption()
  ]);
  const metrics = await getDashboardMetrics(equipment, alerts.filter((alert) => !alert.acknowledged).length);
  const role = await getCurrentRole();

  return (
    <AppShell
      title="Plant Profile"
      subtitle="PlantPulse AI is currently scoped to a primary production site with a clean path to multi-plant expansion."
      role={role}
    >
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-panel">
        <p className="text-xs uppercase tracking-[0.35em] text-mist/50">Primary plant</p>
        <h3 className="mt-3 text-3xl font-semibold text-white">{plant.name}</h3>
        <p className="mt-2 text-mist/70">
          {plant.location} • Timezone {plant.timezone ?? 'UTC'} • OEE target {plant.targetOee}%
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-ink/50 p-4">
            <p className="text-sm text-mist/60">OEE</p>
            <p className="mt-2 text-2xl text-white">{formatPercent(metrics.oee)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-ink/50 p-4">
            <p className="text-sm text-mist/60">Weekly energy</p>
            <p className="mt-2 text-2xl text-white">
              {formatCompactNumber(dailyEnergy.reduce((sum, item) => sum + item.usageKwh, 0))} kWh
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-ink/50 p-4">
            <p className="text-sm text-mist/60">Open alerts</p>
            <p className="mt-2 text-2xl text-white">{metrics.activeAlerts}</p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
