import { NextResponse } from 'next/server';
import { getIntegrationGatewayData } from '@/services/integrationGatewayService';

export async function GET() {
  const data = await getIntegrationGatewayData();
  return NextResponse.json({
    status: 'ok',
    connectors: data.connectors
  });
}
