import { IntegrationGatewayDashboard } from '@/components/integrations/IntegrationGatewayDashboard';
import { AppShell } from '@/components/layout/AppShell';
import { getCurrentRole } from '@/lib/auth';
import { createPageMetadata } from '@/lib/metadata';
import { getIntegrationGatewayData } from '@/services/integrationGatewayService';

export const metadata = createPageMetadata(
  'Integrations',
  'Integration API gateway surface for ERP, MES, SCADA, and historian connectivity.'
);

export default async function IntegrationsPage() {
  const [role, data] = await Promise.all([getCurrentRole(), getIntegrationGatewayData()]);

  return (
    <AppShell
      title="Integration API Gateway"
      subtitle="Connectivity layer for enterprise manufacturing systems and industrial telemetry pipelines."
      role={role}
    >
      <IntegrationGatewayDashboard data={data} />
    </AppShell>
  );
}
