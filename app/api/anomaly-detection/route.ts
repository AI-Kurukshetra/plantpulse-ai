import { NextResponse } from 'next/server';
import { getAnomalyDetectionDashboardData } from '@/services/anomalyService';

export async function GET() {
  const data = await getAnomalyDetectionDashboardData();
  return NextResponse.json({
    records: data.records,
    trend: data.trend,
    aiInsights: data.aiInsights
  });
}
