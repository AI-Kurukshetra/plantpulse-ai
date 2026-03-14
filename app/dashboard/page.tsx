import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { EquipmentStatusTable } from '@/components/dashboard/EquipmentStatusTable';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { PlantOverview } from '@/components/dashboard/PlantOverview';
import { EnergyUsageChart } from '@/components/charts/EnergyUsageChart';
import { AppShell } from '@/components/layout/AppShell';
import { getCurrentRole } from '@/lib/auth';
import { createPageMetadata } from '@/lib/metadata';
import { getAlerts } from '@/services/alertsService';
import { getEquipmentStatus } from '@/services/equipmentService';
import { getDailyEnergyConsumption, getDashboardMetrics, getHourlyEnergyConsumption } from '@/services/energyService';
import { getPrimaryPlant } from '@/services/plantService';
import { formatCompactNumber, formatPercent } from '@/utils/format';

export const metadata = createPageMetadata(
  'Dashboard',
  'PlantPulse AI dashboard with OEE, energy consumption, emissions, equipment health, and operational alerts.'
);

export default async function DashboardPage() {
  const [plant, equipment, alerts, hourlyEnergy, dailyEnergy] = await Promise.all([
    getPrimaryPlant(),
    getEquipmentStatus(),
    // Pull a larger alert set so compact preview + "See All" modal can share the same live data source.
    getAlerts(24),
    getHourlyEnergyConsumption(),
    getDailyEnergyConsumption()
  ]);
  const metrics = await getDashboardMetrics(equipment, alerts.filter((alert) => !alert.acknowledged).length);
  const role = await getCurrentRole();

  return (
    <AppShell
      title="Smart Plant Intelligence Platform"
      subtitle="PlantPulse AI combines OEE, energy consumption, emissions, equipment health, and alerts into a single plant operations view."
      role={role}
    >
      <div className="space-y-6">
        <PlantOverview plant={plant} />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="OEE" value={formatPercent(metrics.oee)} change={`${metrics.equipmentOnline}/${metrics.totalEquipment} assets online`} />
          <KpiCard
            label="Energy Consumption"
            value={`${formatCompactNumber(metrics.totalEnergyKwh)} kWh`}
            change={`${formatCompactNumber(metrics.throughput)} units tracked`}
            accent="amber"
          />
          <KpiCard
            label="Emissions"
            value={`${formatCompactNumber(metrics.emissionsKgCo2)} kg CO2`}
            change="Energy-normalized footprint"
          />
          <KpiCard
            label="Active Alerts"
            value={String(metrics.activeAlerts)}
            change="Requires triage"
            positive={false}
            accent="danger"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <EnergyUsageChart
            title="Energy Consumption"
            subtitle="Shift-level energy consumption trend for the current plant."
            data={hourlyEnergy}
            dataKey="usageKwh"
            stroke="#1cc28a"
            chartHeightClass="h-60"
            showForecastNote={false}
          />
          <AlertsPanel alerts={alerts} compact enableSeeAllModal maxVisible={2} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <EnergyUsageChart
            title="Daily Energy Intensity"
            subtitle="Seven-day energy per production unit trend."
            data={dailyEnergy}
            dataKey="energyPerUnit"
            stroke="#f3a712"
          />
          <EnergyUsageChart
            title="Daily Energy Demand"
            subtitle="Seven-day plant energy demand profile."
            data={dailyEnergy}
            dataKey="usageKwh"
            stroke="#1cc28a"
          />
        </section>

        <EquipmentStatusTable equipment={equipment} />
      </div>
    </AppShell>
  );
}
