import { IntegrationGatewayDashboard } from '@/components/integrations/IntegrationGatewayDashboard';
import { createPageMetadata } from '@/lib/metadata';
import { getIntegrationGatewayData } from '@/services/integrationGatewayService';

export const metadata = createPageMetadata(
  'Integrations',
  'Integration API gateway surface for ERP, MES, SCADA, and historian connectivity.'
);

export default async function IntegrationsPage() {
  const data = await getIntegrationGatewayData();

  return <IntegrationGatewayDashboard data={data} />;
}
