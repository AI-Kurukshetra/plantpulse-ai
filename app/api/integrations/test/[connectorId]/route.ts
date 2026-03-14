import { NextResponse } from 'next/server';
import { getIntegrationGatewayData } from '@/services/integrationGatewayService';

export async function GET(_: Request, { params }: { params: { connectorId: string } }) {
  const data = await getIntegrationGatewayData();
  const connector = data.connectors.find((item) => item.id === params.connectorId);

  if (!connector) {
    return NextResponse.json({ ok: false, error: 'Connector not found.' }, { status: 404 });
  }

  return NextResponse.json({
    ok: connector.status !== 'offline',
    connectorId: connector.id,
    systemName: connector.systemName,
    status: connector.status,
    latencyMs: connector.latencyMs,
    testedAt: new Date().toISOString()
  });
}
