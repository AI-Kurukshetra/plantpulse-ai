import { ProductionEfficiencyAnalytics } from '@/components/analytics/ProductionEfficiencyAnalytics';
import { AppShell } from '@/components/layout/AppShell';
import { getCurrentRole } from '@/lib/auth';
import { createPageMetadata } from '@/lib/metadata';
import { getProductionEfficiencyDashboardData } from '@/services/productionService';

export const metadata = createPageMetadata(
  'Production Efficiency',
  'Production efficiency analytics for OEE, throughput, quality, and AI-driven bottleneck insights.'
);

export default async function AnalyticsPage() {
  const [productionData, role] = await Promise.all([getProductionEfficiencyDashboardData(), getCurrentRole()]);

  return (
    <AppShell
      title="Production Efficiency Analytics"
      subtitle="Track OEE, throughput, quality yield, and AI-predicted bottlenecks across production lines."
      role={role}
    >
      <ProductionEfficiencyAnalytics initialData={productionData} />
    </AppShell>
  );
}
