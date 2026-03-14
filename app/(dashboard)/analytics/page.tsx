import { ProductionEfficiencyAnalytics } from '@/components/analytics/ProductionEfficiencyAnalytics';
import { createPageMetadata } from '@/lib/metadata';
import { getProductionEfficiencyDashboardData } from '@/services/productionService';

export const metadata = createPageMetadata(
  'Production Efficiency',
  'Production efficiency analytics for OEE, throughput, quality, and AI-driven bottleneck insights.'
);

export default async function AnalyticsPage() {
  const productionData = await getProductionEfficiencyDashboardData();

  return <ProductionEfficiencyAnalytics initialData={productionData} />;
}
